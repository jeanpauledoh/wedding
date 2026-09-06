import { landing } from './landing';

interface Env {
  TOKEN_SECRET: string;
  ORIGIN?: string;
}

// GitHub Pages origin. The worker proxies requests with the Host header set to
// the visitor's custom domain so GitHub serves the right project.
const DEFAULT_ORIGIN = 'https://jeanpauledoh.github.io';

const COOKIE_NAME = 'wedding_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

// Paths the landing page needs that are safe to serve without a token.
const PUBLIC_PATH = /^\/(hero\.jpg|favicon\.(ico|png)|robots\.txt)$/;

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

    // 2) Valid session cookie -> proxy the app (injecting variant meta on HTML).
    const cookieToken = getCookie(request, COOKIE_NAME);
    if (cookieToken) {
      const guest = await verifyToken(cookieToken, env.TOKEN_SECRET);
      if (guest) return proxyOrigin(request, guest, origin);
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

async function proxyOrigin(request: Request, guest: Guest | null, origin: string): Promise<Response> {
  const url = new URL(request.url);
  const originUrl = `${origin}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Host', request.headers.get('host') || url.host);
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
    const injected = body.replace('</head>', `${metaTags(guest)}</head>`);
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

function metaTags(guest: Guest): string {
  const name = guest.name.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  return `<meta name="wedding:variant" content="${guest.variant}"><meta name="wedding:name" content="${name}">`;
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