import type { ReactNode } from 'react';
import { Sprig } from './Sprig';

type SectionHeadProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  titleId: string;
};

export function SectionHead({ eyebrow, title, intro, titleId }: SectionHeadProps) {
  return (
    <div className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={titleId}>{title}</h2>
      {intro ? <p>{intro}</p> : null}
      <Sprig />
    </div>
  );
}