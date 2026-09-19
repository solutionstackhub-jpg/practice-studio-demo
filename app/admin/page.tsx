"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatTile, EmptyNote } from "@/components/ui";
import { BarChart, LineChart } from "@/components/charts";
import { Waveform, AmbientGlow } from "@/components/art";
import { Select } from "@/components/forms";
import { Users, Student, Gauge, Mic, Alert, Grid, Check, MessageSquare } from "@/components/icons";
import { hydrate } from "@/lib/db";
import { useStore } from "@/lib/use-store";

const RANGES = [
  { id: "all", label: "All time", days: Infinity },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "7",  label: "Last 7 days",  days: 7 },
] as const;

const DAY = 86_400_000;
const fmt = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function AdminOverview() {
  const store = useStore();
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("all");
  const range = RANGES.find((r) => r.id === rangeId)!;

  const view = useMemo(() => {
    const all = store.recordings.map((r) => hydrate(store, r));
    const cutoff = range.days === Infinity ? -Infinity : Date.now() - range.days * DAY;
    const recs = all.filter((r) => r.createdAt >= cutoff).sort((a, b) => a.createdAt - b.createdAt);

    const students = store.people.filter((p) => p.role === "student").length;
    const teachers = store.people.filter((p) => p.role === "teacher").length;
    const clean = recs.filter((r) => r.flags.length === 0);
    const avgWpm = clean.length ? Math.round(clean.reduce((n, r) => n + r.analysis.wpm, 0) / clean.length) : 0;

    // bucket across the observed span so the charts always have shape
    const first = recs[0]?.createdAt ?? Date.now() - 29 * DAY;
    const last = recs[recs.length - 1]?.createdAt ?? Date.now();
    const span = Math.max(DAY, last - first);
    const BUCKETS = 24;
    const counts = Array.from({ length: BUCKETS }, () => 0);
    const fillerSum = Array.from({ length: BUCKETS }, () => 0);
    const fillerN = Array.from({ length: BUCKETS }, () => 0);

    for (const r of recs) {
      const i = Math.min(BUCKETS - 1, Math.floor(((r.createdAt - first) / span) * BUCKETS));
      counts[i] += 1;
      if (r.flags.length === 0) { fillerSum[i] += r.analysis.fillerCount; fillerN[i] += 1; }
    }
    const fillerSeries = fillerSum.map((s, i) => (fillerN[i] ? Math.round((s / fillerN[i]) * 10) / 10 : 0));

    const labels = [0, 0.25, 0.5, 0.75, 1].map((f) => fmt(first + span * f));

    return {
      recs, students, teachers, avgWpm,
      counts, fillerSeries: fillerSeries.filter((_, i) => fillerN[i] > 0).length >= 2 ? fillerSeries : [],
      labels, first, last,
      flagged: recs.filter((r) => r.flags.length > 0).length,
      pending: recs.filter((r) => r.flags.length > 0 && !r.reviewed).length,
    };
  }, [store, range.days]);

  const activity = useMemo(() => {
    type Row = { kind: "class" | "people" | "flag" | "comment"; text: string; when: number; href?: string };
    const rows: Row[] = [];
    for (const r of store.recordings) {
      const h = hydrate(store, r);
      if (h.flags.length > 0) rows.push({ kind: "flag", text: `${h.studentName}’s recording was flagged for review`, when: h.createdAt, href: `/teacher/recording/${h.id}` });
    }
    for (const c of store.comments) {
      const rec = store.recordings.find((r) => r.id === c.recordingId);
      const who = store.people.find((p) => p.id === c.authorId)?.name ?? "A teacher";
      const to = store.people.find((p) => p.id === rec?.studentId)?.name ?? "a student";
      rows.push({ kind: "comment", text: `${who} commented on ${to}’s recording`, when: c.createdAt });
    }
    for (const p of store.people) {
      if (p.createdAt > 0) rows.push({ kind: "people", text: `${p.name} was added as a ${p.role}`, when: p.createdAt });
    }
    for (const c of store.classes) {
      const t = store.people.find((x) => x.id === c.teacherId)?.name ?? "A teacher";
      if (!["c-p3", "c-p1", "c-p5"].includes(c.id)) rows.push({ kind: "class", text: `${t} created ${c.name}`, when: Date.now() });
    }
    return rows.sort((a, b) => b.when - a.when).slice(0, 6);
  }, [store]);

  const ICON = {
    class:   { icon: Grid,          tone: "bg-gold/[0.10] text-gold ring-1 ring-gold/15" },
    people:  { icon: Users,         tone: "bg-mint/[0.10] text-mint ring-1 ring-mint/15" },
    flag:    { icon: Alert,         tone: "bg-rose/[0.10] text-rose ring-1 ring-rose/15" },
    comment: { icon: MessageSquare, tone: "bg-sky/[0.10] text-sky ring-1 ring-sky/15" },
  } as const;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rise relative flex flex-wrap items-end justify-between gap-3">
        <AmbientGlow className="-left-28 -top-24 h-[230px] w-[400px]" />
        <div className="relative">
          <p className="eyebrow">
            All classes · {view.recs.length > 0 ? `${fmt(view.first)} – ${fmt(view.last)}` : "no data in range"}
          </p>
          <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Overview</h1>
        </div>
        <div className="pointer-events-none absolute right-0 top-[-20px] hidden h-[82px] w-[320px] opacity-30 [mask-image:linear-gradient(to_right,transparent,black_70%)] xl:block">
          <Waveform className="h-full w-full" bars={72} seed={31} />
        </div>
        <div className="relative w-[180px]">
          <Select value={rangeId} onChange={(e) => setRangeId(e.target.value as typeof rangeId)}>
            {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </Select>
        </div>
      </div>

      <div className="rise mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "70ms" }}>
        <StatTile icon={<Student width={18} height={18} />} value={view.students} label="students" tone="brand" />
        <StatTile icon={<Users width={18} height={18} />} value={view.teachers} label="teachers" tone="mint" />
        <StatTile
          icon={<Mic width={18} height={18} />}
          value={view.recs.length}
          label={range.days === Infinity ? "recordings, all time" : `recordings in ${range.days} days`}
          tone="violet"
          sub={view.pending > 0 ? (
            <Link href="/teacher/review" className="tnum rounded-full bg-rose/[0.10] px-2 py-[3px] text-[11px] font-semibold text-amber-700 ring-1 ring-rose/20">
              {view.pending} to review
            </Link>
          ) : undefined}
        />
        <StatTile icon={<Gauge width={18} height={18} />} value={view.avgWpm || "—"} label="avg. WPM" tone="slate" />
      </div>

      <div className="rise mt-4 grid gap-3.5 lg:grid-cols-2" style={{ animationDelay: "140ms" }}>
        <section className="card p-5">
          <h2 className="mb-4 text-[14.5px] font-semibold text-ink">Recordings over time</h2>
          {view.recs.length > 1
            ? <BarChart values={view.counts} labels={view.labels} />
            : <EmptyNote>Not enough recordings in this range to plot.</EmptyNote>}
        </section>
        <section className="card p-5">
          <h2 className="mb-4 text-[14.5px] font-semibold text-ink">Average filler words per recording</h2>
          {view.fillerSeries.length
            ? <LineChart values={view.fillerSeries} labels={view.labels} />
            : <EmptyNote>Not enough scored recordings in this range to plot.</EmptyNote>}
        </section>
      </div>

      <section className="rise mt-4 card p-5" style={{ animationDelay: "210ms" }}>
        <h2 className="mb-3 text-[14.5px] font-semibold text-ink">Recent activity</h2>
        {activity.length === 0 ? (
          <EmptyNote>Nothing has happened yet.</EmptyNote>
        ) : (
          <ul className="space-y-0.5">
            {activity.map((a, i) => {
              const meta = ICON[a.kind];
              const body = (
                <>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${meta.tone}`}>
                    <meta.icon width={14} height={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-2">{a.text}</span>
                  <span className="tnum shrink-0 text-[12px] text-faint">{fmt(a.when)}</span>
                </>
              );
              return (
                <li key={i}>
                  {a.href ? (
                    <Link href={a.href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]">{body}</Link>
                  ) : (
                    <span className="flex items-center gap-3 rounded-lg px-2 py-2.5">{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rise mt-4 card p-5" style={{ animationDelay: "270ms" }}>
        <h2 className="text-[14.5px] font-semibold text-ink">Data retention</h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-body">
          Audio is deleted 180 days after a recording is made. Transcripts and metrics are kept for the academic
          year, then anonymized. Both windows are settings, not code — the school picks them at rollout.
        </p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {["Audio · 180 days", "Transcripts · academic year", "Audit log · 7 years"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-mint/[0.08] px-3 py-1.5 text-[12.5px] font-medium text-mint ring-1 ring-mint/15">
              <Check width={13} height={13} /> {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
