import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function repoPath(...parts) {
  return path.join(repoRoot, ...parts);
}

export function loadEnvFile() {
  const envPath = repoPath('.env.local');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

export function requireTokenSecret() {
  const env = loadEnvFile();
  const secret = process.env.TOKEN_SECRET || env.TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      'Missing TOKEN_SECRET. Generate one (e.g. `openssl rand -hex 32`), store it in `.env.local`, ' +
        'and set it as the Cloudflare WORKER secret.'
    );
  }
  return secret;
}

export function requireSiteUrl() {
  const env = loadEnvFile();
  const url = process.env.VITE_SITE_URL || env.VITE_SITE_URL;
  if (!url) {
    throw new Error(
      'Missing VITE_SITE_URL in .env.local. Set it to the production domain (e.g. https://rjheiraten-berlin.de).'
    );
  }
  return url.replace(/\/$/, '');
}

export function slugify(value) {
  const base = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'guest';
}

export function readCsv(filePath) {
  const lines = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  if (lines.length === 0) throw new Error(`${filePath} is empty`);
  const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    rows.push(Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ''])));
  }
  return rows;
}

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}