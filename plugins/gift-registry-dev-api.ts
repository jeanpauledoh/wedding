// Dev-only stand-in for the Worker's gift registry route. Serves /api/gifts
// straight from resources/gifts.json so the app is usable without R2 or an
// invite token. The file is re-read on every request, so editing gifts.json is
// picked up on reload.

import fs from 'node:fs';
import path from 'node:path';
import type { ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const REGISTRY_PATH = 'resources/gifts.json';
const GIFTS_PATH = '/api/gifts';

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

export function giftRegistryDevApi(): Plugin {
  return {
    name: 'wedding:gift-registry-dev-api',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;

      server.middlewares.use((request, response, next) => {
        if (request.url !== GIFTS_PATH) return next();

        try {
          if (request.method === 'GET') {
            return send(response, 200, { ok: true, registry: readRegistryFile(root) });
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
