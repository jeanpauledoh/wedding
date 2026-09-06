#!/usr/bin/env node
// Render QR codes for every minted token into resources/qr/:
//   <slug>.svg  — vector, for the printable sheet
//   <slug>.png  — raster (512px), for messaging/mobile
//   sheet.html  — one printable page per guest (name + variant + QR)
//
// Usage: node scripts/gen-qr.mjs   (requires manifest.json from gen-tokens)

import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { repoPath } from './lib/env.mjs';

const INK = '#1E2A3A';

const manifestPath = repoPath('resources', 'qr', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('No manifest.json — run `npm run gen:tokens` first.');
  process.exit(1);
}

const outDir = repoPath('resources', 'qr');
const entries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const sheets = { vows: [], party: [] };

for (const entry of entries) {
  const variant = entry.variant === 'party' ? 'party' : 'vows';
  const slug = String(entry.slug || entry.name || 'guest').replace(/[^a-z0-9-]+/gi, '-');

  await QRCode.toFile(path.join(outDir, `${slug}.png`), entry.url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: INK, light: '#FFFFFF' }
  });

  const svg = await QRCode.toString(entry.url, {
    type: 'svg',
    margin: 2,
    width: 512,
    errorCorrectionLevel: 'M',
    color: { dark: INK, light: '#FFFFFF' }
  });

  sheets[variant].push({ slug, name: entry.name, variant, url: entry.url, svg, png: `${slug}.png` });

  console.log(`  ${variant.padEnd(5)} ${String(entry.name).padEnd(24)} ${entry.url}`);
}

fs.writeFileSync(path.join(outDir, 'sheet.html'), renderSheet(sheets));
console.log(`\nWrote ${entries.length} QR codes + sheet.html → resources/qr/`);
console.log('Open resources/qr/sheet.html in a browser and print.');

function renderSheet(groups) {
  const labelFor = (variant) => (variant === 'party' ? 'Wedding Party' : 'Ceremony + Brunch + Party');
  const blockFor = (variant) => {
    const cards = groups[variant]
      .map(
        (item) => `
        <section class="card">
          <div class="qr">${item.svg}</div>
          <p class="name">${escapeHtml(item.name || '')}</p>
          <p class="tag">${labelFor(variant)}</p>
          <p class="url">${escapeHtml(item.url)}</p>
        </section>`
      )
      .join('\n');
    return `<h2>${labelFor(variant)}</h2><div class="grid">${cards}</div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Wedding QR codes</title>
<style>
  :root { --ink:#1E2A3A; --muted:#6B7A8A; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, serif; color: var(--ink); margin: 24px; }
  h1 { font-size: 20px; letter-spacing: .04em; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .2em; color: var(--muted); margin: 26px 0 10px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .card { border: 1px solid #D0D5DC; border-radius: 6px; padding: 14px; page-break-inside: avoid; }
  .card .qr { width: 120px; }
  .card .qr svg, .card .qr img { width: 100%; height: auto; display: block; }
  .name { font-size: 14px; font-weight: bold; margin: 10px 0 2px; }
  .tag { font-size: 9px; text-transform: uppercase; letter-spacing: .16em; color: var(--muted); margin: 0 0 4px; }
  .url { font-size: 8px; color: var(--muted); word-break: break-all; margin: 0; }
  @media print {
    body { margin: 0; }
    .grid { grid-template-columns: 1fr; gap: 0; }
    .card { border: 0; border-bottom: 1px dashed #D0D5DC; border-radius: 0; padding: 12px 0; }
    .card .qr { width: 96px; }
  }
</style>
</head>
<body>
  <h1>Raquel &amp; Jean-Paul — invitation QR codes</h1>
  ${blockFor('vows')}
  ${blockFor('party')}
</body>
</html>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}