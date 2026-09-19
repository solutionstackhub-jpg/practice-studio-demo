"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Pill, EmptyNote } from "@/components/ui";
import { Input } from "@/components/forms";
import { ArrowRight, Alert, MessageSquare } from "@/components/icons";
import { classRoster, recordingsFor, initials } from "@/lib/db";
import { useSession } from "@/lib/use-store";

export default function TeacherStudents() {
  const { store, person } = useSession();
  const [q, setQ] = useState("");
  if (!person) return null;

  const myClasses = store.classes.filter((c) => c.teacherId === person.id);
  const classes = myClasses.length ? myClasses : store.classes;

  const seen = new Set<string>();
  const roster = classes.flatMap((c) =>
    classRoster(store, c.id)
      .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
      .map((s) => ({ ...s, className: c.name }))
  );

  const filtered = q.trim()
    ? roster.filter((s) => (s.name + s.email).toLowerCase().includes(q.trim().toLowerCase()))
    : roster;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{roster.length} enrolled across {classes.length} classes</p>
          <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Students</h1>
        </div>
        <div className="w-full sm:w-[240px]">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" />
        </div>
      </div>

      <div className="rise mt-6 space-y-2.5" style={{ animationDelay: "70ms" }}>
        {filtered.map((s) => {
          const recs = recordingsFor(store, s.id);
          const clean = recs.filter((r) => r.flags.length === 0);
          const avg = clean.length ? Math.round(clean.reduce((n, r) => n + r.analysis.wpm, 0) / clean.length) : 0;
          const pending = recs.filter((r) => r.flags.length > 0 && !r.reviewed).length;
          const comments = recs.reduce((n, r) => n + r.comments.length, 0);
          const latest = recs[0];

          return (
            <article key={s.id} className="card px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials={initials(s.name)} tone="soft" size={36} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{s.name}</span>
                      {pending > 0 && <Pill tone="amber"><Alert width={12} height={12} /> {pending} to review</Pill>}
                      {comments > 0 && (
                        <span className="tnum inline-flex items-center gap-1 text-[12px] text-muted">
                          <MessageSquare width={12} height={12} /> {comments}
                        </span>
                      )}
                    </span>
                    <span className="tnum mt-0.5 block truncate text-[12px] text-muted">
                      {s.className} · {recs.length} recording{recs.length === 1 ? "" : "s"}
                      {avg > 0 && ` · ${avg} avg. wpm`}
                    </span>
                  </span>
                </span>

                {latest ? (
                  <Link href={`/teacher/recording/${latest.id}`} className="btn btn-tint">
                    Latest <ArrowRight width={15} height={15} />
                  </Link>
                ) : (
                  <span className="text-[12.5px] text-faint">No recordings yet</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6">
          <EmptyNote>{q ? `Nobody matches “${q}”.` : "No students enrolled in your classes yet."}</EmptyNote>
        </div>
      )}
    </div>
  );
}
