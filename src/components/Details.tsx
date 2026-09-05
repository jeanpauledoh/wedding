import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { ceremony, reception, venue } from '../images';
import { CrownIcon, PinIcon, CocktailIcon, MusicIcon } from './Icons';

export function Details() {
  useLingui();

  return (
    <section className="section section--blush" id="details" aria-labelledby="details-title">
      <div className="container">
        <SectionHead
          titleId="details-title"
          eyebrow={<Trans>the day</Trans>}
          title={<Trans>The Details</Trans>}
          intro={
            <Trans>One day in Berlin, three beautiful chapters. Here is everything you need to know.</Trans>
          }
        />

        <div className="detail-grid">
          <article className="detail-card reveal">
            <div className="detail-frame">
              <img src={ceremony} alt={t`Registry office in Berlin Mitte`} loading="lazy" />
              <span className="tag">
                <Trans>Ceremony</Trans>
              </span>
            </div>
            <div className="detail-body">
              <h3>
                <Trans>The Ceremony</Trans>
              </h3>
              <p className="place">
                <Trans>Standesamt Berlin Mitte</Trans>
              </p>
              <ul className="detail-list">
                <li>
                  <CrownIcon />
                  <span>
                    <Trans>10:45 — registry office in Berlin Mitte</Trans>
                  </span>
                </li>
                <li>
                  <PinIcon />
                  <span>
                    <Trans>Parochialstraße 3, 10179 Berlin</Trans>
                  </span>
                </li>
              </ul>
            </div>
          </article>

          <article className="detail-card reveal">
            <div className="detail-frame">
              <img src={reception} alt={t`Brunch at Sag mir wo die Blumen sind`} loading="lazy" />
              <span className="tag">
                <Trans>Brunch</Trans>
              </span>
            </div>
            <div className="detail-body">
              <h3>
                <Trans>The Brunch</Trans>
              </h3>
              <p className="place">
                <Trans>'Sag mir wo die Blumen sind'</Trans>
              </p>
              <ul className="detail-list">
                <li>
                  <CocktailIcon />
                  <span>
                    <Trans>12:30 — brunch with sparkling wine</Trans>
                  </span>
                </li>
                <li>
                  <PinIcon />
                  <span>
                    <Trans>Albrechtstraße 9, 10117 Berlin</Trans>
                  </span>
                </li>
              </ul>
            </div>
          </article>

          <article className="detail-card reveal">
            <div className="detail-frame">
              <img src={venue} alt={t`Celebration at Restaurant Whitebird`} loading="lazy" />
              <span className="tag">
                <Trans>Celebration</Trans>
              </span>
            </div>
            <div className="detail-body">
              <h3>
                <Trans>The Celebration</Trans>
              </h3>
              <p className="place">
                <Trans>Restaurant 'Whitebird'</Trans>
              </p>
              <ul className="detail-list">
                <li>
                  <MusicIcon />
                  <span>
                    <Trans>5:00 PM — the wedding celebration</Trans>
                  </span>
                </li>
                <li>
                  <PinIcon />
                  <span>
                    <Trans>Albrechtstraße 18, 10117 Berlin</Trans>
                  </span>
                </li>
              </ul>
            </div>
          </article>
        </div>

        <p className="travel-note reveal" style={{ marginTop: '2.6rem' }}>
          <strong>
            <Trans>Dress code:</Trans>
          </strong>{' '}
          <Trans>Festive elegant — red and black are welcome.</Trans>
        </p>
      </div>
    </section>
  );
}