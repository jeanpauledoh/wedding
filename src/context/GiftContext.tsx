import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchGiftRegistry, reserveGift, type GiftItem, type ReserveOutcome } from '../lib/gifts';
import { isLocalhost } from '../lib/guest';

// Locally the dev server answers the gift routes from resources/gifts.json,
// so the feature is on by default there; deployments need the explicit flag.
const ENABLED = import.meta.env.VITE_GIFTS_ENABLED === 'true' || isLocalhost();

type GiftStatus = 'idle' | 'loading' | 'ready' | 'error';

type GiftContextValue = {
  enabled: boolean;
  status: GiftStatus;
  items: GiftItem[];
  isListOpen: boolean;
  openList: () => void;
  closeList: () => void;
  isReserving: boolean;
  reserve: (id: string) => Promise<ReserveOutcome>;
};

const GiftContext = createContext<GiftContextValue | null>(null);

export function GiftProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GiftStatus>(ENABLED ? 'loading' : 'idle');
  const [items, setItems] = useState<GiftItem[]>([]);
  const [isListOpen, setListOpen] = useState(false);
  const [isReserving, setReserving] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    const controller = new AbortController();

    fetchGiftRegistry(controller.signal)
      .then((loaded) => {
        setItems(loaded.items);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  // Reserving re-reads the whole list instead of patching one row: another guest
  // may have taken a different item while this dialog was open, and a fresh
  // read is cheap enough here to always be right.
  const reserve = async (id: string): Promise<ReserveOutcome> => {
    setReserving(true);
    try {
      const outcome = await reserveGift(id);

      try {
        setItems((await fetchGiftRegistry()).items);
      } catch {
        // The reservation itself landed; show at least that much.
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, reserved: true } : item))
        );
      }

      return outcome;
    } finally {
      setReserving(false);
    }
  };

  const value = useMemo<GiftContextValue>(
    () => ({
      enabled: ENABLED,
      status,
      items,
      isListOpen,
      openList: () => setListOpen(true),
      closeList: () => setListOpen(false),
      isReserving,
      reserve
    }),
    [status, items, isListOpen, isReserving]
  );

  return <GiftContext.Provider value={value}>{children}</GiftContext.Provider>;
}

export function useGifts(): GiftContextValue {
  const value = useContext(GiftContext);
  if (!value) throw new Error('useGifts must be used inside a GiftProvider');
  return value;
}