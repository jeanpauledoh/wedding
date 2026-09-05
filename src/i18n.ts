import { i18n } from '@lingui/core';

export const locales = ['de', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';
export const localeStorageKey = 'wedding.locale';

export function isLocale(value: string | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  try {
    const stored = window.localStorage.getItem(localeStorageKey);
    return isLocale(stored) ? stored : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export function getNavigatorLocale(): Locale {
  const nav = navigator.language.toLowerCase().split('-')[0];
  return isLocale(nav) ? nav : defaultLocale;
}

export function initialLocale(): Locale {
  return getStoredLocale() ?? getNavigatorLocale();
}

export function setLocale(locale: Locale) {
  i18n.activate(locale);
  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    /* storage unavailable */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

export { i18n };