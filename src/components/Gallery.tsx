import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { rp1, rp2, rp3, rp5, rp6, rp7, rp9, rp10, rp11, rp12, rp13 } from '../images';

export function Gallery() {
  useLingui();

  const items = [
    { src: rp13, className: 'g-tall', alt: t`A photo from our last ten years together` },
    { src: rp1, className: 'g-wide', alt: t`A scenic sunset walk` },
    { src: rp11, className: '', alt: t`Us, somewhere in the great outdoors` },
    { src: rp3, className: '', alt: t`A photo from our last ten years together` },
    { src: rp7, className: 'g-tall', alt: t`A photo from our last ten years together` },
    { src: rp9, className: '', alt: t`A photo from our last ten years together` },
    { src: rp5, className: '', alt: t`A photo from our last ten years together` },
    { src: rp2, className: 'g-tall', alt: t`A photo from our last ten years together` },
    { src: rp10, className: '', alt: t`A photo from our last ten years together` },
    { src: rp6, className: '', alt: t`A photo from our last ten years together` },
    { src: rp12, className: '', alt: t`A photo from our last ten years together` }
  ];

  return (
    <section className="section" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHead
          titleId="gallery-title"
          eyebrow={<Trans>moments</Trans>}
          title={<Trans>Little Glimpses</Trans>}
          intro={
            <Trans>A few of our favourite frames from the last 10 years. A hint of what the day will feel like.</Trans>
          }
        />

        <div className="gallery-grid reveal">
          {items.map((item) => (
            <figure key={item.src} className={`g-item${item.className ? ` ${item.className}` : ''}`}>
              <img src={item.src} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}