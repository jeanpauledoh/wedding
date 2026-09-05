import type { SVGProps } from 'react';

export function Sprig(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="sprig" aria-hidden="true">
      <svg viewBox="0 0 46 22" fill="none" stroke="currentColor" strokeWidth="1.3" {...props}>
        <path d="M23 2c-4 6-4 12 0 18 4-6 4-12 0-18Z" />
        <path d="M23 8c-3-2-7-2-10 0M23 12c3-2 7-2 10 0" />
      </svg>
    </div>
  );
}