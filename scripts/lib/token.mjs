import crypto from 'node:crypto';

export function base64url(input) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

export function signToken(secret, data) {
  const payload = base64url(JSON.stringify(data));
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function parseToken(secret, token) {
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqualHex(getHex(secret, payload), sig)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (data.v !== 'vows' && data.v !== 'party') return null;
  return {
    variant: data.v,
    name: typeof data.n === 'string' ? data.n.slice(0, 40) : ''
  };
}

function getHex(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}