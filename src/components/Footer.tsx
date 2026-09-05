import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

const FOOTER_SECTIONS = ['details', 'gallery', 'party', 'travel'] as const;

export function Footer() {
  const { i18n } = useLingui();

  const labels = {
    details: t`Details`,
    gallery: t`Gallery`,
    party: t`The Party`,
    travel: t`Travel`
  };

  const weddingDate = new Date('2026-12-11T16:00:00');

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-monogram">
          Raquel &amp; Jean-Paul
        </p>
        <p className="footer-date">
          {i18n.date(weddingDate, { year: 'numeric', month: 'long', day: 'numeric' })} — <Trans>Sonoma Valley</Trans>
        </p>
        <p className="footer-hash">#EverAndAlways</p>

        <ul className="footer-nav">
          {FOOTER_SECTIONS.map((id) => (
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