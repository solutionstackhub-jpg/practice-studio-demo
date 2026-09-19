"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Delta, EmptyNote } from "@/components/ui";
import { Plus, ArrowRight, Alert } from "@/components/icons";
import { SignalRule } from "@/components/decor";
import { Modal, Field, Input, Toast } from "@/components/forms";
import { actions, classStats, initials, recordingsFor } from "@/lib/db";
import { useSession } from "@/lib/use-store";

/** Filler trend: this student's last three clips against the three before them. */
function fillerTrend(store: ReturnType<typeof useSession>["store"], studentId: string) {
  const recs = recordingsFor(store, studentId).filter((r) => r.flags.length === 0);
  if (recs.length < 2) return null;
  const rate = (r: (typeof recs)[number]) => r.analysis.fillersPerMinute;
  const recent = recs.slice(0, 3);
  const older = recs.slice(3, 6).length ? recs.slice(3, 6) : recs.slice(1);
  const avg = (xs: typeof recs) => xs.reduce((n, r) => n + rate(r), 0) / Math.max(1, xs.length);
  const a = avg(older), b = avg(recent);
  if (a === 0) return null;
  return Math.round(((b - a) / a) * 100);
}

export default function TeacherClasses() {
  const { store, person } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  if (!person) return null;

  const mine = store.classes.filter((c) => c.teacherId === person.id);
  const classes = mine.length ? mine : store.classes;
  const [main, ...rest] = classes;

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !person) return;
    const c = actions.createClass(name, person.id);
    setName("");
    setOpen(false);
    setToast(`“${c.name}” created. Enroll students from the admin area.`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rise">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Fall term 2026 · {classes.length} classes</p>
            <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Classes</h1>
          </div>
          <button onClick={() => setOpen(true)} className="btn btn-primary">
            <Plus width={16} height={16} /> Create class
          </button>
        </div>
        <SignalRule seed={23} className="mt-5" />
      </div>

      {main ? (
        <ClassCard id={main.id} expanded trend={fillerTrend} />
      ) : (
        <div className="mt-6"><EmptyNote>No classes yet. Create one to get started.</EmptyNote></div>
      )}

      <div className="mt-4 space-y-3.5">
        {rest.map((c, i) => <ClassCard key={c.id} id={c.id} delay={140 + i * 60} trend={fillerTrend} />)}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a class"
        subtitle="Students are enrolled separately, from the admin area or a roster import."
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={create} disabled={!name.trim()} className="btn btn-primary disabled:bg-line-2 disabled:text-faint">
              Create class
            </button>
          </>
        }
      >
        <form onSubmit={create}>
          <Field label="Class name" hint="For example: Period 2 — Persuasive Speaking">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Period 2 — Persuasive Speaking" autoFocus />
          </Field>
        </form>
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function ClassCard({
  id, expanded = false, delay = 70, trend,
}: {
  id: string; expanded?: boolean; delay?: number;
  trend: (store: ReturnType<typeof useSession>["store"], studentId: string) => number | null;
}) {
  const { store } = useSession();
  const cls = store.classes.find((c) => c.id === id);
  const stats = classStats(store, id);
  if (!cls) return null;

  if (!expanded) {
    return (
      <section className="rise card flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ animationDelay: `${delay}ms` }}>
        <div>
          <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{cls.name}</h2>
          <p className="tnum mt-0.5 text-[12.5px] text-muted">
            {stats.students} students · {stats.recordings} recordings
          </p>
        </div>
        <Link href={`/teacher/class/${cls.id}`} className="btn btn-tint">
          View class <ArrowRight width={15} height={15} />
        </Link>
      </section>
    );
  }

  return (
    <section className="rise card mt-6 overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div>
          <h2 className="text-[16.5px] font-semibold tracking-[-0.01em] text-ink">{cls.name}</h2>
          <p className="tnum mt-1 text-[12.5px] text-muted">
            {stats.students} students · {stats.recordings} recordings
            {stats.avgWpm > 0 && ` · ${stats.avgWpm} avg. WPM`}
          </p>
        </div>
        <Link href={`/teacher/class/${cls.id}`} className="btn btn-tint">
          View class <ArrowRight width={15} height={15} />
        </Link>
      </div>

      {stats.roster.length === 0 ? (
        <div className="border-t border-line px-5 py-7">
          <EmptyNote>Nobody enrolled yet.</EmptyNote>
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-white/[0.02]">
                <th className="thead px-5 py-3">Student</th>
                <th className="thead px-5 py-3">Recordings</th>
                <th className="thead px-5 py-3">Avg. pace</th>
                <th className="thead px-5 py-3">Fillers</th>
                <th className="thead px-5 py-3">Last practice</th>
              </tr>
            </thead>
            <tbody>
              {stats.roster.map((s) => {
                const recs = recordingsFor(store, s.id);
                const clean = recs.filter((r) => r.flags.length === 0);
                const avg = clean.length ? Math.round(clean.reduce((n, r) => n + r.analysis.wpm, 0) / clean.length) : 0;
                const t = trend(store, s.id);
                const flagged = recs.some((r) => r.flags.length > 0 && !r.reviewed);
                return (
                  <tr key={s.id} className="border-b border-line last:border-0 transition-colors hover:bg-white/[0.022]">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar initials={initials(s.name)} tone="soft" size={26} />
                        <span className="text-[14px] font-medium text-ink">{s.name}</span>
                        {flagged && <Alert width={13} height={13} className="text-rose" />}
                      </span>
                    </td>
                    <td className="tnum px-5 py-3 text-[13px] text-body">{recs.length}</td>
                    <td className="tnum px-5 py-3 text-[13px] text-body">{avg || "—"}</td>
                    <td className="px-5 py-3">{t === null ? <span className="text-[13px] text-faint">—</span> : <Delta pct={t} />}</td>
                    <td className="px-5 py-3 text-[13px] text-body">{recs[0]?.dateLabel ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
