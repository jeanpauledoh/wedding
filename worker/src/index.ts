import { landing } from './landing';
import { Zip, ZipPassThrough } from 'fflate';

interface Env {
  TOKEN_SECRET: string;
  ORIGIN?: string;
  /** R2 bucket for guest photo uploads. Absent while the feature is disabled. */
  PHOTOS?: R2Bucket;
  /** R2 bucket holding the gift registry document. Absent while the feature is off. */
  GIFTS?: R2Bucket;
  /** Shared secret guarding the gift registry admin route. */
  GIFT_ADMIN_SECRET?: string;
  /** "true" enables the downloadable ZIP album endpoint /api/album. */
  GALLERY_ENABLED?: string;
}

// The gated app is served through a Cloudflare zone route on this host. The
// worker fetches the same host: Cloudflare sends same-zone fetches to the
// GitHub Pages origin instead of re-invoking the worker, so there is no loop.
const DEFAULT_ORIGIN = 'https://rjheiraten-berlin.de';

const COOKIE_NAME = 'wedding_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

// Paths the landing page needs that are safe to serve without a token.
const PUBLIC_PATH = /^\/(hero\.jpg|favicon\.(ico|png)|robots\.txt)$/;

const GIFTS_PATH = '/api/gifts';
const GIFT_RESERVE_PATH = '/api/gifts/reserve';
const GIFT_ADMIN_PATH = '/api/gifts/admin';
const GIFT_ADMIN_HEADER = 'x-gift-admin-key';
// The admin reservations route: the bare path clears everything, a trailing
// id segment clears just that gift.
const GIFT_ADMIN_RESERVATIONS_RE = /^\/api\/gifts\/admin\/reservations(\/[^/]+)?$/;
const GIFT_REGISTRY_KEY = 'registry/gifts.json';

// Reservations live in their own object: the admin publish rewrites the
// registry wholesale, so storing them there would lose every reservation.
const GIFT_RESERVATIONS_KEY = 'registry/reservations.json';

// R2 has no locks, so a first-come-first-served write is a conditional put on
// the etag we read. Losing a race means re-reading and trying again.
const RESERVE_MAX_ATTEMPTS = 3;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = (env.ORIGIN || DEFAULT_ORIGIN).replace(/\/+$/, '');

    // 1) Magic link / access code present -> validate.
    const token = url.searchParams.get('t');
    if (token) {
      const guest = await verifyToken(token, env.TOKEN_SECRET);
      if (guest) {
        url.searchParams.delete('t');
        const cleanUrl = url.pathname + (url.search ? url.search : '');
        return new Response(null, {
          status: 302,
          headers: {
            Location: cleanUrl,
            'Set-Cookie': cookieFor(guest, token, url.protocol === 'https:'),
            'Cache-Control': 'no-store'
          }
        });
      }
      // Invalid, expired or tampered.
      return html(landing(url.origin, true), 200);
    }

    // 2) Guest routes. The admin upload is a maintenance call from the local
    // script, so it authenticates with its own secret instead of a guest cookie.
    if (url.pathname === GIFT_ADMIN_PATH) {
      return handleGiftRegistryAdmin(request, env);
    }
    // /api/gifts/admin/reservations clears all, .../reservations/<id> one.
    if (GIFT_ADMIN_RESERVATIONS_RE.test(url.pathname)) {
      return handleGiftReservationsAdmin(url.pathname, request, env);
    }

    const cookieToken = getCookie(request, COOKIE_NAME);
    if (cookieToken) {
      const guest = await verifyToken(cookieToken, env.TOKEN_SECRET);
      if (guest) {
        if (url.pathname === '/api/upload' && request.method === 'POST') {
          return handleUpload(request, guest, env);
        }
        if (url.pathname === '/api/gallery' && request.method === 'GET') {
          return handleGallery(env);
        }
        if (url.pathname.startsWith('/api/photo/') && request.method === 'GET') {
          return handlePhoto(url.pathname, env);
        }
        if (url.pathname === '/api/album' && request.method === 'GET') {
          return handleAlbum(env);
        }
        if (url.pathname === GIFTS_PATH && request.method === 'GET') {
          return handleGiftRegistry(env);
        }
        if (url.pathname === GIFT_RESERVE_PATH && request.method === 'POST') {
          return handleGiftReserve(request, env);
        }
        return proxyOrigin(request, guest, origin, Boolean(env.PHOTOS));
      }
    }

    // 3) Public assets the landing page itself needs.
    if (PUBLIC_PATH.test(url.pathname)) {
      return proxyOrigin(request, null, origin);
    }

    // 4) Everything else -> landing page (no app bundle is ever fetched).
    const wantsHtml =
      url.pathname === '/' ||
      /\.(html?)$/.test(url.pathname) ||
      (request.headers.get('accept') || '').includes('text/html');
    if (!wantsHtml) return new Response('Not found', { status: 404 });
    return html(landing(url.origin, false), 200);
  }
};

async function proxyOrigin(
  request: Request,
  guest: Guest | null,
  origin: string,
  photosEnabled = false
): Promise<Response> {
  const url = new URL(request.url);
  const originUrl = `${origin}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('cookie');

  let response: Response;
  try {
    response = await fetch(originUrl, {
      method: request.method,
      headers,
      redirect: 'manual'
    });
  } catch {
    return new Response('Upstream error', { status: 502 });
  }

  // 3xx from the origin: forward as-is so the browser lands back on our domain
  // and the gate stays in front.
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const isHtml = (response.headers.get('content-type') || '').includes('text/html');

  if (isHtml && guest) {
    const body = await response.text();
    const injected = body.replace('</head>', `${metaTags(guest, photosEnabled)}</head>`);
    return new Response(injected, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }

  const out = new Headers(response.headers);
  out.delete('content-length');
  out.set('cache-control', guest ? 'no-store' : 'public, max-age=3600');
  return new Response(response.body, { status: response.status, headers: out });
}

interface Guest {
  variant: 'vows' | 'party';
  name: string;
}

const UPLOAD_ROOT = 'guest-uploads';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per image (client compresses before upload)

async function handleUpload(request: Request, guest: Guest, env: Env): Promise<Response> {
  if (!env.PHOTOS) return json({ ok: false, error: 'Uploads are disabled' }, 404);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Expected multipart form data' }, 400);
  }

  const files = form
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return json({ ok: false, error: 'No files provided' }, 400);
  }

  const folder = sanitizeKey(guest.name) || 'guest';
  const uploaded: { key: string; size: number }[] = [];
  let skipped = 0;

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      skipped += 1;
      continue;
    }

    const key = `${UPLOAD_ROOT}/${folder}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file.type)}`;
    await env.PHOTOS.put(key, file, {
      httpMetadata: { contentType: file.type }
    });
    uploaded.push({ key, size: file.size });
  }

  if (uploaded.length === 0) {
    return json({ ok: false, error: 'No valid images to upload', skipped }, 400);
  }

  return json({ ok: true, count: uploaded.length, skipped, uploaded }, 201);
}

// Placeholder for a future guest-photo gallery: lists every uploaded object.
// URLs are constructed by the frontend from the R2.dev public base once enabled.
async function handleGallery(env: Env): Promise<Response> {
  if (!env.PHOTOS) return json({ ok: false, error: 'Gallery is disabled' }, 404);

  const list = await env.PHOTOS.list({ prefix: `${UPLOAD_ROOT}/` });
  const photos = list.objects.map((object) => ({
    key: object.key,
    size: object.size,
    uploaded: object.uploaded.toISOString()
  }));

  return json({ ok: true, count: photos.length, photos }, 200);
}

// Serves a single uploaded image to authenticated guests. The image URL is
// derived from the object key, which is unguessable (contains a UUID).
async function handlePhoto(pathname: string, env: Env): Promise<Response> {
  if (!env.PHOTOS) return json({ ok: false, error: 'Photos are disabled' }, 404);

  let key: string;
  try {
    key = decodeURIComponent(pathname.slice('/api/photo/'.length));
  } catch {
    return json({ ok: false, error: 'Invalid key' }, 400);
  }
  if (!key.startsWith(`${UPLOAD_ROOT}/`) || key.split('/').includes('..')) {
    return json({ ok: false, error: 'Invalid key' }, 400);
  }

  const object = await env.PHOTOS.get(key);
  if (!object) return json({ ok: false, error: 'Not found' }, 404);

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'application/octet-stream',
      'cache-control': 'private, max-age=3600'
    }
  });
}

// Streams a ZIP of every uploaded photo. JPEGs are already compressed, so they
// are stored as-is inside the archive (no recompression, no buffering).
async function handleAlbum(env: Env): Promise<Response> {
  if (!env.PHOTOS || env.GALLERY_ENABLED !== 'true') {
    return json({ ok: false, error: 'Album is disabled' }, 404);
  }

  const list = await env.PHOTOS.list({ prefix: `${UPLOAD_ROOT}/` });
  if (list.objects.length === 0) {
    return json({ ok: false, error: 'No photos uploaded yet' }, 404);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const zip = new Zip((err, data, final) => {
        if (err) {
          controller.error(err);
          return;
        }
        if (data) controller.enqueue(data);
        if (final) controller.close();
      });

      try {
        for (const object of list.objects) {
          const entry = await env.PHOTOS!.get(object.key);
          if (!entry?.body) continue;

          const pass = new ZipPassThrough(object.key);
          zip.add(pass);

          const reader = entry.body.getReader();
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) {
                pass.push(new Uint8Array(0), true);
                break;
              }
              pass.push(value, false);
            }
          } finally {
            reader.releaseLock();
          }
        }
        zip.end();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="wedding-album-${date}.zip"`,
      'cache-control': 'no-store'
    }
  });
}

interface GiftRegistry {
  items: GiftItem[];
}

interface GiftItem {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  link?: string | null;
  active?: boolean;
}

async function handleGiftRegistry(env: Env): Promise<Response> {
  const registry = await readGiftRegistry(env);
  if (!registry.ok) return registry.response;

  // Reservations are anonymous: only the timestamp is kept, never who took it.
  const reservations = await readGiftReservations(env);
  const taken = reservations.ok ? reservations.data.reservations : {};
  const items = registry.registry.items.map((item) => ({
    ...item,
    reserved: Object.hasOwn(taken, item.id)
  }));

  return json({ ok: true, registry: { items } }, 200);
}

// Reserves a gift for the guest holding the cookie. First come, first served:
// the write is conditional on the document we read, so a concurrent reservation
// loses the race instead of silently overwriting the winner.
async function handleGiftReserve(request: Request, env: Env): Promise<Response> {
  if (!env.GIFTS) return json({ ok: false, error: 'Gifts are disabled' }, 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Expected JSON body' }, 400);
  }
  const id = isRecord(payload) && typeof payload.id === 'string' ? payload.id : '';
  if (!id) return json({ ok: false, error: 'Expected an item id' }, 400);

  const registry = await readGiftRegistry(env);
  if (!registry.ok) return registry.response;
  if (!registry.registry.items.some((item) => item.id === id && item.active !== false)) {
    return json({ ok: false, error: 'Unknown gift' }, 404);
  }

  const result = await updateReservations(env, (current) => {
    if (Object.hasOwn(current.reservations, id)) return conflict(409, 'already_reserved');
    return write({
      reservations: { ...current.reservations, [id]: { reservedAt: new Date().toISOString() } }
    });
  });

  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true, reservations: result.reservations }, 200);
}

async function handleGiftReservationsAdmin(
  pathname: string,
  request: Request,
  env: Env
): Promise<Response> {
  const presented = request.headers.get(GIFT_ADMIN_HEADER);
  if (!isAdminAuthorized(presented, env.GIFT_ADMIN_SECRET)) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }
  if (request.method !== 'DELETE') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const match = pathname.match(GIFT_ADMIN_RESERVATIONS_RE);
  const id = match?.[1] ? decodeURIComponent(match[1].slice(1)) : '';

  const result = await updateReservations(env, (current) => {
    if (!id) return write({ reservations: {} }); // bare path frees everything
    if (!Object.hasOwn(current.reservations, id)) return conflict(404, 'Not reserved');
    const reservations = { ...current.reservations };
    delete reservations[id];
    return write({ reservations });
  });

  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true, reservations: result.reservations }, 200);
}

async function handleGiftRegistryAdmin(request: Request, env: Env): Promise<Response> {
  const presented = request.headers.get(GIFT_ADMIN_HEADER);
  if (!isAdminAuthorized(presented, env.GIFT_ADMIN_SECRET)) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    // The couple's view: the list plus what has been taken, and when.
    const registry = await readGiftRegistry(env);
    if (!registry.ok) return registry.response;
    const reservations = await readGiftReservations(env);
    if (!reservations.ok) return json({ ok: false, error: 'Stored reservations are invalid' }, 500);
    return json(
      { ok: true, registry: registry.registry, reservations: reservations.data.reservations },
      200
    );
  }

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Expected JSON body' }, 400);
  }

  const registry = parseGiftRegistry(payload);
  if (!registry) return json({ ok: false, error: 'Invalid gift registry' }, 400);

  await writeGiftRegistry(env, registry);
  return json({ ok: true, count: registry.items.length }, 200);
}

function isAdminAuthorized(presented: string | null, secret: string | undefined): boolean {
  if (!secret || !presented) return false;
  return timingSafeEqual(presented, secret);
}

async function readGiftRegistry(
  env: Env
): Promise<{ ok: true; registry: GiftRegistry } | { ok: false; response: Response }> {
  if (!env.GIFTS) return { ok: false, response: json({ ok: false, error: 'Gifts are disabled' }, 404) };

  const object = await env.GIFTS.get(GIFT_REGISTRY_KEY);
  if (!object) return { ok: false, response: json({ ok: false, error: 'Gift list not published yet' }, 404) };

  const registry = parseGiftRegistry(await readJsonBody(object));
  if (!registry) return { ok: false, response: json({ ok: false, error: 'Stored gift list is invalid' }, 500) };
  return { ok: true, registry };
}

async function writeGiftRegistry(env: Env, registry: GiftRegistry): Promise<void> {
  await env.GIFTS!.put(GIFT_REGISTRY_KEY, JSON.stringify(registry), {
    httpMetadata: { contentType: 'application/json' }
  });
}

interface Reservation {
  reservedAt: string;
}

interface GiftReservations {
  reservations: Record<string, Reservation>;
}

// Deciding what to store, separated from storing it so the guest route and the
// admin route share one concurrency-safe write path.
type ReservationDecision =
  | { kind: 'write'; reservations: GiftReservations }
  | { kind: 'conflict'; status: number; error: string };

type ReservationResult =
  | { ok: true; reservations: Record<string, Reservation> }
  | { ok: false; status: number; error: string };

function write(reservations: GiftReservations): ReservationDecision {
  return { kind: 'write', reservations };
}

function conflict(status: number, error: string): ReservationDecision {
  return { kind: 'conflict', status, error };
}

// Read, decide, conditionally write; repeat when another request landed in
// between. R2 has no transactions, so this loop is the whole guarantee.
async function updateReservations(
  env: Env,
  decide: (current: GiftReservations) => ReservationDecision
): Promise<ReservationResult> {
  for (let attempt = 0; attempt < RESERVE_MAX_ATTEMPTS; attempt++) {
    const current = await readGiftReservations(env);
    if (!current.ok) {
      return { ok: false, status: 500, error: 'Stored reservations are invalid' };
    }

    const decision = decide(current.data);
    if (decision.kind === 'conflict') {
      return { ok: false, status: decision.status, error: decision.error };
    }

    if (await writeGiftReservations(env, decision.reservations, current.etag)) {
      return { ok: true, reservations: decision.reservations.reservations };
    }
  }
  return { ok: false, status: 409, error: 'Try again' };
}

// A missing object reads as "nothing reserved yet" rather than an error, so the
// bucket never needs seeding by hand.
async function readGiftReservations(
  env: Env
): Promise<{ ok: true; data: GiftReservations; etag: string | null } | { ok: false }> {
  if (!env.GIFTS) return { ok: false };

  const object = await env.GIFTS.get(GIFT_RESERVATIONS_KEY);
  if (!object) return { ok: true, data: { reservations: {} }, etag: null };

  const parsed = parseGiftReservations(await readJsonBody(object));
  if (!parsed) return { ok: false };
  return { ok: true, data: parsed, etag: object.etag };
}

// Returns false when the precondition failed, which means someone else wrote
// first and the caller should re-read rather than assume it won.
async function writeGiftReservations(
  env: Env,
  reservations: GiftReservations,
  etag: string | null
): Promise<boolean> {
  const onlyIf =
    etag === null
      // Nothing stored yet. If-None-Match: * succeeds only while the object is
      // absent, so two guests racing for the very first write cannot both win.
      ? new Headers({ 'if-none-match': '*' })
      : { etagMatches: etag };

  const written = await env.GIFTS!.put(GIFT_RESERVATIONS_KEY, JSON.stringify(reservations), {
    onlyIf,
    httpMetadata: { contentType: 'application/json' }
  });
  return written !== null;
}

function parseGiftReservations(payload: unknown): GiftReservations | null {
  if (!isRecord(payload) || !isRecord(payload.reservations)) return null;

  const reservations: Record<string, Reservation> = {};
  for (const [id, entry] of Object.entries(payload.reservations)) {
    if (!isRecord(entry) || typeof entry.reservedAt !== 'string') return null;
    reservations[id] = { reservedAt: entry.reservedAt };
  }
  return { reservations };
}

async function readJsonBody(object: R2ObjectBody): Promise<unknown> {
  try {
    return JSON.parse(await object.text());
  } catch {
    return null;
  }
}

function parseGiftRegistry(payload: unknown): GiftRegistry | null {
  if (!isRecord(payload)) return null;
  if (!Array.isArray(payload.items)) return null;

  const items: GiftItem[] = [];
  const seenIds = new Set<string>();

  for (const candidate of payload.items) {
    const item = parseGiftItem(candidate);
    if (!item || seenIds.has(item.id)) return null;
    seenIds.add(item.id);
    items.push(item);
  }

  return { items };
}

function parseGiftItem(candidate: unknown): GiftItem | null {
  if (!isRecord(candidate)) return null;
  if (typeof candidate.id !== 'string' || !candidate.id) return null;
  if (!isLocalizedText(candidate.title)) return null;
  if (!isLocalizedText(candidate.description)) return null;

  return {
    id: candidate.id,
    title: candidate.title,
    description: candidate.description,
    link: typeof candidate.link === 'string' ? candidate.link : null,
    active: candidate.active !== false
  };
}

function isLocalizedText(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) return false;
  return Object.values(value).every((text) => typeof text === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extensionFor(type: string): string {
  switch (type) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'jpg';
  }
}

function sanitizeKey(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9\u00C0-\u024F_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function verifyToken(token: string, secret: string): Promise<Guest | null> {
  if (!secret) return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  if (!timingSafeEqual(toHex(expected), signature)) return null;

  let data: { v?: string; n?: string; exp?: number };
  try {
    data = JSON.parse(urlDecode(payload));
  } catch {
    return null;
  }
  if (data.v !== 'vows' && data.v !== 'party') return null;

  return {
    variant: data.v,
    name: typeof data.n === 'string' ? data.n.slice(0, 40) : ''
  };
}

function metaTags(guest: Guest, photosEnabled: boolean): string {
  const name = guest.name.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const photos = photosEnabled ? '<meta name="wedding:photos" content="on">' : '';
  return `<meta name="wedding:variant" content="${guest.variant}"><meta name="wedding:name" content="${name}">${photos}`;
}

function cookieFor(guest: Guest, token: string, secure: boolean): string {
  const flags = [`${COOKIE_NAME}=${token}`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=${COOKIE_MAX_AGE}`];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

function getCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

function urlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return decoder.decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function html(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}