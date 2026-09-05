import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { party1, party2, party3, party4, party5, party6 } from '../images';

export function Party() {
  useLingui();

  const members = [
    {
      src: party1,
      role: t`Maid of Honor`,
      name: 'Sofia Marlow',
      bio: t`Raquel's sister, chief cheerleader, and the only person allowed to give a speech longer than five minutes.`,
      alt: t`Portrait of Sofia Marlow`
    },
    {
      src: party2,
      role: t`Best Man`,
      name: 'Daniel Reyes',
      bio: t`Jean-Paul's college roommate and partner in every questionable road-trip decision since 2014.`,
      alt: t`Portrait of Daniel Reyes`
    },
    {
      src: party3,
      role: t`Bridesmaid`,
      name: 'Priya Anand',
      bio: t`The friend who answers the phone at 2 a.m. and shows up with snacks by 2:20.`,
      alt: t`Portrait of Priya Anand`
    },
    {
      src: party4,
      role: t`Groomsman`,
      name: 'Marcus Bell',
      bio: t`Jean-Paul's younger brother, official ring-bearer wrangler and unofficial dance-floor starter.`,
      alt: t`Portrait of Marcus Bell`
    },
    {
      src: party5,
      role: t`Bridesmaid`,
      name: 'Hannah Cole',
      bio: t`Neighbour turned family, and the reason Raquel and Jean-Paul ever went on that first double date.`,
      alt: t`Portrait of Hannah Cole`
    },
    {
      src: party6,
      role: t`Groomsman`,
      name: 'Theo Nakamura',
      bio: t`The steady one — first to arrive, last to leave, and keeper of every emergency safety pin.`,
      alt: t`Portrait of Theo Nakamura`
    }
  ];

  return (
    <section className="section section--blush" id="party" aria-labelledby="party-title">
      <div className="container">
        <SectionHead
          titleId="party-title"
          eyebrow={<Trans>by our side</Trans>}
          title={<Trans>The Wedding Party</Trans>}
          intro={
            <Trans>The dearest friends and family who have carried us here — and who will be standing with us on the day.</Trans>
          }
        />

        <div className="party-grid">
          {members.map((member) => (
            <article key={member.name} className="party-card reveal">
              <div className="party-portrait">
                <img src={member.src} alt={member.alt} loading="lazy" />
              </div>
              <p className="party-role">{member.role}</p>
              <h3>{member.name}</h3>
              <p>{member.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}