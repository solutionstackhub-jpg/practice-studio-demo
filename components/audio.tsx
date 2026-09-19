"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume } from "./icons";
import { formatDuration } from "./ui";

export function AudioBar({ src, durationSec }: { src?: string; durationSec: number }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setT(el.currentTime);
    const onEnd = () => { setPlaying(false); setT(0); };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => { el.removeEventListener("timeupdate", onTime); el.removeEventListener("ended", onEnd); };
  }, [src]);

  const total = durationSec || 1;
  const pct = Math.min(100, (t / total) * 100);

  function toggle() {
    const el = ref.current;
    if (!el || !src) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { void el.play(); setPlaying(true); }
  }

  return (
    <div className="flex items-center gap-3.5">
      {src && <audio ref={ref} src={src} preload="metadata" />}
      <button
        onClick={toggle}
        disabled={!src}
        aria-label={playing ? "Pause" : "Play"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-[#17130a] transition-colors hover:bg-gold-2 disabled:cursor-not-allowed disabled:bg-line-2 disabled:text-faint"
      >
        {playing ? <Pause width={15} height={15} /> : <Play width={15} height={15} />}
      </button>

      <div className="relative h-[5px] flex-1 rounded-full bg-line-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gold" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-gold ring-[3px] ring-surface"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>

      <span className="shrink-0 text-[12.5px] tabular-nums text-muted">
        {formatDuration(t)} / {formatDuration(durationSec)}
      </span>
      <Volume width={17} height={17} className="shrink-0 text-faint" />
    </div>
  );
}
