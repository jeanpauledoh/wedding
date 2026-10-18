import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { localize } from '../lib/gifts';
import { GiftIcon } from './Icons';
import { SectionHead } from './SectionHead';

// Shown under the list after a reservation attempt, so the guest gets an
// answer without the dialog closing on them.
type Notice = 'reserved' | 'taken' | 'error' | null;

export function Gifts() {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  const { enabled, status, items, isListOpen, openList, closeList, isReserving, reserve } =
    useGifts();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isListOpen && !dialog.open) dialog.showModal();
    if (!isListOpen && dialog.open) dialog.close();
  }, [isListOpen]);

  if (!enabled) return null;

  // Reserved items stay visible so guests can see the list being worked
  // through, rather than their favourite silently disappearing.
  const shownItems = items.filter((item) => item.active);
  const availableCount = shownItems.filter((item) => !item.reserved).length;

  const onReserve = async (id: string) => {
    setNotice(null);
    try {
      const outcome = await reserve(id);
      setNotice(outcome === 'reserved' ? 'reserved' : 'taken');
    } catch {
      setNotice('error');
    }
  };

  const dismiss = () => {
    setNotice(null);
    closeList();
  };

  return (
    <section className="section" id="gifts" aria-labelledby="gifts-title">
      <div className="container">
        <SectionHead
          titleId="gifts-title"
          eyebrow={<Trans>with love</Trans>}
          title={<Trans>A Gift for Our Future</Trans>}
        />

        <div className="gift-intro reveal">
          <p>
            <Trans>
              The best part for us is celebrating this special day with you. If you would like to give us
              something beyond that, we are delighted by a financial contribution that brings us a step closer
              to the dream of owning a house or apartment.
            </Trans>
          </p>
          <p>
            <Trans>
              Of course, personal ideas and surprises are welcome too. Please do not feel obliged to anything!
            </Trans>
          </p>
        </div>

        <div className="gift-actions reveal">
          <button type="button" className="btn-ec btn-ec--gold" onClick={openList}>
            <GiftIcon />
            <Trans>A few gift inspirations</Trans>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="gift-dialog"
        aria-labelledby="gift-ideas-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) dismiss();
        }}
      >
        <div className="gift-modal">
          <h3 id="gift-ideas-title">
            <Trans>Gift ideas</Trans>
          </h3>

          {status === 'loading' && (
            <p className="gift-empty" role="status">
              <Trans>Loading the list…</Trans>
            </p>
          )}

          {status === 'error' && (
            <p className="gift-empty" role="alert">
              <Trans>The gift list is not available right now.</Trans>
            </p>
          )}

          {status === 'ready' && shownItems.length > 0 && availableCount === 0 && (
            <p className="gift-empty">
              <Trans>Everything has been reserved. Thank you all so much!</Trans>
            </p>
          )}

          {status === 'ready' && shownItems.length > 0 && (
            <ul className="gift-items">
              {shownItems.map((item) => {
                const description = localize(item.description, locale);
                return (
                  <li
                    key={item.id}
                    className={item.reserved ? 'gift-item gift-item--reserved' : 'gift-item'}
                  >
                    <h4>{localize(item.title, locale)}</h4>
                    {description && <p className="gift-item-text">{description}</p>}

                    {item.reserved ? (
                      <p className="gift-item-badge">
                        <Trans>Reserved</Trans>
                      </p>
                    ) : (
                      <>
                        {item.link && (
                          <a
                            className="gift-item-link"
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Trans>See it in a shop</Trans>
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn-ec btn-ec--gold"
                          onClick={() => void onReserve(item.id)}
                          disabled={isReserving}
                        >
                          {isReserving ? <Trans>Reserving…</Trans> : <Trans>Reserve</Trans>}
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {notice === 'reserved' && (
            <p className="gift-notice gift-notice--good" role="status">
              <Trans>It is yours. Thank you, that means a lot to us!</Trans>
            </p>
          )}
          {notice === 'taken' && (
            <p className="gift-notice" role="status">
              <Trans>Sorry, someone reserved this one just before you.</Trans>
            </p>
          )}
          {notice === 'error' && (
            <p className="gift-notice" role="alert">
              <Trans>That did not go through. Please try again.</Trans>
            </p>
          )}

          <div className="gift-modal-actions">
            <button type="button" className="btn-ec btn-ec--ghost" onClick={dismiss}>
              <Trans>Close</Trans>
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
