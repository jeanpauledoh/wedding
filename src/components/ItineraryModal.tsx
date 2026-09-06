import { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { PinIcon } from './Icons';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

const mapsEmbedSrc = (address: string) =>
  MAPS_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(address)}`
    : null;

export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

type ItineraryModalProps = {
  buttonLabel: ReactNode;
  title: ReactNode;
  tag: ReactNode;
  address: string;
  blurb: ReactNode;
};

export function ItineraryModal({ buttonLabel, title, tag, address, blurb }: ItineraryModalProps) {
  useLingui();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  const embedSrc = mapsEmbedSrc(address);

  return (
    <>
      <button type="button" className="btn-ec btn-ec--ghost" onClick={open}>
        {buttonLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="itinerary-dialog"
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="itinerary-modal">
          <span className="tag itinerary-tag">{tag}</span>
          <h3 id={titleId}>{title}</h3>
          <p className="venue-blurb">{blurb}</p>
          <p className="venue-address">
            <PinIcon />
            <span>{address}</span>
          </p>
          {embedSrc ? (
            <div className="venue-map">
              <iframe
                src={embedSrc}
                title={address}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
          <div className="venue-modal-actions">
            <button type="button" className="btn-ec btn-ec--ghost" onClick={close}>
              <Trans>Close</Trans>
            </button>
            <a className="btn-ec" href={directionsUrl(address)} target="_blank" rel="noopener noreferrer">
              <Trans>Get Directions</Trans>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}