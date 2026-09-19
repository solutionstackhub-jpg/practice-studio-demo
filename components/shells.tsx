"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar, Wordmark } from "./ui";
import { ChevronDown, ChevronLeft } from "./icons";
import { actions, initials } from "@/lib/db";
import { useSession } from "@/lib/use-store";

function UserMenu({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { person } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!person) return null;
  const first = person.name.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-2"
      >
        <Avatar initials={compact ? initials(person.name) : first[0]} size={30} />
        <span className="hidden text-[13.5px] font-medium text-ink sm:inline">{first}</span>
        <ChevronDown width={14} height={14} className="text-faint" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[224px] overflow-hidden rounded-xl border border-line-2 bg-surface-2 shadow-[0_24px_60px_-16px_rgb(0_0_0/.8)]">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[13px] font-semibold text-ink">{person.name}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-muted">{person.email}</p>
          </div>
          <button
            onClick={() => { actions.signOut(); router.push("/login"); }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-body transition-colors hover:bg-white/[0.04] hover:text-ink"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- student ---------------- */

export function StudentNav({ back }: { back?: { href: string; label?: string } }) {
  const path = usePathname();
  const links = [
    { href: "/student", label: "Home" },
    { href: "/student/practice", label: "My Practice" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-6 px-4 sm:px-6">
        {back ? (
          <Link href={back.href} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-body hover:text-ink">
            <ChevronLeft width={17} height={17} />
            {back.label ?? "Back"}
          </Link>
        ) : (
          <Wordmark href="/student" />
        )}

        {back ? (
          <div className="flex-1 text-center"><Wordmark href="/student" /></div>
        ) : (
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => {
              const active = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3 py-2 text-[13.5px] font-medium transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink-2"
                  }`}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-3 -bottom-[12px] h-[2px] rounded-full bg-gold" />}
                </Link>
              );
            })}
          </nav>
        )}

        <div className={back ? "" : "ml-auto"}><UserMenu /></div>
      </div>
    </header>
  );
}

export function StudentPage({ children, back }: { children: ReactNode; back?: { href: string; label?: string } }) {
  return (
    <div className="min-h-dvh bg-bg">
      <StudentNav back={back} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">{children}</main>
    </div>
  );
}

/* ---------------- teacher / admin ---------------- */

export type NavItem = { href: string; label: string; icon: ReactNode; badge?: number };

export function StaffShell({ nav, children }: { nav: NavItem[]; children: ReactNode }) {
  const path = usePathname();
  const { person } = useSession();

  return (
    <div className="min-h-dvh bg-bg lg:flex">
      <aside className="z-20 flex shrink-0 flex-col border-b border-line bg-navy lg:sticky lg:top-0 lg:h-dvh lg:w-[224px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-[18px]">
          <Wordmark href={person ? `/${person.role}` : "/"} />
          <span className="lg:hidden"><UserMenu compact /></span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {nav.map((item) => {
            const active = path === item.href || (item.href.split("/").length > 2 && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 whitespace-nowrap rounded-[9px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active ? "bg-white/[0.06] text-ink ring-1 ring-line-2" : "text-muted hover:bg-white/[0.03] hover:text-ink-2"
                }`}
              >
                <span className={active ? "text-gold" : "text-faint group-hover:text-body"}>{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span className="ml-auto inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-[#2a0a0e]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {person && (
          <div className="mt-auto hidden items-center gap-2.5 border-t border-line px-3.5 py-3.5 lg:flex">
            <Avatar initials={initials(person.name)} tone="dark" size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold text-ink">{person.name}</div>
              <div className="text-[11px] capitalize text-muted">{person.role}</div>
            </div>
            <UserMenu compact />
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-7 lg:px-9 lg:pt-8">{children}</main>
    </div>
  );
}
