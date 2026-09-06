import { useEffect, useState, type FormEvent } from 'react';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { FloralBranch } from './FloralBranch';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SITE_URL } from '../lib/guest';

const WEDDING_DATE = new Date('2026-12-11T10:45:00');

export function Blocked() {
  const { i18n } = useLingui();

  const [code, setCode] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!SITE_URL) return;
    const value = code.trim();
    if (!value) return;
    const base = SITE_URL.replace(/\/$/, '');
    window.location.href = `${base}/?t=${encodeURIComponent(value)}`;
  };

  return (
    <div className="gate">
      <header className="site-header" id="siteHeader">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label={t`Raquel and Jean-Paul — home`}>
            Raquel <em>&amp;</em> Jean-Paul
          </a>
          <div className="nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="gate-main">
        <section className="hero gate-hero" id="home" aria-label={t`Raquel and Jean-Paul are getting married`}>
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
              {i18n.date(WEDDING_DATE, { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
              <span>&bull;</span>{' '}
              {i18n.date(WEDDING_DATE, { year: 'numeric' })}
            </p>

            <div className="gate-box">
              <p className="gate-hint">
                <Trans>This invite is private. Enter the code from your invitation to continue.</Trans>
              </p>
              <form className="gate-form" onSubmit={handleSubmit}>
                <input
                  className="gate-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t`Invitation code`}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={t`Invitation code`}
                />
                <button className="btn-ec btn-ec--light" type="submit" disabled={!SITE_URL || !code.trim()}>
                  <Trans>Open my invitation</Trans>
                </button>
              </form>
              {!SITE_URL ? (
                <p className="gate-error">
                  <Trans>This preview cannot verify invitation links.</Trans>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}