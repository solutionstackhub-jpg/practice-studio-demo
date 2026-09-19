"use client";

import { useState } from "react";
import type { FillerHit } from "@/lib/analysis";
import { ChevronDown, ChevronUp } from "./icons";

export function TranscriptView({
  text, hits, collapsedChars = 430,
}: { text: string; hits: FillerHit[]; collapsedChars?: number }) {
  const [open, setOpen] = useState(false);
  const canCollapse = text.length > collapsedChars;
  let cut = text.length;
  if (canCollapse && !open) {
    const space = text.lastIndexOf(" ", collapsedChars);
    cut = space > collapsedChars * 0.6 ? space : collapsedChars;
  }

  const parts: { text: string; filler?: string; key: string }[] = [];
  let cursor = 0;
  for (const [i, h] of hits.entries()) {
    if (h.start >= cut) break;
    if (h.start > cursor) parts.push({ text: text.slice(cursor, h.start), key: `t${i}` });
    parts.push({ text: text.slice(h.start, Math.min(h.end, cut)), filler: h.label, key: `f${i}` });
    cursor = h.end;
  }
  if (cursor < cut) parts.push({ text: text.slice(cursor, cut), key: "tail" });

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Transcript</h3>
        {canCollapse && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-gold hover:text-gold-2"
          >
            {open ? "Show less" : "Show more"}
            {open ? <ChevronUp width={15} height={15} /> : <ChevronDown width={15} height={15} />}
          </button>
        )}
      </div>

      <div className="card px-5 py-4">
        <p className="whitespace-pre-wrap text-[14.5px] leading-[1.85] text-ink-2">
          {parts.map((p) =>
            p.filler ? (
              <mark
                key={p.key}
                title={`Filler word — “${p.filler}”`}
                className="rounded-[5px] bg-rose-50 px-[5px] py-[2px] font-medium text-rose-600 ring-1 ring-rose-100"
              >
                {p.text}
              </mark>
            ) : (
              <span key={p.key}>{p.text}</span>
            )
          )}
          {!open && canCollapse && <span className="text-faint">…</span>}
        </p>
      </div>
    </div>
  );
}
