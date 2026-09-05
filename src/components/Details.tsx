import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { Vows } from './Vows';
import { reception } from '../images';
import { CocktailIcon, MusicIcon, HouseIcon } from './Icons';

export function Details() {
  useLingui();

  return (
    <section className="section section--blush" id="details" aria-labelledby="details-title">
      <div className="container">
        <SectionHead
          titleId="details-title"
          eyebrow={<Trans>the celebration</Trans>}
          title={<Trans>The Details</Trans>}
          intro={
            <Trans>One estate, one unforgettable evening. Here is everything you need to know about the day itself.</Trans>
          }
        />

        <div className="detail-grid">
          <Vows />

          <article className="detail-card reveal">
            <div className="detail-frame">
              <img src={reception} alt={t`Long banquet table set for a candlelit reception`} loading="lazy" />
              <span className="tag">
                <Trans>Reception</Trans>
              </span>
            </div>
            <div className="detail-body">
              <h3>
                <Trans>The Feast</Trans>
              </h3>
              <p className="place">
                <Trans>The Vine Barn &amp; Terrace</Trans>
              </p>
              <ul className="detail-list">
                <li>
                  <CocktailIcon />
                  <span>
                    <Trans>Cocktails 5:00 PM · Dinner 6:30 PM</Trans>
                  </span>
                </li>
                <li>
                  <MusicIcon />
                  <span>
                    <Trans>Dancing until midnight with The Velvet Hours</Trans>
                  </span>
                </li>
                <li>
                  <HouseIcon />
                  <span>
                    <Trans>Seated dinner, open bar &amp; late-night bites</Trans>
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
          <Trans>Garden formal — think soft linens, florals and heels that survive a lawn. The evenings in Sonoma turn cool, so bring a wrap.</Trans>
        </p>
      </div>
    </section>
  );
}