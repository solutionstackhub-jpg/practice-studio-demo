"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StudentPage } from "@/components/shells";
import { StatTile, formatDuration } from "@/components/ui";
import { TranscriptView } from "@/components/transcript";
import { AudioBar } from "@/components/audio";
import { Gauge, Quote, Clock, ArrowRight, Shield, Sparkle, EyeOff } from "@/components/icons";
import { ClipStrip, AmbientGlow } from "@/components/art";
import { hydrate, getAudio } from "@/lib/db";
import { useSession } from "@/lib/use-store";
import { buildCoachingNotes, DIMENSION_STYLE, type Dimension } from "@/lib/coaching";

const DIM_ICON: Record<Dimension, typeof Gauge> = { pace: Gauge, fillers: Quote, clarity: Sparkle };

function headline(wpm: number, fillersPerMin: number) {
  if (fillersPerMin < 1.5 && wpm >= 115 && wpm <= 155) return "Strong take. Here’s what kept it working.";
  if (fillersPerMin >= 4) return "Good effort. Here’s the one habit to chip away at.";
  return "Nice work. Here’s what to focus on next.";
}

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const { store, person } = useSession();

  const row = store.recordings.find((r) => r.id === id);
  const rec = row ? hydrate(store, row) : null;

  if (!rec || !person) {
    return (
      <StudentPage back={{ href: "/student" }}>
        <div className="mx-auto max-w-md pt-16 text-center">
          <h1 className="text-[21px] font-semibold text-ink">That recording is not here any more.</h1>
          <p className="mt-2.5 text-[14px] text-body">It may have been removed, or made in a different browser.</p>
          <Link href="/student/record" className="btn btn-primary mt-6">Record a new one</Link>
        </div>
      </StudentPage>
    );
  }

  /* -------- hidden by the teacher -------- */
  if (rec.hidden) {
    return (
      <StudentPage back={{ href: "/student" }}>
        <div className="rise mx-auto max-w-xl pt-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/[0.05] text-muted ring-1 ring-line-2">
            <EyeOff width={21} height={21} />
          </span>
          <h1 className="mt-5 text-[21px] font-semibold text-ink">Your teacher has taken this one down.</h1>
          <p className="mx-auto mt-2.5 max-w-sm text-[14px] leading-relaxed text-body">
            It is not gone — your teacher can still see it and may want to talk it through with you.
          </p>
          <Link href="/student" className="btn btn-ghost mt-6">Back to home</Link>
        </div>
      </StudentPage>
    );
  }

  /* -------- flagged: no metrics, no notes -------- */
  if (rec.flags.length > 0) {
    return (
      <StudentPage back={{ href: "/student" }}>
        <div className="rise mx-auto max-w-xl pt-8">
          <p className="eyebrow">{rec.topic} · {rec.dateLabel}</p>
          <div className="card mt-4 px-6 py-9 text-center sm:px-10 sm:py-11">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/[0.10] text-gold ring-1 ring-gold/20">
              <Shield width={22} height={22} />
            </span>
            <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-ink">
              Your teacher will take a look at this one.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-body">
              Thanks for recording. We have passed this to your teacher to read through, so there is no
              feedback on this take yet.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted">
              If you would like to talk to someone now, your school counselor’s door is open.
            </p>
            <div className="mt-7 flex justify-center gap-2.5">
              <Link href="/student" className="btn btn-ghost">Back to home</Link>
              <Link href="/student/record" className="btn btn-primary">Record something else</Link>
            </div>
          </div>

          {rec.comments.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {rec.comments.map((c) => (
                <div key={c.id} className="card px-5 py-4">
                  <p className="text-[14px] leading-relaxed text-ink-2">{c.body}</p>
                  <p className="mt-2 text-[12px] text-muted">{c.authorName}</p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-5 text-[11.5px] leading-relaxed text-faint">
            Demo note: screening ran before any coaching note was written, so nothing was generated for this
            clip. The teacher’s copy is in their review queue.
          </p>
        </div>
      </StudentPage>
    );
  }

  /* -------- normal feedback -------- */
  const a = rec.analysis;
  const notes = buildCoachingNotes(a).filter((n) => !rec.hiddenNoteTitles.includes(n.title));
  const audio = getAudio(rec.id);

  return (
    <StudentPage back={{ href: "/student" }}>
      <div className="relative mx-auto max-w-3xl">
        <AmbientGlow className="-left-32 -top-28 h-[260px] w-[420px]" />

        <div className="rise relative">
          <p className="eyebrow">{rec.topic} · {rec.dateLabel}</p>
          <h1 className="mt-3 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[31px]">
            {headline(a.wpm, a.fillersPerMinute)}
          </h1>
        </div>

        <div className="rise mt-6" style={{ animationDelay: "50ms" }}>
          <ClipStrip id={rec.id} />
        </div>

        <div className="rise mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3" style={{ animationDelay: "70ms" }}>
          <StatTile icon={<Gauge width={18} height={18} />} value={a.wpm} label="words per minute" tone="brand" />
          <StatTile icon={<Quote width={18} height={18} />} value={a.fillerCount} label="filler words" tone="violet" />
          <StatTile icon={<Clock width={18} height={18} />} value={formatDuration(a.durationSec)} label="recording length" tone="slate" />
        </div>

        {notes.length > 0 && (
          <section className="rise mt-7" style={{ animationDelay: "140ms" }}>
            <h2 className="mb-2.5 text-[15px] font-semibold text-ink">Coaching notes</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {notes.map((n) => {
                const s = DIMENSION_STYLE[n.dimension];
                const Icon = DIM_ICON[n.dimension];
                return (
                  <div key={n.title} className={`rounded-xl border ${s.border} ${s.tint} px-5 py-4`}>
                    <Icon width={18} height={18} className={s.icon} />
                    <h3 className="mt-2.5 text-[14.5px] font-semibold leading-snug text-ink">{n.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">{n.body}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11.5px] text-faint">
              Notes only ever cover pace, filler words and clarity. Your teacher can edit or hide any of them.
            </p>
          </section>
        )}

        <section className="rise mt-7" style={{ animationDelay: "210ms" }}>
          <TranscriptView text={rec.transcript} hits={a.hits} />
          {a.byFiller.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-muted">Counted:</span>
              {a.byFiller.map((f) => (
                <span key={f.id} className="tnum rounded-full bg-rose-50 px-2.5 py-[3px] text-[11.5px] font-medium text-rose-600">
                  {f.label} × {f.count}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rise mt-7 flex flex-col gap-4 sm:flex-row sm:items-center" style={{ animationDelay: "280ms" }}>
          <div className="card flex-1 px-4 py-3">
            <AudioBar src={audio} durationSec={a.durationSec} />
          </div>
          <Link href="/student/record" className="btn btn-primary justify-center px-5 py-3">
            Practice again <ArrowRight width={16} height={16} />
          </Link>
        </section>

        {rec.comments.length > 0 && (
          <section className="rise mt-7" style={{ animationDelay: "340ms" }}>
            <h2 className="mb-2.5 text-[15px] font-semibold text-ink">From your teacher</h2>
            <div className="space-y-2.5">
              {rec.comments.map((c) => (
                <div key={c.id} className="card px-5 py-4">
                  <p className="text-[14px] leading-relaxed text-ink-2">{c.body}</p>
                  <p className="mt-2 text-[12px] text-muted">
                    {c.authorName} · {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!audio && (
          <p className="mt-9 text-[11.5px] leading-relaxed text-faint">
            Demo note: this transcript stands in for Whisper, which needs an API key. Pace, filler detection,
            screening and the coaching notes above all ran for real on the text.
          </p>
        )}
      </div>
    </StudentPage>
  );
}
