import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { ceremony } from '../images';
import { CrownIcon, ClockIcon, PinIcon } from './Icons';

export function Vows() {
  useLingui();

  return (
    <article className="detail-card reveal">
      <div className="detail-frame">
        <img src={ceremony} alt={t`Floral ceremony arch beneath an old oak tree`} loading="lazy" />
        <span className="tag">
          <Trans>Ceremony</Trans>
        </span>
      </div>
      <div className="detail-body">
        <h3>
          <Trans>The Vows</Trans>
        </h3>
        <p className="place">
          <Trans>Under the Grand Oak</Trans>
        </p>
        <ul className="detail-list">
          <li>
            <CrownIcon />
            <span>
              <Trans>4:00 PM — arrival &amp; seating from 3:30 PM</Trans>
            </span>
          </li>
          <li>
            <ClockIcon />
            <span>
              <Trans>A short outdoor ceremony, around 30 minutes</Trans>
            </span>
          </li>
          <li>
            <PinIcon />
            <span>
              <Trans>The Oak Lawn, Fernwood Estate</Trans>
            </span>
          </li>
        </ul>
        <a href="#travel" className="btn-ec btn-ec--ghost">
          <Trans>Getting there</Trans>
        </a>
      </div>
    </article>
  );
}