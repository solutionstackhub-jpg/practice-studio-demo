"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, ArrowRight, Check, Clock } from "@/components/icons";
import { Toast } from "@/components/forms";
import { CATEGORY_LABEL } from "@/lib/safety";
import { actions, openFlags, hydrate, initials } from "@/lib/db";
import { useStore } from "@/lib/use-store";
import { Avatar } from "@/components/ui";

function ago(ts: number) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ReviewQueue() {
  const store = useStore();
  const [toast, setToast] = useState<string | null>(null);

  const pending = openFlags(store);
  const done = store.recordings
    .map((r) => hydrate(store, r))
    .filter((r) => r.flags.length > 0 && r.reviewed)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rise">
        <p className="eyebrow text-rose">Screening queue</p>
        <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Needs review</h1>
        <p className="mt-2 text-[14.5px] text-body">
          {pending.length > 0
            ? "These recordings were flagged for teacher review."
            : "Nothing waiting right now."}
        </p>
      </div>

      <div className="mt-6 space-y-3.5">
        {pending.map((r, i) => (
          <article key={r.id} className="rise card px-5 py-4" style={{ animationDelay: `${70 + i * 70}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose/[0.10] text-rose ring-1 ring-rose/20">
                  <Alert width={16} height={16} />
                </span>
                <span className="text-[15px] font-semibold text-ink">{r.studentName}</span>
              </span>
              <span className="shrink-0 pt-1 text-[12px] text-muted">{ago(r.createdAt)}</span>
            </div>

            <p className="mt-3.5 text-[14px] font-medium text-ink-2">Recording flagged for teacher review</p>
            <p className="mt-0.5 text-[13.5px] text-muted">
              {r.flags.map((f) => CATEGORY_LABEL[f.category]).join(" · ")}
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => { actions.markReviewed(r.id); setToast(`${r.studentName}’s recording marked reviewed.`); }}
                className="btn btn-ghost px-3.5 py-2 text-[13px]"
              >
                <Check width={15} height={15} /> Mark reviewed
              </button>
              <Link href={`/teacher/recording/${r.id}`} className="btn btn-tint">
                Review recording <ArrowRight width={15} height={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {pending.length === 0 && (
        <div className="card mt-6 px-5 py-10 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-mint/[0.10] text-mint ring-1 ring-mint/20">
            <Check width={19} height={19} />
          </span>
          <p className="mt-3.5 text-[14.5px] font-medium text-ink">Nothing waiting.</p>
          <p className="mt-1 text-[13.5px] text-muted">Flagged recordings land here the minute they are screened.</p>
        </div>
      )}

      {done.length > 0 && (
        <section className="mt-9">
          <h2 className="eyebrow flex items-center gap-2"><Clock width={13} height={13} /> Reviewed</h2>
          <div className="mt-3 space-y-2">
            {done.map((r) => (
              <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span className="flex items-center gap-2.5">
                  <Avatar initials={initials(r.studentName)} tone="soft" size={26} />
                  <span>
                    <span className="block text-[13.5px] font-medium text-ink">{r.studentName}</span>
                    <span className="block text-[12px] text-muted">
                      {r.flags.map((f) => CATEGORY_LABEL[f.category]).join(" · ")}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button onClick={() => actions.reopenReview(r.id)} className="text-[12.5px] font-medium text-muted hover:text-ink">
                    Reopen
                  </button>
                  <Link href={`/teacher/recording/${r.id}`} className="btn btn-ghost px-3 py-1.5 text-[12.5px]">Open</Link>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-[11.5px] leading-relaxed text-faint">
        Screening runs before any coaching note is written, so a flagged student sees a neutral holding message
        rather than a score. Escalation rules — who is told, how fast, and what happens over a weekend — are set
        by the school, not by the app.
      </p>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
