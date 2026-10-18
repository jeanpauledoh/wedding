// Dev-only stand-in for the Worker's gift registry routes. Serves /api/gifts
// straight from resources/gifts.json so the app is usable without R2 or an
// invite token. The file is re-read on every request, so editing gifts.json is
// picked up on reload.
//
// Reservations are kept in memory only, so they vanish when the dev server
// restarts. That is the point: local state should never leak into the bucket.

import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const REGISTRY_PATH = 'resources/gifts.json';
const GIFTS_PATH = '/api/gifts';
const RESERVE_PATH = '/api/gifts/reserve';

interface Registry {
  items: GiftItem[];
}

interface GiftItem {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  link?: string | null;
  active?: boolean;
}

// Mirrors the Worker's shape: an id mapped to when it was taken.
const reservations = new Map<string, string>();

function readRegistryFile(root: string): Registry {
  const file = path.join(root, REGISTRY_PATH);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${REGISTRY_PATH}. Copy resources/gifts.example.json to it.`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Registry;
}

function send(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

function reservationsObject(): Record<string, { reservedAt: string }> {
  return Object.fromEntries([...reservations].map(([id, reservedAt]) => [id, { reservedAt }]));
}

export function giftRegistryDevApi(): Plugin {
  return {
    name: 'wedding:gift-registry-dev-api',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;

      server.middlewares.use(async (request, response, next) => {
        if (request.url !== GIFTS_PATH && request.url !== RESERVE_PATH) return next();

        try {
          const registry = readRegistryFile(root);

          if (request.method === 'GET' && request.url === GIFTS_PATH) {
            const items = registry.items.map((item) => ({
              ...item,
              reserved: reservations.has(item.id)
            }));
            return send(response, 200, { ok: true, registry: { items } });
          }

          if (request.method === 'POST' && request.url === RESERVE_PATH) {
            const payload = await readJsonBody(request);
            const id =
              payload && typeof payload === 'object' && typeof (payload as { id?: unknown }).id === 'string'
                ? (payload as { id: string }).id
                : '';
            if (!id) return send(response, 400, { ok: false, error: 'Expected an item id' });

            const known = registry.items.some((item) => item.id === id && item.active !== false);
            if (!known) return send(response, 404, { ok: false, error: 'Unknown gift' });

            // The Worker makes this atomic with a conditional write; in dev the
            // event loop is single-threaded, so a plain check is enough.
            if (reservations.has(id)) {
              return send(response, 409, { ok: false, error: 'already_reserved' });
            }

            reservations.set(id, new Date().toISOString());
            return send(response, 200, { ok: true, reservations: reservationsObject() });
          }

          send(response, 405, { ok: false, error: 'Method not allowed' });
        } catch (error) {
          server.config.logger.error(`[gifts] ${error instanceof Error ? error.message : String(error)}`);
          send(response, 500, { ok: false, error: 'Gift registry unavailable' });
        }
      });
    }
  };
}
