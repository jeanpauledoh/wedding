export type GuestVariant = 'vows' | 'party';

export interface Guest {
  variant: GuestVariant;
  name: string | null;
}

export const SITE_URL: string | undefined = import.meta.env.VITE_SITE_URL as string | undefined;

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
}

export function readMeta(name: string): string | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? null;
}

export function isGuestVariant(value: string | null | undefined): value is GuestVariant {
  return value === 'vows' || value === 'party';
}