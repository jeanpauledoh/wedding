export type LocalizedText = Partial<Record<string, string>>;

export interface GiftItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  link: string | null;
  active: boolean;
  reserved: boolean;
}

export interface GiftRegistry {
  items: GiftItem[];
}

const FALLBACK_LOCALE = 'en';

/** Picks the requested locale, falling back to English then to any present locale. */
export function localize(text: LocalizedText, locale: string): string {
  return text[locale] ?? text[FALLBACK_LOCALE] ?? Object.values(text)[0] ?? '';
}

export async function fetchGiftRegistry(signal?: AbortSignal): Promise<GiftRegistry> {
  const response = await fetch('/api/gifts', { signal });
  if (!response.ok) throw new Error(`Gift registry failed (${response.status})`);
  const payload = (await response.json()) as { registry?: unknown };
  return parseGiftRegistry(payload.registry);
}

/** A reservation is first come, first served, so "taken" is an expected outcome. */
export type ReserveOutcome = 'reserved' | 'taken';

export async function reserveGift(id: string): Promise<ReserveOutcome> {
  const response = await fetch('/api/gifts/reserve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id })
  });

  if (response.status === 409) return 'taken';
  if (!response.ok) throw new Error(`Gift reservation failed (${response.status})`);
  return 'reserved';
}

function parseGiftRegistry(value: unknown): GiftRegistry {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('Unexpected gift registry payload');
  }
  return { items: value.items.map(parseGiftItem) };
}

function parseGiftItem(value: unknown): GiftItem {
  if (!isRecord(value) || typeof value.id !== 'string' || !isLocalizedText(value.title)) {
    throw new Error('Unexpected gift item payload');
  }
  return {
    id: value.id,
    title: value.title,
    description: isLocalizedText(value.description) ? value.description : {},
    link: typeof value.link === 'string' ? value.link : null,
    active: value.active !== false,
    reserved: value.reserved === true
  };
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}