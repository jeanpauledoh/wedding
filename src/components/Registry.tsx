import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { HouseIcon, GiftIcon, HeartIcon } from './Icons';

export function Registry() {
  useLingui();

  return (
    <section className="section section--blush" id="registry" aria-labelledby="registry-title">
      <div className="container">
        <SectionHead
          titleId="registry-title"
          eyebrow={<Trans>with gratitude</Trans>}
          title={<Trans>Gift Registry</Trans>}
          intro={
            <Trans>Your presence is the only present we need — but for those who've asked, here is where we're dreaming.</Trans>
          }
        />

        <div className="registry-grid">
          <article className="reg-card reveal">
            <div className="reg-ico">
              <HouseIcon />
            </div>
            <h3>
              <Trans>Nell &amp; Rye Home</Trans>
            </h3>
            <p>
              <Trans>Linens, stoneware and the slow, lovely things that make a house a home.</Trans>
            </p>
            <a href="#" className="btn-ec btn-ec--ghost" aria-label={t`View the Nell and Rye Home registry`}>
              <Trans>View registry</Trans>
            </a>
          </article>

          <article className="reg-card reveal">
            <div className="reg-ico">
              <GiftIcon />
            </div>
            <h3>
              <Trans>The Honeymoon Fund</Trans>
            </h3>
            <p>
              <Trans>Help us chase the sunset in Amalfi — a dinner, a boat ride, a night under the stars.</Trans>
            </p>
            <a href="#" className="btn-ec btn-ec--ghost" aria-label={t`Contribute to the honeymoon fund`}>
              <Trans>Contribute</Trans>
            </a>
          </article>

          <article className="reg-card reveal">
            <div className="reg-ico">
              <HeartIcon />
            </div>
            <h3>
              <Trans>The Cottage Fund</Trans>
            </h3>
            <p>
              <Trans>A little toward the garden, the porch swing, and that lemon tree we keep talking about.</Trans>
            </p>
            <a href="#" className="btn-ec btn-ec--ghost" aria-label={t`Give to the cottage fund`}>
              <Trans>Give a little</Trans>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}