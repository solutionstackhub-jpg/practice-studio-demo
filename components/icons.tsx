import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export function Logo({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="currentColor">
        <rect x="1"  y="9"  width="2.4" height="6"  rx="1.2" opacity=".45" />
        <rect x="5"  y="6"  width="2.4" height="12" rx="1.2" opacity=".7" />
        <rect x="9"  y="2"  width="2.4" height="20" rx="1.2" />
        <rect x="13" y="6"  width="2.4" height="12" rx="1.2" opacity=".7" />
        <rect x="17" y="9"  width="2.4" height="6"  rx="1.2" opacity=".45" />
        <rect x="21" y="10.5" width="2.4" height="3" rx="1.2" opacity=".3" />
      </g>
    </svg>
  );
}

export const Mic = (p: P) => (
  <svg {...base(p)}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v4" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="m15 5-7 7 7 7" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronUp = (p: P) => (
  <svg {...base(p)}><path d="m18 15-6-6-6 6" /></svg>
);
export const Play = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" /></svg>
);
export const Pause = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="7" y="5" width="3.6" height="14" rx="1.3" /><rect x="13.4" y="5" width="3.6" height="14" rx="1.3" /></svg>
);
export const Volume = (p: P) => (
  <svg {...base(p)}><path d="M11 5 6.5 9H3v6h3.5L11 19z" /><path d="M16 9.2a4 4 0 0 1 0 5.6" /><path d="M18.8 6.4a8 8 0 0 1 0 11.2" /></svg>
);
export const Clock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 1.8" /></svg>
);
export const Quote = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M9.6 6C7 7.1 5.2 9.6 5.2 12.6c0 2.7 1.6 4.6 3.9 4.6 2 0 3.5-1.4 3.5-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.3-1.4 1.4-2.6 2.9-3.3L9.6 6Zm8.3 0c-2.6 1.1-4.4 3.6-4.4 6.6 0 2.7 1.6 4.6 3.9 4.6 2 0 3.5-1.4 3.5-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.3-1.4 1.4-2.6 2.9-3.3L17.9 6Z" />
  </svg>
);
export const Gauge = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <rect x="3"  y="13" width="3.2" height="8"  rx="1.6" opacity=".45" />
    <rect x="8.4" y="8" width="3.2" height="13" rx="1.6" opacity=".7" />
    <rect x="13.8" y="3" width="3.2" height="18" rx="1.6" />
    <rect x="19.2" y="10" width="3.2" height="11" rx="1.6" opacity=".55" />
  </svg>
);
export const Users = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.4" /><path d="M2.6 20a6.6 6.6 0 0 1 12.8 0" /><path d="M16.5 5.3a3.4 3.4 0 0 1 0 6.4" /><path d="M18 14.4A6.6 6.6 0 0 1 21.6 20" /></svg>
);
export const Student = (p: P) => (
  <svg {...base(p)}><path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" /><path d="M6.5 10.5V16c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-5.5" /></svg>
);
export const ClipboardCheck = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="16" height="17" rx="3" /><path d="M9 3.5h6v3H9z" /><path d="m8.8 13 2.2 2.2 4.2-4.2" /></svg>
);
export const Grid = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="7.4" height="7.4" rx="2" /><rect x="13.6" y="3" width="7.4" height="7.4" rx="2" /><rect x="3" y="13.6" width="7.4" height="7.4" rx="2" /><rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2" /></svg>
);
export const Alert = (p: P) => (
  <svg {...base(p)}><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4" /><path d="M12 16.8h.01" /></svg>
);
export const Plus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const Stop = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2.6" /></svg>
);
export const TrendDown = (p: P) => (
  <svg {...base(p)} strokeWidth="2.2"><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></svg>
);
export const TrendUp = (p: P) => (
  <svg {...base(p)} strokeWidth="2.2"><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
);
export const Check = (p: P) => (
  <svg {...base(p)} strokeWidth="2.2"><path d="m4.5 12.5 5 5 10-11" /></svg>
);
export const Eye = (p: P) => (
  <svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOff = (p: P) => (
  <svg {...base(p)}><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 4" /><path d="M6.4 7.9A16.6 16.6 0 0 0 2.5 12S6 18 12 18a9.6 9.6 0 0 0 3.6-.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const MessageSquare = (p: P) => (
  <svg {...base(p)}><path d="M20.5 4.5h-17v12h4v4l5-4h8v-12Z" /></svg>
);
export const Sparkle = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M12 2.5 13.9 9l6.5 1.9-6.5 1.9L12 19.3l-1.9-6.5L3.6 11l6.5-1.9L12 2.5Z" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 4.5 6v6.2c0 4.2 3.1 7.6 7.5 8.8 4.4-1.2 7.5-4.6 7.5-8.8V6L12 3Z" /><path d="m9.2 12.2 2 2 3.6-4" /></svg>
);
export const Info = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.2" /><path d="M12 7.8h.01" /></svg>
);
export const X = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
