import type { SVGProps } from 'react';

type SprigProps = SVGProps<SVGSVGElement> & {
  variant?: 'sm' | 'lg';
};

export function Sprig({ variant, ...props }: SprigProps) {
  return (
    <div className={`sprig${variant ? ` sprig--${variant}` : ''}`} aria-hidden="true">
      <svg
        viewBox="0 0 96 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* stem */}
        <path d="M48 6 C42 38 52 74 46 132" />
        <path d="M49 74 C52 76 54 80 56 84" />

        {/* leaves */}
        <path d="M44 44 C30 40 20 46 14 58 C24 60 36 58 44 52 Z" />
        <path d="M44 44 C34 48 24 54 17 58" />
        <path d="M50 66 C58 58 70 56 80 62 C72 70 60 72 50 72 Z" />
        <path d="M50 66 C62 62 72 62 79 62" />
        <path d="M46 92 C32 90 22 94 15 104 C26 106 38 104 44 99 Z" />
        <path d="M46 92 C34 96 26 100 17 103" />
        <path d="M43 22 C36 20 30 23 27 28 C33 31 39 30 42 27 Z" />
        <path d="M48 30 C55 27 62 28 66 33 C59 35 52 34 47 35 Z" />

        {/* main bloom */}
        <circle cx="32" cy="40" r="17" />
        <circle cx="32" cy="40" r="12" strokeDasharray="13 9" />
        <circle cx="32" cy="40" r="6" />
        <circle cx="32" cy="40" r="2.5" fill="currentColor" stroke="none" />

        {/* small upper bloom */}
        <circle cx="62" cy="24" r="11" />
        <circle cx="62" cy="24" r="7" strokeDasharray="8 6" />
        <circle cx="62" cy="24" r="3" />
        <circle cx="62" cy="24" r="1.2" fill="currentColor" stroke="none" />

        {/* bud */}
        <circle cx="56" cy="84" r="7" />
        <circle cx="56" cy="84" r="4" />
      </svg>
    </div>
  );
}