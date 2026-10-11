#!/usr/bin/env node
// Publish the local gift list to the Worker's R2 bucket.
//
// Usage:
//   node scripts/upload-gifts.mjs [path-to-gifts.json]
//
// Reads resources/gifts.json (override with an argument), validates it, then
// POSTs it to /api/gifts/admin on VITE_SITE_URL using GIFT_ADMIN_SECRET.

import fs from 'node:fs';
import path from 'node:path';
import { loadEnvFile, repoPath } from './lib/env.mjs';

const ADMIN_HEADER = 'x-gift-admin-key';

function defaultRegistryPath() {
  const local = repoPath('resources', 'gifts.json');
  return fs.existsSync(local) ? local : repoPath('resources', 'gifts.example.json');
}

function requireConfig() {
  const env = loadEnvFile();
  const adminSecret = process.env.GIFT_ADMIN_SECRET || env.GIFT_ADMIN_SECRET;
  if (!adminSecret) {
    throw new Error(
      'Missing GIFT_ADMIN_SECRET. Generate one (e.g. `openssl rand -hex 32`), store it in `.env.local`, ' +
        'and set it as the Cloudflare Worker secret of the same name.'
    );
  }

  const siteUrl = process.env.VITE_SITE_URL || env.VITE_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      'Missing VITE_SITE_URL in .env.local. Set it to the worker URL you are publishing to ' +
        '(e.g. https://rjheiraten-berlin.de).'
    );
  }

  return { adminSecret, siteUrl: siteUrl.replace(/\/+$/, '') };
}

function readRegistry(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing ${filePath}. Copy resources/gifts.example.json to resources/gifts.json and edit it.`
    );
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateRegistry(registry, filePath) {
  const fail = (reason) => {
    throw new Error(`${filePath} is not a valid gift list: ${reason}`);
  };

  if (!registry || typeof registry !== 'object') fail('expected a JSON object');
  if (!Array.isArray(registry.items)) fail('items must be an array');

  const ids = new Set();
  registry.items.forEach((item, index) => {
    const label = `items[${index}]`;
    if (!item || typeof item !== 'object') fail(`${label} must be an object`);
    if (typeof item.id !== 'string' || !item.id) fail(`${label}.id must be a non-empty string`);
    if (ids.has(item.id)) fail(`duplicate id "${item.id}"`);
    ids.add(item.id);
    if (!item.title || typeof item.title !== 'object') fail(`${label}.title must hold one string per locale`);
    if (!item.description || typeof item.description !== 'object') {
      fail(`${label}.description must hold one string per locale`);
    }
  });
}

async function upload(siteUrl, adminSecret, registry) {
  const response = await fetch(`${siteUrl}/api/gifts/admin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', [ADMIN_HEADER]: adminSecret },
    body: JSON.stringify(registry)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${payload.error ?? 'unknown error'}`);
  }
  return payload;
}

const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultRegistryPath();
const registry = readRegistry(filePath);
validateRegistry(registry, filePath);

const { adminSecret, siteUrl } = requireConfig();
await upload(siteUrl, adminSecret, registry);

console.log(`Published ${registry.items.length} gift items to ${siteUrl}`);
