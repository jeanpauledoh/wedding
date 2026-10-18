#!/usr/bin/env node
// Free a reserved gift again, or clear every reservation.
//
// Usage:
//   node scripts/clear-reservation.mjs <gift-id>
//   node scripts/clear-reservation.mjs --all
//
// Reservations are first come, first served, so this is deliberately a manual
// maintenance call for the couple: a guest drops out, or changes their mind.

import { loadEnvFile } from './lib/env.mjs';

const ADMIN_HEADER = 'x-gift-admin-key';

function requireConfig() {
  const env = loadEnvFile();
  const adminSecret = process.env.GIFT_ADMIN_SECRET || env.GIFT_ADMIN_SECRET;
  if (!adminSecret) {
    throw new Error(
      'Missing GIFT_ADMIN_SECRET. It is the same secret used by `npm run gifts:upload`.'
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

const arg = process.argv[2];
if (!arg) {
  throw new Error('Usage: node scripts/clear-reservation.mjs <gift-id> | --all');
}

const clearAll = arg === '--all';
const id = clearAll ? '' : encodeURIComponent(arg);
const { adminSecret, siteUrl } = requireConfig();

const response = await fetch(`${siteUrl}/api/gifts/admin/reservations${id ? `/${id}` : ''}`, {
  method: 'DELETE',
  headers: { [ADMIN_HEADER]: adminSecret }
});

const payload = await response.json().catch(() => ({}));
if (!response.ok) {
  throw new Error(`Clearing failed (${response.status}): ${payload.error ?? 'unknown error'}`);
}

const remaining = Object.keys(payload.reservations ?? {}).length;
if (clearAll) {
  console.log(`Cleared every reservation. ${remaining} left.`);
} else {
  console.log(`Freed "${arg}". ${remaining} reservation(s) left.`);
}
