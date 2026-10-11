import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useGifts } from '../context/GiftContext';

const DISMISSED_KEY = 'gift-consent-dismissed';

export function GiftConsent() {
  useLingui();

  const { enabled, openList } = useGifts();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      setVisible(localStorage.getItem(DISMISSED_KEY) !== 'yes');
    } catch {
      setVisible(true);
    }
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, 'yes');
    } catch {
      // A blocked storage API only costs us the reminder, not the feature.
    }
  };

  const viewList = () => {
    dismiss();
    openList();
  };

  return (
    <aside className="gift-consent" role="dialog" aria-label="gifts">
      <div className="gift-consent-body">
        <p className="gift-consent-title">
          <Trans>Thinking about what to gift us?</Trans>
        </p>
        <p className="gift-consent-text">
          <Trans>
            Generally we would be very happy about a monetary contribution to get a bit closer to the dream of
            owning a house or apartment.
          </Trans>
        </p>
        <button type="button" className="gift-consent-link" onClick={viewList}>
          <Trans>A few gift inspirations</Trans>
        </button>
      </div>
      <button
        type="button"
        className="gift-consent-close"
        aria-label="close"
        onClick={dismiss}
      >
        ×
      </button>
    </aside>
  );
}