"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo, ChevronUp, X, Mic, Users, Grid, Alert } from "./icons";
import { actions } from "@/lib/db";

const GROUPS = [
  {
    label: "Student", userId: "s-maya", icon: Mic, tone: "text-gold",
    links: [
      { href: "/student", label: "Home" },
      { href: "/student/record", label: "Record a clip" },
      { href: "/student/feedback/r-1", label: "Feedback screen" },
      { href: "/student/feedback/r-5", label: "Flagged — what the student sees", warn: true },
    ],
  },
  {
    label: "Teacher", userId: "u-alex", icon: Users, tone: "text-sky",
    links: [
      { href: "/teacher", label: "Classes" },
      { href: "/teacher/students", label: "Students" },
      { href: "/teacher/review", label: "Review queue" },
      { href: "/teacher/recording/r-5", label: "Flagged — what the teacher sees", warn: true },
    ],
  },
  {
    label: "Admin", userId: "u-sam", icon: Grid, tone: "text-mint",
    links: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/classes", label: "Classes" },
      { href: "/admin/students", label: "Students" },
    ],
  },
];

export function DemoSwitcher() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (path === "/") return null;

  const current = path.startsWith("/teacher") ? "Teacher" : path.startsWith("/admin") ? "Admin" : "Student";

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-50 print:hidden">
      {open && (
        <div className="mb-2.5 w-[268px] overflow-hidden rounded-xl border border-line-2 bg-surface-2 shadow-[0_24px_60px_-16px_rgb(0_0_0/.75)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <Logo className="text-gold" size={16} />
              <span className="text-[13px] font-semibold text-ink">Jump to a screen</span>
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-faint hover:bg-surface-3 hover:text-ink">
              <X width={15} height={15} />
            </button>
          </div>

          <div className="max-h-[62vh] overflow-y-auto px-2 py-2">
            {GROUPS.map((g) => (
              <div key={g.label} className="mb-1.5 last:mb-0">
                <div className="flex items-center gap-1.5 px-2 pb-1 pt-1.5">
                  <g.icon width={13} height={13} className={g.tone} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">{g.label}</span>
                </div>
                {g.links.map((l) => {
                  const active = path === l.href;
                  return (
                    <button
                      key={l.href}
                      onClick={() => { actions.signIn(g.userId); router.push(l.href); }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-left text-[13px] transition-colors ${
                        active ? "bg-white/[0.06] font-medium text-gold" : "text-body hover:bg-white/[0.04] hover:text-ink-2"
                      }`}
                    >
                      {l.warn && <Alert width={12} height={12} className="shrink-0 text-rose" />}
                      {l.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="border-t border-line px-3 py-2.5">
            <button
              onClick={() => { actions.resetDemo(); router.push("/"); }}
              className="w-full rounded-lg px-2 py-1.5 text-left text-[12.5px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink-2"
            >
              Reset the demo data
            </button>
            <p className="px-2 pt-1.5 text-[11px] leading-relaxed text-faint">
              This panel switches accounts for the walkthrough. It is not part of the product.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line-2 bg-surface-2/95 py-2 pl-3 pr-3.5 text-[12.5px] font-semibold text-ink-2 shadow-[0_18px_44px_-14px_rgb(0_0_0/.8)] backdrop-blur transition-all hover:border-gold/40 hover:text-ink"
      >
        <Logo className="text-gold" size={15} />
        Viewing as {current}
        <ChevronUp width={14} height={14} className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
