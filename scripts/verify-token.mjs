#!/usr/bin/env node
// Verify one or more tokens against the local TOKEN_SECRET.
//
// Usage:
//   node scripts/verify-token.mjs <token>
//   node scripts/verify-token.mjs            # verifies every row of resources/qr/tokens.csv

import fs from 'node:fs';
import { repoPath, requireTokenSecret, readCsv } from './lib/env.mjs';
import { parseToken } from './lib/token.mjs';

const secret = requireTokenSecret();

const args = process.argv.slice(2);
if (args.length > 0) {
  for (const token of args) {
    const result = parseToken(secret, token);
    console.log(`${result ? 'VALID   ' : 'INVALID '} ${token} ${result ? JSON.stringify(result) : ''}`);
  }
  process.exit(0);
}

const csv = repoPath('resources', 'qr', 'tokens.csv');
if (!fs.existsSync(csv)) {
  console.error('No tokens.csv — run `npm run gen:tokens` first, or pass a token as an argument.');
  process.exit(1);
}

let valid = 0;
let invalid = 0;
for (const row of readCsv(csv)) {
  const result = parseToken(secret, row.token);
  console.log(`${result ? 'VALID  ' : 'INVALID'} ${row.name.padEnd(24)} ${row.variant.padEnd(5)} ${result ? JSON.stringify(result) : row.token}`);
  result ? (valid += 1) : (invalid += 1);
}
console.log(`\n${valid} valid, ${invalid} invalid`);
process.exit(invalid === 0 ? 0 : 1);