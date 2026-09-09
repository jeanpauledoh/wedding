import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { isGuestVariant, isLocalhost, readMeta, type GuestVariant } from '../lib/guest';

export type GuestStatus = GuestVariant | 'blocked';

type GuestContextValue = {
  status: GuestStatus;
  variant: GuestVariant;
  name: string | null;
  /** True when the Worker backend is wired to R2 and guests can upload/view photos. */
  photos: boolean;
};

const GuestContext = createContext<GuestContextValue>({
  status: 'blocked',
  variant: 'vows',
  name: null,
  photos: false
});

function resolveGuest(): GuestContextValue {
  const meta = readMeta('wedding:variant');
  if (isGuestVariant(meta)) {
    return {
      status: meta,
      variant: meta,
      name: readMeta('wedding:name'),
      photos: readMeta('wedding:photos') === 'on'
    };
  }

  if (isLocalhost()) {
    const override = new URLSearchParams(window.location.search).get('variant');
    if (isGuestVariant(override)) {
      return { status: override, variant: override, name: null, photos: true };
    }
    return { status: 'vows', variant: 'vows', name: null, photos: true };
  }

  return { status: 'blocked', variant: 'vows', name: null, photos: false };
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const value = useMemo<GuestContextValue>(() => resolveGuest(), []);
  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuest(): GuestContextValue {
  return useContext(GuestContext);
}