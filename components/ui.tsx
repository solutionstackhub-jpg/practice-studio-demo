import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./icons";

export function Avatar({
  initials, tone = "brand", size = 32,
}: { initials: string; tone?: "brand" | "dark" | "soft"; size?: number }) {
  const tones = {
    brand: "bg-gold text-[#17130a]",
    dark: "bg-white/[0.07] text-ink ring-1 ring-white/10",
    soft: "bg-white/[0.05] text-ink-2 ring-1 ring-line-2",
  } as const;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${tones[tone]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

export function Wordmark({ href = "/", size = 20 }: { dark?: boolean; href?: string; size?: number }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <Logo className="text-gold transition-opacity group-hover:opacity-80" size={size} />
      <span className="text-[14.5px] font-semibold tracking-[-0.015em] text-ink">Practice Studio</span>
    </Link>
  );
}

export function StatTile({
  icon, value, label, tone = "brand", sub,
}: {
  icon: ReactNode; value: ReactNode; label: string;
  tone?: "brand" | "violet" | "mint" | "slate"; sub?: ReactNode;
}) {
  const tones = {
    brand:  "bg-gold/[0.10] text-gold ring-1 ring-gold/15",
    violet: "bg-sky/[0.10] text-sky ring-1 ring-sky/15",
    mint:   "bg-mint/[0.10] text-mint ring-1 ring-mint/15",
    slate:  "bg-white/[0.04] text-body ring-1 ring-line-2",
  } as const;
  return (
    <div className="card p-4 sm:p-[18px]">
      <div className="flex items-start justify-between">
        <span className={`chip ${tones[tone]}`}>{icon}</span>
        {sub}
      </div>
      <div className="num mt-4 text-[27px] leading-none text-ink">{value}</div>
      <div className="mt-2 text-[12.5px] text-muted">{label}</div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Delta({ pct }: { pct: number }) {
  const better = pct < 0; // fewer fillers is better
  return (
    <span className={`num inline-flex items-center gap-1 text-[12.5px] ${better ? "text-mint" : "text-rose"}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {better ? <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></> : <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>}
      </svg>
      {Math.abs(pct)}%
    </span>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "amber" | "mint" | "brand" }) {
  const tones = {
    slate: "bg-white/[0.05] text-body ring-1 ring-line-2",
    amber: "bg-rose/[0.10] text-amber-700 ring-1 ring-rose/20",
    mint:  "bg-mint/[0.10] text-mint ring-1 ring-mint/20",
    brand: "bg-gold/[0.10] text-gold ring-1 ring-gold/20",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-2 px-5 py-8 text-center text-[13.5px] text-muted">
      {children}
    </div>
  );
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
