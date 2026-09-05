import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SectionHead } from './SectionHead';
import { gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, venue } from '../images';

export function Gallery() {
  useLingui();

  const items = [
    { src: gallery1, className: 'g-tall', alt: t`Close-up of blush garden roses in bloom` },
    { src: gallery6, className: 'g-wide', alt: t`Elegant table setting with gold flatware and taper candles` },
    { src: gallery3, className: '', alt: t`Pair of gold wedding bands on a velvet cushion` },
    { src: gallery5, className: '', alt: t`Rows of vines across a vineyard` },
    { src: gallery2, className: 'g-tall', alt: t`Three-tier naked wedding cake dressed with flowers` },
    { src: gallery4, className: '', alt: t`Warm candlelight glowing across a dinner table` },
    { src: venue, className: 'g-wide', alt: t`An estate glowing at golden hour` }
  ];

  return (
    <section className="section" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHead
          titleId="gallery-title"
          eyebrow={<Trans>moments</Trans>}
          title={<Trans>Little Glimpses</Trans>}
          intro={
            <Trans>A few of our favourite frames from the last seven years — and a hint of what the day will feel like.</Trans>
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