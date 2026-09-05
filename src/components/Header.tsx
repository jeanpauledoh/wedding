import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { t } from '@lingui/core/macro';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useScrollSpy } from '../hooks/useScrollSpy';

const NAV_SECTIONS = ['home', 'details', 'gallery', 'party', 'travel'] as const;

type HeaderProps = {
  days: number;
};

export function Header({ days }: HeaderProps) {
  useLingui();

  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const activeId = useScrollSpy(NAV_SECTIONS);

  const labels = {
    home: t`Home`,
    details: t`Details`,
    gallery: t`Gallery`,
    party: t`The Party`,
    travel: t`Travel`
  };

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 767) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className={stuck ? 'site-header is-stuck' : 'site-header'} id="siteHeader">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label={t`Raquel and Jean-Paul — home`}>
            Raquel <em>&amp;</em> Jean-Paul
          </a>

          <nav aria-label={t`Primary`}>
            <ul className={open ? 'nav-menu open' : 'nav-menu'} id="navMenu">
              {NAV_SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className={activeId === id ? 'active' : ''} onClick={closeMenu}>
                    {labels[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <LanguageSwitcher />
            <span className="count-chip" aria-hidden="true">
              <b>{days}</b> {t`days to go`}
            </span>
            <button
              className="nav-toggle"
              id="navToggle"
              aria-label={open ? t`Close menu` : t`Open menu`}
              aria-expanded={open}
              aria-controls="navMenu"
              onClick={() => setOpen((value) => !value)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>
      <div className="nav-backdrop" hidden={!open} onClick={closeMenu} />
    </>
  );
}