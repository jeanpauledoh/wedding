import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import type { TimeRemaining } from '../hooks/useCountdown';
import { FloralBranch } from './FloralBranch';

const WEDDING_DATE = new Date('2026-12-11T10:45:00');

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

type HeroProps = {
  remaining: TimeRemaining;
};

export function Hero({ remaining }: HeroProps) {
  const { i18n } = useLingui();

  const weekdayMonthDay = i18n.date(WEDDING_DATE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const year = i18n.date(WEDDING_DATE, { year: 'numeric' });

  return (
    <section className="hero" id="home" aria-label={t`Raquel and Jean-Paul are getting married`}>
      <div className="hero__bg" role="img" aria-label={t`Bridal bouquet of garden roses on a linen table`} />
      <div className="hero__floral" aria-hidden="true">
        <FloralBranch mirror />
      </div>
      <div className="hero__inner">
        <p className="hero__pre">
          <Trans>Together with family and friends</Trans>
        </p>
        <h1 className="hero__names">
          Raquel<span className="amp">&amp;</span>Jean-Paul
        </h1>
        <p className="hero__meta">
          {weekdayMonthDay} <span>&bull;</span> {year}
        </p>
        <p className="hero__venue">
          <Trans>Berlin</Trans>
        </p>

        <div className="countdown" aria-label={t`Countdown to the wedding`}>
          <div className="count-cell">
            <b>{remaining.days}</b>
            <span>
              <Trans>Days</Trans>
            </span>
          </div>
          <div className="count-cell">
            <b>{pad(remaining.hours)}</b>
            <span>
              <Trans>Hours</Trans>
            </span>
          </div>
          <div className="count-cell">
            <b>{pad(remaining.minutes)}</b>
            <span>
              <Trans>Minutes</Trans>
            </span>
          </div>
          <div className="count-cell">
            <b>{pad(remaining.seconds)}</b>
            <span>
              <Trans>Seconds</Trans>
            </span>
          </div>
        </div>

        <div className="hero__cta">
          <a href="#details" className="btn-ec btn-ec--light">
            <Trans>The Details</Trans>
          </a>
          <a href="#gallery" className="btn-ec btn-ec--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}>
            <Trans>Gallery</Trans>
          </a>
        </div>
      </div>
      <a className="scroll-cue" href="#details" aria-label={t`Scroll to the details`}>
        <svg viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="7" y="1" width="10" height="20" rx="5" />
          <path d="M12 6v4" />
          <path d="M8 27l4 4 4-4" />
        </svg>
      </a>
    </section>
  );
}