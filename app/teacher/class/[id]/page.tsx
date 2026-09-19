"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, StatTile, formatDuration, Pill, EmptyNote } from "@/components/ui";
import { ChevronLeft, ArrowRight, Users, Gauge, Quote, Alert, EyeOff } from "@/components/icons";
import { classStats, recordingsFor, initials } from "@/lib/db";
import { useStore } from "@/lib/use-store";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const cls = store.classes.find((c) => c.id === id);

  if (!cls) {
    return (
      <div className="mx-auto max-w-2xl pt-16 text-center">
        <p className="text-[15px] text-body">That class does not exist.</p>
        <Link href="/teacher" className="btn btn-tint mt-5">Back to classes</Link>
      </div>
    );
  }

  const stats = classStats(store, cls.id);
  const teacher = store.people.find((p) => p.id === cls.teacherId);
  const recs = stats.recs.sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/teacher" className="rise inline-flex items-center gap-1.5 text-[13.5px] font-medium text-body hover:text-ink">
        <ChevronLeft width={16} height={16} /> Back to classes
      </Link>

      <div className="rise mt-4" style={{ animationDelay: "50ms" }}>
        <p className="eyebrow">{cls.term}{teacher && ` · ${teacher.name}`}</p>
        <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.03em] text-ink">{cls.name}</h1>
      </div>

      <div className="rise mt-6 grid gap-3.5 sm:grid-cols-3" style={{ animationDelay: "100ms" }}>
        <StatTile icon={<Users width={18} height={18} />} value={stats.students} label="students enrolled" tone="brand" />
        <StatTile icon={<Gauge width={18} height={18} />} value={stats.avgWpm || "—"} label="class average pace" tone="mint" />
        <StatTile icon={<Quote width={18} height={18} />} value={stats.avgFillers || "—"} label="avg. fillers per clip" tone="violet" />
      </div>

      <section className="rise mt-6 card overflow-hidden" style={{ animationDelay: "150ms" }}>
        <h2 className="px-5 pb-3 pt-4 text-[15px] font-semibold text-ink">Roster</h2>
        {stats.roster.length === 0 ? (
          <div className="border-t border-line px-5 py-7"><EmptyNote>Nobody enrolled in this class yet.</EmptyNote></div>
        ) : (
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-white/[0.02]">
                  <th className="thead px-5 py-3">Student</th>
                  <th className="thead px-5 py-3">Recordings</th>
                  <th className="thead px-5 py-3">Avg. pace</th>
                  <th className="thead px-5 py-3">Last practice</th>
                </tr>
              </thead>
              <tbody>
                {stats.roster.map((s) => {
                  const rs = recordingsFor(store, s.id);
                  const clean = rs.filter((r) => r.flags.length === 0);
                  const avg = clean.length ? Math.round(clean.reduce((n, r) => n + r.analysis.wpm, 0) / clean.length) : 0;
                  return (
                    <tr key={s.id} className="border-b border-line last:border-0 transition-colors hover:bg-white/[0.022]">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2.5">
                          <Avatar initials={initials(s.name)} tone="soft" size={26} />
                          <span className="text-[14px] font-medium text-ink">{s.name}</span>
                        </span>
                      </td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{rs.length}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{avg || "—"}</td>
                      <td className="px-5 py-3 text-[13px] text-body">{rs[0]?.dateLabel ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rise mt-6" style={{ animationDelay: "200ms" }}>
        <h2 className="mb-2.5 text-[15px] font-semibold text-ink">Recent recordings</h2>
        {recs.length === 0 ? (
          <EmptyNote>No recordings in this class yet.</EmptyNote>
        ) : (
          <div className="space-y-2.5">
            {recs.map((r) => (
              <Link
                key={r.id}
                href={`/teacher/recording/${r.id}`}
                className="card group flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:border-gold/35"
              >
                <span className="flex items-center gap-3">
                  <Avatar initials={initials(r.studentName)} tone="soft" size={30} />
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-medium text-ink">{r.studentName}</span>
                      {r.flags.length > 0 && !r.reviewed && <Pill tone="amber"><Alert width={12} height={12} /> flagged</Pill>}
                      {r.hidden && <Pill><EyeOff width={12} height={12} /> hidden</Pill>}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted">{r.topic} · {r.dateLabel}</span>
                  </span>
                </span>
                <span className="tnum flex items-center gap-5 text-[13px] text-body">
                  <span>{r.analysis.wpm} wpm</span>
                  <span>{r.analysis.fillerCount} fillers</span>
                  <span className="hidden sm:inline">{formatDuration(r.durationSec)}</span>
                  <ArrowRight width={16} height={16} className="text-faint transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
