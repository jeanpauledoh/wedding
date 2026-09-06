import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { ItineraryModal } from './ItineraryModal';
import { ceremony, reception, venue } from '../images';
import { CrownIcon, PinIcon, CocktailIcon, MusicIcon } from './Icons';
import type { GuestVariant } from '../lib/guest';

type Venue = {
  img: string;
  alt: string;
  tag: React.ReactNode;
  title: React.ReactNode;
  place: React.ReactNode;
  timeIcon: React.ReactNode;
  time: React.ReactNode;
  address: string;
  blurb: React.ReactNode;
};

type DetailsProps = {
  variant: GuestVariant;
};

export function Details({ variant }: DetailsProps) {
  useLingui();

  const isParty = variant === 'party';

  const ceremonyVenue: Venue = {
    img: ceremony,
    alt: t`Registry office in Berlin Mitte`,
    tag: <Trans>Ceremony</Trans>,
    title: <Trans>The Ceremony</Trans>,
    place: <Trans>Standesamt Berlin Mitte</Trans>,
    timeIcon: <CrownIcon />,
    time: <Trans>10:45 — registry office in Berlin Mitte</Trans>,
    address: 'Parochialstraße 3, 10179 Berlin',
    blurb: (
      <Trans>
        The civil ceremony is the official, heartfelt start of our day. We exchange our vows at the
        historic registry office in Berlin Mitte.
      </Trans>
    )
  };

  const brunchVenue: Venue = {
    img: reception,
    alt: t`Brunch at Sag mir wo die Blumen sind`,
    tag: <Trans>Brunch</Trans>,
    title: <Trans>The Brunch</Trans>,
    place: <Trans>'Sag mir wo die Blumen sind'</Trans>,
    timeIcon: <CocktailIcon />,
    time: <Trans>12:30 — brunch with sparkling wine</Trans>,
    address: 'Albrechtstraße 9, 10117 Berlin',
    blurb: (
      <Trans>
        A relaxed brunch with sparkling wine and good food after the ceremony. We raise our glasses
        and take our time together before the evening celebrations begin.
      </Trans>
    )
  };

  const partyVenue: Venue = {
    img: venue,
    alt: t`Celebration at Restaurant Whitebird`,
    tag: <Trans>Celebration</Trans>,
    title: <Trans>The Celebration</Trans>,
    place: <Trans>Restaurant 'Whitebird'</Trans>,
    timeIcon: <MusicIcon />,
    time: <Trans>5:00 PM — the wedding celebration</Trans>,
    address: 'Albrechtstraße 18, 10117 Berlin',
    blurb: isParty ? (
      <Trans>
        Dinner, drinks and dancing at Restaurant Whitebird, among our closest family and friends.
      </Trans>
    ) : (
      <Trans>
        The grand finale: dinner, drinks and dancing at Restaurant Whitebird. After the ceremony and
        brunch, we celebrate into the night with our closest family and friends.
      </Trans>
    )
  };

  const venues: Venue[] = isParty ? [partyVenue] : [ceremonyVenue, brunchVenue, partyVenue];

  return (
    <section className="section section--blush" id="details" aria-labelledby="details-title">
      <div className="container">
        <SectionHead
          titleId="details-title"
          eyebrow={isParty ? <Trans>the party</Trans> : <Trans>the day</Trans>}
          title={isParty ? <Trans>The Celebration</Trans> : <Trans>The Details</Trans>}
          intro={
            isParty ? (
              <Trans>
                An evening of dinner, drinks and dancing in Berlin. Here is everything you need to
                know.
              </Trans>
            ) : (
              <Trans>
                One day in Berlin, three beautiful chapters. Here is everything you need to know.
              </Trans>
            )
          }
        />

        <div className={isParty ? 'detail-grid detail-grid--single' : 'detail-grid'}>
          {venues.map((v) => (
            <article key={v.address} className="detail-card reveal">
              <div className="detail-frame">
                <img src={v.img} alt={v.alt} loading="lazy" />
                <span className="tag">{v.tag}</span>
              </div>
              <div className="detail-body">
                <h3>{v.title}</h3>
                <p className="place">{v.place}</p>
                <ul className="detail-list">
                  <li>
                    {v.timeIcon}
                    <span>{v.time}</span>
                  </li>
                  <li>
                    <PinIcon />
                    <span>{v.address}</span>
                  </li>
                </ul>
                <div className="detail-actions">
                  <ItineraryModal
                    buttonLabel={<Trans>Details</Trans>}
                    title={v.title}
                    tag={v.tag}
                    address={v.address}
                    blurb={v.blurb}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="travel-note reveal">
          <strong>
            <Trans>Dress code:</Trans>
          </strong>{' '}
          <Trans>Festive elegant — red and black are welcome.</Trans>
        </p>
      </div>
    </section>
  );
}