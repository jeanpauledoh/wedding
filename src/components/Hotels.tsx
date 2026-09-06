import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { hotel1, hotel2 } from '../images';
import { PinIcon } from './Icons';

type Hotel = {
  img: string;
  alt: string;
  name: React.ReactNode;
  place: React.ReactNode;
  blurb: React.ReactNode;
  address: string;
  url: string;
};

export function Hotels() {
  useLingui();

  const hotels: Hotel[] = [
    {
      img: hotel1,
      alt: t`B&B Hotel Berlin-Mitte`,
      name: <Trans>B&B Hotel Berlin-Mitte</Trans>,
      place: <Trans>Berlin Mitte</Trans>,
      blurb: (
        <Trans>
          A modern budget hotel right in the heart of Berlin Mitte, within walking distance of the
          Brandenburg Gate, the Reichstag and our venues.
        </Trans>
      ),
      address: 'Albrechtstraße 25, 10117 Berlin',
      url: 'https://www.hotel-bb.com/de/hotel/berlin-mitte'
    },
    {
      img: hotel2,
      alt: t`a&o Berlin Hauptbahnhof`,
      name: <Trans>a&o Berlin Hauptbahnhof</Trans>,
      place: <Trans>Berlin Hauptbahnhof</Trans>,
      blurb: (
        <Trans>
          A friendly hostel-hotel right by Berlin's main station — ideal if you arrive by train, with
          a rooftop terrace bar and free WiFi.
        </Trans>
      ),
      address: 'Lehrter Straße 12-15, 10557 Berlin',
      url: 'https://www.aohostels.com/en/berlin/berlin-hauptbahnhof/'
    }
  ];

  return (
    <section className="section" id="hotels" aria-labelledby="hotels-title">
      <div className="container">
        <SectionHead
          titleId="hotels-title"
          eyebrow={<Trans>where to stay</Trans>}
          title={<Trans>Where to Stay</Trans>}
          intro={
            <Trans>
              For our guests travelling from further away, here are two options near our venues.
            </Trans>
          }
        />

        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <article key={hotel.address} className="hotel-card reveal">
              <div className="hotel-frame">
                <img src={hotel.img} alt={hotel.alt} loading="lazy" />
              </div>
              <div className="hotel-body">
                <h3>{hotel.name}</h3>
                <p className="place">{hotel.place}</p>
                <p className="hotel-blurb">{hotel.blurb}</p>
                <p className="hotel-address">
                  <PinIcon />
                  <span>{hotel.address}</span>
                </p>
                <div className="hotel-actions">
                  <a
                    className="btn-ec btn-ec--ghost"
                    href={hotel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Trans>Website</Trans>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}