import type { SVGProps } from 'react';

type FloralBranchProps = SVGProps<SVGSVGElement> & {
  mirror?: boolean;
};

export function FloralBranch({ mirror, ...props }: FloralBranchProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
      style={{ transform: mirror ? 'scaleX(-1)' : undefined, ...props.style }}
    >
      {/* main stem */}
      <path d="M150 292 C148 238 156 176 148 104" />
      <path d="M149 160 C120 150 96 152 78 166" />
      <path d="M148 170 C176 158 204 160 224 178" />

      {/* leaves along stem */}
      <path d="M145 246 C128 242 114 246 106 260 C120 264 136 261 144 252 Z" />
      <path d="M145 246 C132 250 118 256 108 258" />
      <path d="M150 210 C164 206 178 208 188 220 C175 225 160 223 151 216 Z" />
      <path d="M150 210 C163 212 177 216 186 219" />
      <path d="M146 128 C132 122 118 122 110 132 C122 138 136 136 145 133 Z" />
      <path d="M146 128 C134 128 122 132 112 131" />

      {/* left bloom */}
      <circle cx="70" cy="150" r="22" />
      <circle cx="70" cy="150" r="15" strokeDasharray="17 11" />
      <circle cx="70" cy="150" r="8" />
      <circle cx="70" cy="150" r="3" fill="currentColor" stroke="none" />

      {/* right bloom */}
      <circle cx="232" cy="162" r="20" />
      <circle cx="232" cy="162" r="13" strokeDasharray="16 10" />
      <circle cx="232" cy="162" r="7" />
      <circle cx="232" cy="162" r="2.6" fill="currentColor" stroke="none" />

      {/* top bud */}
      <circle cx="148" cy="106" r="14" />
      <circle cx="148" cy="106" r="8" strokeDasharray="9 6" />
      <circle cx="148" cy="106" r="4" />

      {/* side buds */}
      <circle cx="168" cy="70" r="10" />
      <circle cx="168" cy="70" r="5" />
      <path d="M150 86 C156 82 162 78 168 70" />
      <circle cx="120" cy="62" r="9" />
      <circle cx="120" cy="62" r="4.5" />
      <path d="M146 94 C138 84 128 70 120 62" />

      {/* small leaves near buds */}
      <path d="M158 82 C170 78 182 80 188 88 C176 92 164 89 157 87 Z" />
      <path d="M132 74 C122 70 112 72 106 78 C114 82 124 80 130 78 Z" />
    </svg>
  );
}