import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';
import { useGifts } from '../context/GiftContext';
import { localize } from '../lib/gifts';
import { GiftIcon } from './Icons';
import { SectionHead } from './SectionHead';

export function Gifts() {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  const { enabled, status, items, isListOpen, openList, closeList } = useGifts();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isListOpen && !dialog.open) dialog.showModal();
    if (!isListOpen && dialog.open) dialog.close();
  }, [isListOpen]);

  if (!enabled) return null;

  const availableItems = items.filter((item) => item.active);

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
          if (event.target === dialogRef.current) closeList();
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

          {status === 'ready' && availableItems.length === 0 && (
            <p className="gift-empty">
              <Trans>The list is being updated. Please check back soon.</Trans>
            </p>
          )}

          {status === 'ready' && availableItems.length > 0 && (
            <ul className="gift-items">
              {availableItems.map((item) => {
                const description = localize(item.description, locale);
                return (
                  <li key={item.id} className="gift-item">
                    <h4>{localize(item.title, locale)}</h4>
                    {description && <p className="gift-item-text">{description}</p>}
                    {item.link && (
                      <a className="gift-item-link" href={item.link} target="_blank" rel="noopener noreferrer">
                        <Trans>See it in a shop</Trans>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="gift-modal-actions">
            <button type="button" className="btn-ec btn-ec--ghost" onClick={closeList}>
              <Trans>Close</Trans>
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
