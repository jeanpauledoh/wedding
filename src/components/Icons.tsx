import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    'aria-hidden': true,
    ...props
  } as const;
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8.5" cy="14" r="5.5" />
      <circle cx="15.5" cy="14" r="5.5" />
      <path d="M9 4l3 3 3-3M12 7V2" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CocktailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3l1 8a4 4 0 0 0 8 0l1-8" />
      <path d="M12 15v6M9 21h6" />
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

export function HouseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 8h20v3H2z" />
      <path d="M4 11v9h16v-9M12 8v12" />
      <path d="M12 8S9 3 6.5 4 8 8 12 8s4-5 1.5-4S12 8 12 8Z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-4.4-9.2-8.6C1 9 2.7 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21.3 5 23 9 21.2 12.4 19 16.6 12 21 12 21Z" />
    </svg>
  );
}