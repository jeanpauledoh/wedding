import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Details } from './components/Details';
import { Gallery } from './components/Gallery';
import { RSVP } from './components/RSVP';
import { OptionalDay } from './components/OptionalDay';
import { Footer } from './components/Footer';
import { useCountdown } from './hooks/useCountdown';
import { useReveal } from './hooks/useReveal';
import { Trans } from '@lingui/react/macro';

const WEDDING_DATETIME = '2026-12-11T10:45:00';

export default function App() {
  const remaining = useCountdown(WEDDING_DATETIME);
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        <Trans>Skip to content</Trans>
      </a>
      <Header days={remaining.days} />
      <main id="main">
        <Hero remaining={remaining} />
        <Details />
        <RSVP />
        <Gallery />
        <OptionalDay />
      </main>
      <Footer />
    </>
  );
}