"use client";

import Link from "next/link";
import { recordingsFor } from "@/lib/db";
import { useSession } from "@/lib/use-store";
import { formatDuration, EmptyNote } from "./ui";
import { Waveform, seedFrom } from "./art";
import { MessageSquare } from "./icons";

export function RecentPractice({ limit = 4, showDuration = false }: { limit?: number; showDuration?: boolean }) {
  const { store, person } = useSession();
  if (!person) return null;

  // A recording the teacher has hidden simply is not in the student's list.
  const all = recordingsFor(store, person.id).filter((r) => !r.hidden);
  const rows = all.slice(0, limit);

  if (rows.length === 0) {
    return <EmptyNote>Nothing recorded yet. Your first take will show up here.</EmptyNote>;
  }

  return (
    <>
      {/* phones */}
      <div className="space-y-2.5 sm:hidden">
        {rows.map((r) => (
          <Link key={r.id} href={`/student/feedback/${r.id}`} className="card block px-4 py-3.5 transition-colors active:bg-white/[0.04]">
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="truncate text-[14.5px] font-medium text-ink">{r.topic}</span>
                <span className="mt-0.5 block text-[12.5px] text-muted">{r.dateLabel}</span>
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-gold">View</span>
            </span>
            <span className="tnum mt-3 flex items-center gap-4 text-[12px] text-body">
              <span>{r.analysis.wpm} wpm</span>
              <span>{r.analysis.fillerCount} filler{r.analysis.fillerCount === 1 ? "" : "s"}</span>
              <span>{formatDuration(r.durationSec)}</span>
              {r.comments.length > 0 && <MessageSquare width={13} height={13} className="text-gold" />}
            </span>
          </Link>
        ))}
      </div>

      {/* desktop */}
      <div className="card hidden overflow-hidden sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-white/[0.02]">
              <th className="thead px-5 py-3">Topic</th>
              <th className="thead w-[120px] px-5 py-3">Shape</th>
              <th className="thead px-5 py-3">Date</th>
              <th className="thead px-5 py-3">Pace</th>
              <th className="thead px-5 py-3">Fillers</th>
              {showDuration && <th className="thead px-5 py-3">Length</th>}
              <th className="thead px-5 py-3 text-right">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 transition-colors hover:bg-white/[0.022]">
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink">{r.topic}</span>
                    {r.flags.length > 0 && (
                      <span className="rounded-full bg-rose/[0.12] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-amber-700">
                        With teacher
                      </span>
                    )}
                    {r.comments.length > 0 && <MessageSquare width={13} height={13} className="text-gold" />}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="block h-[26px] w-[92px] opacity-60 transition-opacity group-hover:opacity-100">
                    <Waveform className="h-full w-full" bars={46} seed={seedFrom(r.id)} />
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-body">{r.dateLabel}</td>
                <td className="tnum px-5 py-3.5 text-[13px] text-body">{r.flags.length ? "—" : `${r.analysis.wpm} wpm`}</td>
                <td className="tnum px-5 py-3.5 text-[13px] text-body">{r.flags.length ? "—" : r.analysis.fillerCount}</td>
                {showDuration && <td className="tnum px-5 py-3.5 text-[13px] text-body">{formatDuration(r.durationSec)}</td>}
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/student/feedback/${r.id}`} className="btn btn-tint px-3.5 py-[7px] text-[12.5px]">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
