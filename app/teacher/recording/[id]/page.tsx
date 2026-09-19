"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LABEL } from "@/lib/safety";
import { buildCoachingNotes, DIMENSION_STYLE } from "@/lib/coaching";
import { StatTile, Avatar, formatDuration, Pill } from "@/components/ui";
import { TranscriptView } from "@/components/transcript";
import { AudioBar } from "@/components/audio";
import { ClipStrip } from "@/components/art";
import { Toast, Textarea } from "@/components/forms";
import {
  Gauge, Quote, Clock, ChevronLeft, Alert, Eye, EyeOff, MessageSquare, Check, Shield, X,
} from "@/components/icons";
import { actions, hydrate, getAudio, initials } from "@/lib/db";
import { useSession } from "@/lib/use-store";

export default function TeacherRecording() {
  const { id } = useParams<{ id: string }>();
  const { store, person } = useSession();
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const row = store.recordings.find((r) => r.id === id);
  const rec = row ? hydrate(store, row) : null;

  if (!rec || !person) {
    return (
      <div className="mx-auto max-w-2xl pt-16 text-center">
        <p className="text-[15px] text-body">That recording is not in the demo data.</p>
        <Link href="/teacher" className="btn btn-tint mt-5">Back to classes</Link>
      </div>
    );
  }

  const a = rec.analysis;
  const notes = buildCoachingNotes(a);
  const flagged = rec.flags.length > 0;
  const audio = getAudio(rec.id);

  function send() {
    if (!comment.trim() || !person || !rec) return;
    actions.addComment(rec.id, person.id, comment);
    setComment("");
    setToast(`Comment sent to ${rec.studentName.split(" ")[0]}.`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={flagged ? "/teacher/review" : "/teacher"}
        className="rise inline-flex items-center gap-1.5 text-[13.5px] font-medium text-body hover:text-ink"
      >
        <ChevronLeft width={16} height={16} />
        {flagged ? "Back to review queue" : "Back to classes"}
      </Link>

      <header className="rise mt-4 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-3">
          <Avatar initials={initials(rec.studentName)} tone="soft" size={38} />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-ink">{rec.studentName}</h1>
            <p className="text-[12.5px] text-muted">{rec.topic} · {rec.className} · {rec.dateLabel}</p>
          </div>
        </div>

        <button
          onClick={() => {
            actions.toggleRecordingHidden(rec.id);
            setToast(rec.hidden ? "Recording restored for the student." : "Recording hidden from the student.");
          }}
          className="btn btn-ghost px-3.5 py-2 text-[13px]"
        >
          {rec.hidden ? <><Eye width={15} height={15} /> Unhide</> : <><EyeOff width={15} height={15} /> Hide from student</>}
        </button>
      </header>

      {rec.hidden && (
        <p className="rise mt-4 rounded-lg border border-line-2 bg-surface-2 px-4 py-2.5 text-[12.5px] text-body">
          Hidden. {rec.studentName.split(" ")[0]} sees a short note instead of this feedback. You still see everything.
        </p>
      )}

      {flagged && (
        <section className="rise mt-5 rounded-xl border border-rose/20 bg-rose/[0.07] px-5 py-4" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start gap-3">
            <Alert width={19} height={19} className="mt-[2px] shrink-0 text-rose" />
            <div className="min-w-0 flex-1">
              <h2 className="text-[14.5px] font-semibold text-amber-700">Flagged before feedback was generated</h2>
              <p className="mt-1 text-[13.5px] leading-relaxed text-amber-700/90">
                {rec.flags.map((f) => CATEGORY_LABEL[f.category]).join(" · ")}. No coaching note was written and the
                student has not been shown a score. They saw a neutral message saying you would review this.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {rec.flags.map((f) => (
                  <span key={f.matched} className="rounded-full bg-white/[0.05] px-2.5 py-[3px] text-[11.5px] text-amber-700 ring-1 ring-rose/20">
                    matched “{f.matched}”
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {rec.reviewed ? (
                  <>
                    <span className="btn bg-mint/[0.12] px-3.5 py-2 text-[13px] text-mint ring-1 ring-mint/20">
                      <Check width={15} height={15} /> Marked reviewed
                    </span>
                    <button onClick={() => actions.reopenReview(rec.id)} className="btn btn-ghost px-3.5 py-2 text-[13px]">
                      Reopen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { actions.markReviewed(rec.id); setToast("Marked reviewed. Removed from the queue."); }}
                    className="btn bg-rose px-3.5 py-2 text-[13px] font-semibold text-[#2a0a0e] hover:opacity-90"
                  >
                    Mark as reviewed
                  </button>
                )}
                <button
                  onClick={() => setToast("In production this opens your school’s escalation path. The route is set at rollout, not by the app.")}
                  className="btn btn-ghost px-3.5 py-2 text-[13px]"
                >
                  Escalate to counselor
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="rise mt-6" style={{ animationDelay: "130ms" }}>
        <ClipStrip id={rec.id} tone={flagged ? "muted" : "gold"} />
      </div>

      <div className="rise mt-6 grid gap-3.5 sm:grid-cols-3" style={{ animationDelay: "150ms" }}>
        <StatTile icon={<Gauge width={18} height={18} />} value={a.wpm} label="words per minute" tone="brand" />
        <StatTile icon={<Quote width={18} height={18} />} value={a.fillerCount} label="filler words" tone="violet" />
        <StatTile icon={<Clock width={18} height={18} />} value={formatDuration(a.durationSec)} label="recording length" tone="slate" />
      </div>

      <section className="rise mt-6" style={{ animationDelay: "210ms" }}>
        <div className="card px-4 py-3"><AudioBar src={audio} durationSec={a.durationSec} /></div>
      </section>

      <section className="rise mt-6" style={{ animationDelay: "260ms" }}>
        <TranscriptView text={rec.transcript} hits={a.hits} collapsedChars={9999} />
      </section>

      {!flagged && (
        <section className="rise mt-6" style={{ animationDelay: "310ms" }}>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Coaching notes shown to the student</h2>
            <Pill tone="mint"><Shield width={12} height={12} /> passed screening</Pill>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {notes.map((n) => {
              const s = DIMENSION_STYLE[n.dimension];
              const off = rec.hiddenNoteTitles.includes(n.title);
              return (
                <div key={n.title} className={`rounded-xl border px-5 py-4 transition-opacity ${s.border} ${s.tint} ${off ? "opacity-40" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14.5px] font-semibold leading-snug text-ink">{n.title}</h3>
                    <button
                      onClick={() => {
                        actions.toggleNoteHidden(rec.id, n.title);
                        setToast(off ? "Note is visible to the student again." : "Note hidden from the student.");
                      }}
                      title={off ? "Show to student" : "Hide from student"}
                      className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-white/[0.07] hover:text-ink"
                    >
                      {off ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">{n.body}</p>
                  <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
                    {s.title} · {off ? "hidden" : "visible"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rise mt-6" style={{ animationDelay: "360ms" }}>
        <h2 className="mb-2.5 text-[15px] font-semibold text-ink">
          Comments to {rec.studentName.split(" ")[0]}
        </h2>

        {rec.comments.length > 0 && (
          <div className="mb-3 space-y-2.5">
            {rec.comments.map((c) => (
              <div key={c.id} className="card flex items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[14px] leading-relaxed text-ink-2">{c.body}</p>
                  <p className="mt-2 text-[12px] text-muted">
                    {c.authorName} · {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                {c.authorId === person.id && (
                  <button
                    onClick={() => { actions.deleteComment(c.id); setToast("Comment deleted."); }}
                    title="Delete comment"
                    className="shrink-0 rounded-md p-1 text-faint transition-colors hover:bg-white/[0.07] hover:text-rose"
                  >
                    <X width={15} height={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="card p-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Something specific they can act on next time…"
            className="border-0 bg-transparent px-2.5 focus:border-0"
          />
          <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
            <span className="pl-1 text-[12px] text-faint">Only {rec.studentName.split(" ")[0]} sees it.</span>
            <button
              disabled={!comment.trim()}
              onClick={send}
              className="btn btn-primary px-4 py-2 text-[13px] disabled:cursor-not-allowed disabled:bg-line-2 disabled:text-faint"
            >
              <MessageSquare width={15} height={15} /> Send comment
            </button>
          </div>
        </div>
      </section>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
