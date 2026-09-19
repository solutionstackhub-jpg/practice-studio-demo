"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Stop, ArrowRight, Alert, Shield, Sparkle, Check } from "./icons";
import { AudioBar } from "./audio";
import { AmbientGlow } from "./art";
import { formatDuration } from "./ui";
import { actions, keepAudio } from "@/lib/db";
import { useSession } from "@/lib/use-store";

const MAX_SEC = 180;
const BARS = 56;

/** Resting shape for the waveform: taller in the middle, irregular like speech. */
function envelope(i: number) {
  const c = 1 - Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
  const wobble = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.53) + 0.3 * Math.sin(i * 0.31));
  return Math.max(0.1, c * Math.min(1, wobble));
}

type Phase = "idle" | "arming" | "recording" | "review" | "processing" | "blocked";

const STEPS = [
  { label: "Transcribing the audio", icon: Sparkle },
  { label: "Counting pace and filler words", icon: Mic },
  { label: "Screening for safety concerns", icon: Shield },
  { label: "Writing your coaching notes", icon: Check },
];

export function Recorder() {
  const router = useRouter();
  const { store, person } = useSession();
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.06));
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAt = useRef(0);
  const chunks = useRef<BlobPart[]>([]);

  const teardown = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    mediaRef.current?.state === "recording" && mediaRef.current.stop();
  }, []);

  async function start() {
    setError(null);
    setPhase("arming");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128) / 128);
        setLevels((prev) => [...prev.slice(1), Math.min(1, Math.max(0.05, peak * 2.1))]);
        const secs = (Date.now() - startedAt.current) / 1000;
        setElapsed(secs);
        if (secs >= MAX_SEC) { stop(); return; }
        rafRef.current = requestAnimationFrame(tick);
      };

      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", ""].find(
        (m) => m === "" || (window.MediaRecorder?.isTypeSupported?.(m) ?? false)
      );
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        setBlobUrl(URL.createObjectURL(blob));
        setElapsed((Date.now() - startedAt.current) / 1000);
        teardown();
        setPhase("review");
      };
      mediaRef.current = rec;
      rec.start();
      startedAt.current = Date.now();
      setLevels(Array(BARS).fill(0.06));
      setPhase("recording");
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      teardown();
      setPhase("blocked");
      setError("We could not reach your microphone. Your browser may have blocked it, or another app is using it.");
    }
  }

  function reset() {
    setBlobUrl(undefined);
    setElapsed(0);
    setLevels(Array(BARS).fill(0.06));
    setPhase("idle");
    setError(null);
  }

  /** Stand-in path so the demo still completes with no microphone. */
  function useSampleClip() {
    setElapsed(96);
    setBlobUrl(undefined);
    setPhase("review");
    setError(null);
  }

  async function submit() {
    if (!person) return;
    setPhase("processing");
    const duration = Math.max(6, Math.round(elapsed));
    const classId =
      store.enrollments.find((e) => e.studentId === person.id)?.classId ?? store.classes[0]?.id ?? "c-p3";

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, i === 0 ? 900 : 520));
    }

    const rec = actions.addRecording({
      studentId: person.id,
      classId,
      durationSec: duration,
      hasAudio: Boolean(blobUrl),
    });
    if (blobUrl) keepAudio(rec.id, blobUrl);
    router.push(`/student/feedback/${rec.id}`);
  }

  /* ------------------------------ render ------------------------------ */

  if (phase === "processing") {
    return (
      <div className="mx-auto max-w-md pt-10 text-center">
        <div className="relative mx-auto grid h-[86px] w-[86px] place-items-center">
          <span className="pulsering absolute inset-0 rounded-full bg-gold/30" />
          <span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-gold text-[#17130a]">
            <Sparkle width={26} height={26} />
          </span>
        </div>
        <h2 className="mt-7 text-[22px] font-semibold tracking-[-0.02em] text-ink">Working on your feedback</h2>
        <p className="mt-1.5 text-[14.5px] text-muted">This usually takes under a minute.</p>

        <ul className="mx-auto mt-7 w-fit space-y-3 text-left">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.label} className={`flex items-center gap-3 text-[14px] transition-opacity ${i > step ? "opacity-35" : ""}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full ${
                  done ? "bg-mint-50 text-mint-600" : active ? "bg-brand-50 text-brand-600" : "bg-surface-2 text-faint"
                }`}>
                  {done ? <Check width={13} height={13} /> : <s.icon width={13} height={13} />}
                </span>
                <span className={done || active ? "text-ink-2" : "text-muted"}>{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const recording = phase === "recording";
  const reviewing = phase === "review";

  return (
    <div className="relative mx-auto max-w-lg pt-6 text-center sm:pt-10">
      <AmbientGlow className="left-1/2 top-24 h-[340px] w-[440px] -translate-x-1/2" />
      <h1 className="relative text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[33px]">
        {reviewing ? "Ready to submit?" : "Your recording"}
      </h1>
      <p className="relative mt-2.5 text-[14.5px] text-body">
        {reviewing
          ? "Have a listen first. You can record it again if you want."
          : "Speak naturally. You can listen before submitting."}
      </p>

      {/* waveform */}
      <div className="relative mt-10 flex h-[110px] items-center justify-center gap-[3px] px-2" aria-hidden>
        {levels.map((v, i) => {
          const centred = 1 - Math.abs(i - BARS / 2) / (BARS / 1.35);
          const h = recording
            ? Math.max(4, v * 96 * Math.max(0.25, centred))
            : 5 + envelope(i) * (reviewing ? 62 : 44);
          return (
            <span
              key={i}
              className={`w-[4px] rounded-full transition-[height,background-color] duration-75 ${
                recording ? "bg-gold" : reviewing ? "bg-gold/55" : "bg-line-2"
              }`}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>

      <div className="relative mt-5">
        <div className="num text-[34px] leading-none text-ink">{formatDuration(elapsed)}</div>
        <div className="mt-2.5 text-[12.5px] text-muted">of 3:00 max</div>
      </div>

      {/* controls */}
      <div className="relative mt-9">
        {phase === "idle" || phase === "blocked" ? (
          <>
            <button
              onClick={start}
              className="group relative mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-gold text-[#17130a] shadow-[0_0_0_1px_rgb(240_180_41/.35),0_18px_46px_-14px_rgb(240_180_41/.65)] transition-transform hover:scale-[1.03] active:scale-95"
              aria-label="Start recording"
            >
              <Mic width={30} height={30} />
            </button>
            <div className="mt-3.5 text-[14px] font-medium text-ink-2">Start recording</div>
          </>
        ) : phase === "arming" ? (
          <>
            <div className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-surface-2 text-faint ring-1 ring-line-2">
              <Mic width={30} height={30} />
            </div>
            <div className="mt-3.5 text-[14px] text-muted">Waiting for microphone access…</div>
          </>
        ) : recording ? (
          <>
            <button
              onClick={stop}
              className="relative mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-rose text-[#2a0a0e] shadow-[0_0_0_1px_rgb(255_111_125/.35),0_18px_46px_-14px_rgb(255_111_125/.6)] transition-transform hover:scale-[1.03] active:scale-95"
              aria-label="Stop recording"
            >
              <span className="pulsering absolute inset-0 rounded-full bg-rose/40" />
              <Stop width={26} height={26} />
            </button>
            <div className="mt-3.5 text-[14px] font-medium text-ink-2">Stop recording</div>
          </>
        ) : (
          <div className="mx-auto max-w-md space-y-4">
            <div className="card px-4 py-3.5">
              <AudioBar src={blobUrl} durationSec={elapsed} />
              {!blobUrl && (
                <p className="mt-2.5 text-left text-[12px] text-faint">
                  No audio captured — continuing with a sample clip so you can see the rest of the flow.
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <button onClick={reset} className="btn btn-ghost">Record again</button>
              <button onClick={submit} className="btn btn-primary">
                Submit for feedback <ArrowRight width={16} height={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto mt-8 flex max-w-md items-start gap-3 rounded-xl border border-rose/20 bg-rose/[0.07] px-4 py-3.5 text-left">
          <Alert width={18} height={18} className="mt-[1px] shrink-0 text-amber-500" />
          <div>
            <p className="text-[13.5px] leading-relaxed text-amber-700">{error}</p>
            <button onClick={useSampleClip} className="mt-2 text-[13px] font-semibold text-amber-700 underline underline-offset-2">
              Continue with a sample clip instead
            </button>
          </div>
        </div>
      )}

      {phase === "idle" && !error && (
        <p className="mx-auto mt-10 max-w-sm text-[12.5px] leading-relaxed text-faint">
          Your browser will ask for microphone permission. Nothing leaves your device in this demo.
        </p>
      )}
    </div>
  );
}
