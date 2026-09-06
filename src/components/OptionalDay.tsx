import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { ItineraryModal } from './ItineraryModal';
import { gallery1 } from '../images';
import { ClockIcon, PinIcon } from './Icons';

export function OptionalDay() {
  useLingui();

  return (
    <section className="section section--blush" id="optional-day" aria-labelledby="optional-title">
      <div className="container">
        <SectionHead
          titleId="optional-title"
          eyebrow={<Trans>if you feel like it</Trans>}
          title={<Trans>The Day After</Trans>}
          intro={
            <Trans>An optional little extra for anyone who would love to spend more time together.</Trans>
          }
        />

        <div className="optional-card reveal">
          <div className="optional-frame">
            <img src={gallery1} alt={t`Botanischer Garten Berlin`} loading="lazy" />
          </div>
          <div className="optional-body">
            <span className="optional-tag">
              <Trans>Optional</Trans>
            </span>
            <h3>
              <Trans>Botanischer Garten Berlin</Trans>
            </h3>
            <p className="place">
              <Trans>A walk through the gardens</Trans>
            </p>
            <ul className="detail-list">
              <li>
                <ClockIcon />
                <span>
                  <Trans>Saturday, December 12, 2026 at 11:00 AM</Trans>
                </span>
              </li>
              <li>
                <PinIcon />
                <span>
                  <Trans>Königin-Luise-Straße 6-8, 14195 Berlin</Trans>
                </span>
              </li>
            </ul>
            <div className="detail-actions">
              <ItineraryModal
                buttonLabel={<Trans>Details</Trans>}
                title={<Trans>Botanischer Garten Berlin</Trans>}
                tag={<Trans>Optional</Trans>}
                address="Königin-Luise-Straße 6-8, 14195 Berlin"
                blurb={
                  <Trans>
                    A leisurely winter walk through one of Europe's most beautiful gardens before
                    everyone heads home. Heated glasshouses keep the green alive even in December.
                  </Trans>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}