import { useRef, useState, type FormEvent } from 'react';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { MailIcon } from './Icons';

const RSVP_EMAIL = import.meta.env.VITE_RSVP_EMAIL as string | undefined;
const RSVP_CC = import.meta.env.VITE_RSVP_CC as string | undefined;

const RSVP_SUBJECT = 'Hochzeit 11.12.2026';

export function RSVP() {
  useLingui();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState('');

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params: string[] = [`subject=${encodeURIComponent(RSVP_SUBJECT)}`];
    if (RSVP_CC) {
      params.push(`cc=${encodeURIComponent(RSVP_CC)}`);
    }
    if (message.trim()) {
      params.push(`body=${encodeURIComponent(message)}`);
    }

    window.location.href = `mailto:${RSVP_EMAIL ?? ''}?${params.join('&')}`;
    closeDialog();
  };

  return (
    <section className="section" id="rsvp" aria-labelledby="rsvp-title">
      <div className="container">
        <SectionHead
          titleId="rsvp-title"
          eyebrow={<Trans>your reply</Trans>}
          title={<Trans>RSVP</Trans>}
          intro={
            <Trans>Please let us know by November 1, 2026 whether you can celebrate with us.</Trans>
          }
        />

        <div className="rsvp-actions reveal">
          <button type="button" className="btn-ec" onClick={openDialog}>
            <MailIcon />
            <Trans>RSVP by email</Trans>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="rsvp-dialog"
        aria-label={t`RSVP by email`}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <h3>
            <Trans>RSVP</Trans>
          </h3>
          <p className="rsvp-hint">
            <Trans>Please let us know by November 1, 2026 whether you can celebrate with us.</Trans>
          </p>

          <label className="rsvp-field">
            <span className="sr-only">
              <Trans>Your message</Trans>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t`Your message…`}
              rows={6}
              autoFocus
            />
          </label>

          <div className="rsvp-modal-actions">
            <button type="button" className="btn-ec btn-ec--ghost" onClick={closeDialog}>
              <Trans>Cancel</Trans>
            </button>
            <button type="submit" className="btn-ec">
              <MailIcon />
              <Trans>Send</Trans>
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}