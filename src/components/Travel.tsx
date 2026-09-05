import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { venue, hotel1, hotel2 } from '../images';

export function Travel() {
  useLingui();

  return (
    <section className="section" id="travel" aria-labelledby="travel-title">
      <div className="container">
        <SectionHead
          titleId="travel-title"
          eyebrow={<Trans>getting there</Trans>}
          title={<Trans>Travel &amp; Stay</Trans>}
          intro={
            <Trans>Fernwood Estate sits about an hour north of San Francisco. Make a weekend of it — the valley is at its best in September.</Trans>
          }
        />

        <div className="travel-grid">
          <div className="venue-feature reveal">
            <img src={venue} alt={t`Fernwood Estate surrounded by vineyards at dusk`} loading="lazy" />
            <div>
              <p className="overline" style={{ color: 'var(--gold-soft)' }}>
                <Trans>The Venue</Trans>
              </p>
              <h3>
                <Trans>Fernwood Estate</Trans>
              </h3>
              <p>
                <Trans>4200 Bennett Valley Road, Sonoma Valley, CA 95404. Gated parking and a complimentary shuttle from The Larkspur Inn run every 30 minutes from 3:00 PM.</Trans>
              </p>
              <a href="#" className="btn-ec btn-ec--light">
                <Trans>Open in Maps</Trans>
              </a>
            </div>
          </div>

          <div className="hotel-list">
            <article className="hotel-card reveal">
              <div className="hotel-thumb">
                <img src={hotel1} alt={t`Suite at The Larkspur Inn`} loading="lazy" />
              </div>
              <div className="hotel-info">
                <p className="rate">
                  <Trans>From $210 / night</Trans>
                </p>
                <h4>
                  <Trans>The Larkspur Inn</Trans>
                </h4>
                <p>
                  <Trans>Our room block — 8 minutes from Fernwood. Use code EVERLY26 by Aug 1.</Trans>
                </p>
                <a href="#">
                  <Trans>Book a room</Trans>
                </a>
              </div>
            </article>

            <article className="hotel-card reveal">
              <div className="hotel-thumb">
                <img src={hotel2} alt={t`Bedroom at Vine Street Guesthouse`} loading="lazy" />
              </div>
              <div className="hotel-info">
                <p className="rate">
                  <Trans>From $165 / night</Trans>
                </p>
                <h4>
                  <Trans>Vine Street Guesthouse</Trans>
                </h4>
                <p>
                  <Trans>A charming, budget-friendly option a short drive into town with free breakfast.</Trans>
                </p>
                <a href="#">
                  <Trans>Book a room</Trans>
                </a>
              </div>
            </article>
          </div>
        </div>

        <p className="travel-note reveal">
          <strong>
            <Trans>Flying in?</Trans>
          </strong>{' '}
          <Trans>San Francisco (SFO) is 75 minutes away; Oakland (OAK) and Santa Rosa (STS) are closer for domestic hops. We recommend renting a car — or joining the group shuttle from the inn.</Trans>
        </p>
      </div>
    </section>
  );
}