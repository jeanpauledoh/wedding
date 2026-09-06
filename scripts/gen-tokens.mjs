#!/usr/bin/env node
// Mint signed magic-link tokens for every guest in the CSV, write
// resources/qr/tokens.csv + resources/qr/manifest.json.
//
// Usage:
//   node scripts/gen-tokens.mjs [path-to-guests.csv]

import fs from 'node:fs';
import path from 'node:path';
import { repoPath, requireTokenSecret, requireSiteUrl, readCsv, slugify } from './lib/env.mjs';
import { signToken } from './lib/token.mjs';

const csvPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : repoPath('resources', 'guests.csv') && fs.existsSync(repoPath('resources', 'guests.csv'))
    ? repoPath('resources', 'guests.csv')
    : repoPath('resources', 'guests-example.csv');

const secret = requireTokenSecret();
const siteUrl = requireSiteUrl();
const guests = readCsv(csvPath);

const outDir = repoPath('resources', 'qr');
fs.mkdirSync(outDir, { recursive: true });
const slugCounts = new Map();
function uniqueSlug(name, index) {
  const base = slugify(name || `guest-${index + 1}`);
  const count = slugCounts.get(base) ?? 0;
  slugCounts.set(base, count + 1);
  const suffix = slugify(name || `guest-${index + 1}`);
  return count === 0 ? suffix : `${suffix}-${count + 1}`;
}

const tokens = guests.map((guest, index) => {
  const name = String(guest.name || '').trim();
  const variant = String(guest.variant || 'vows').trim();
  const lang = String(guest.lang || '').trim();
  if (variant !== 'vows' && variant !== 'party') {
    throw new Error(`Row ${index + 1}: variant must be 'vows' or 'party', got '${variant}'`);
  }
  const token = signToken(secret, { v: variant, n: name });
  return {
    slug: uniqueSlug(name, index),
    name,
    variant,
    lang,
    token,
    url: `${siteUrl}/?t=${encodeURIComponent(token)}`
  };
});

const csvLines = ['name,variant,lang,token,url', ...tokens.map((t) => [t.name, t.variant, t.lang, t.token, t.url].map(quote).join(','))];
fs.writeFileSync(path.join(outDir, 'tokens.csv'), csvLines.join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(tokens, null, 2) + '\n');

console.log(`Minted ${tokens.length} tokens → resources/qr/`);
for (const t of tokens) console.log(`  ${t.variant.padEnd(5)} ${t.name.padEnd(24)} ${t.url}`);

function quote(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}