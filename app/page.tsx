"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { actions } from "@/lib/db";
import { Logo, ArrowRight, Mic, Users, Grid, Check } from "@/components/icons";
import { HeroSignal } from "@/components/decor";
import { FadeRule, Spectrogram } from "@/components/art";

const ROLES = [
  {
    href: "/student", userId: "s-maya", name: "Student", who: "Maya Chen · Grade 9", n: "01",
    blurb: "Record a clip, get pace, filler words and two coaching notes back. Browse past practice.",
    icon: Mic,
  },
  {
    href: "/teacher", userId: "u-alex", name: "Teacher", who: "Alex Morgan · Period 3", n: "02",
    blurb: "Class roster with trends, every recording and transcript, comments, and the flagged review queue.",
    icon: Users,
  },
  {
    href: "/admin", userId: "u-sam", name: "Admin", who: "Sam Lee · District", n: "03",
    blurb: "Classes, teachers and students, plus usage and filler-word trends across the program.",
    icon: Grid,
  },
];

const REAL = [
  "Recording in the browser, with live waveform and playback",
  "Words per minute, measured from the transcript",
  "Filler-word detection, including the pause rule for “like” and “so”",
  "Coaching notes, generated from the measured numbers",
  "Safety screening, with flagged clips routed to the teacher",
  "Every number on every screen is derived, not typed in",
];

const SIMULATED = [
  "Speech-to-text — production uses Whisper; the demo pairs your clip with a sample passage",
  "Model-written coaching sentences — the demo ships the deterministic fallback only",
  "Sign-in, and data shared between devices",
];

export default function Home() {
  const router = useRouter();

  function enter(userId: string, href: string) {
    actions.signIn(userId);
    router.push(href);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <header className="rise flex items-center justify-between">
          <span className="inline-flex items-center gap-2.5">
            <Logo className="text-gold" size={22} />
            <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">Practice Studio</span>
          </span>
          <span className="eyebrow hidden sm:block">MVP demo · September 2026</span>
        </header>

        <div className="rise -mx-5 mt-2 sm:-mx-8" style={{ animationDelay: "60ms" }}>
          <HeroSignal />
        </div>

        <section className="rise -mt-6" style={{ animationDelay: "120ms" }}>
          <h1 className="font-serif-display max-w-2xl text-[42px] leading-[1.04] text-ink sm:text-[58px]">
            A working demo of the MVP,
            <br className="hidden sm:block" /> <span className="italic text-gold">end to end.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15.5px] leading-[1.65] text-body">
            Record a clip and watch it move through the whole pipeline — pace, filler words, safety screening,
            coaching notes — then see the same recording from the teacher and admin side.
          </p>
          <p className="mt-3 text-[13.5px] text-muted">
            Pick a role to jump straight in, or{" "}
            <Link href="/login" className="font-medium text-gold underline-offset-4 hover:underline">sign in with an email address</Link>.
          </p>
        </section>

        <FadeRule className="mt-12" />

        <div className="grid sm:grid-cols-3">
          {ROLES.map((r, i) => (
            <button
              key={r.href}
              onClick={() => enter(r.userId, r.href)}
              className="rise group relative flex flex-col border-b border-line px-1 py-7 text-left transition-colors sm:border-b-0 sm:px-6 sm:py-8 sm:first:pl-1 [&:not(:last-child)]:sm:border-r"
              style={{ animationDelay: `${180 + i * 70}ms` }}
            >
              <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
              <div className="flex items-center justify-between">
                <span className="chip bg-white/[0.04] text-body ring-1 ring-line-2 transition-colors group-hover:bg-gold/10 group-hover:text-gold group-hover:ring-gold/20">
                  <r.icon width={17} height={17} />
                </span>
                <span className="num text-[11px] text-faint">{r.n}</span>
              </div>
              <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.015em] text-ink">{r.name}</h2>
              <p className="mt-1 text-[12px] font-medium text-muted">{r.who}</p>
              <p className="mt-3 flex-1 text-[13.5px] leading-[1.6] text-body">{r.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold">
                Open
                <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>

        <FadeRule />

        <section className="rise relative mt-14 overflow-hidden" style={{ animationDelay: "400ms" }}>
          <div className="pointer-events-none absolute -right-8 top-0 hidden h-[130px] w-[300px] opacity-40 [mask-image:linear-gradient(to_right,transparent,black)] lg:block">
            <Spectrogram className="h-full w-full" seed={21} cols={40} rows={11} />
          </div>

          <p className="eyebrow">Before you click around</p>
          <h2 className="mt-3 max-w-lg text-[21px] font-semibold leading-snug tracking-[-0.02em] text-ink">
            What is real here, and what is standing in
          </h2>
          <p className="mt-2.5 max-w-2xl text-[13.5px] leading-[1.65] text-body">
            The demo runs with no API keys, so the two pieces that need an outside service are stubbed and
            everything else is the real code. Worth being clear about which is which.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow text-mint">Really running</h3>
              <ul className="mt-4 space-y-2.5">
                {REAL.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13.5px] leading-[1.6] text-ink-2">
                    <Check width={14} height={14} className="mt-[4px] shrink-0 text-mint" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow">Standing in for now</h3>
              <ul className="mt-4 space-y-2.5">
                {SIMULATED.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13.5px] leading-[1.6] text-body">
                    <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-faint" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <FadeRule className="mt-14" />

        <footer className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-faint">
          <span>Built for the Practice Studio MVP brief.</span>
          <span>·</span>
          <span>Next.js, TypeScript and Tailwind, deployed on Vercel.</span>
        </footer>
      </div>
    </div>
  );
}
