import { useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { FloralBranch } from './FloralBranch';
import { useGifts } from '../context/GiftContext';

const BASE_SECTIONS = ['details', 'gallery'] as const;

export function Footer() {
  const { i18n } = useLingui();
  const { enabled: giftsEnabled } = useGifts();

  const sections = useMemo(
    () => (giftsEnabled ? [...BASE_SECTIONS, 'gifts' as const] : BASE_SECTIONS),
    [giftsEnabled]
  );

  const labels = {
    details: t`Details`,
    gallery: t`Gallery`,
    gifts: t`Gifts`
  };

  const weddingDate = new Date('2026-12-11T10:45:00');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-floral" aria-hidden="true">
          <FloralBranch />
        </div>
        <p className="footer-monogram">
          Raquel &amp; Jean-Paul
        </p>
        <p className="footer-date">
          {i18n.date(weddingDate, { year: 'numeric', month: 'long', day: 'numeric' })} · <Trans>Berlin</Trans>
        </p>
        <p className="footer-hash">#EverAndAlways</p>

        <ul className="footer-nav">
          {sections.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{labels[id]}</a>
            </li>
          ))}
        </ul>

        <div className="footer-rule"></div>
        <p className="footer-fine">
          &copy; <Trans>2026 Raquel &amp; Jean-Paul. Made with love.</Trans>
        </p>
      </div>
    </footer>
  );
}