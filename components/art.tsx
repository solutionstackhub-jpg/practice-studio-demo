/**
 * Artwork for the product.
 *
 * All of it is drawn from the same thing the app measures — a voice over time.
 * Nothing here is a stock shape: the waveform has syllables and pauses in it,
 * the voice print is the same signal wrapped into a circle, and the
 * spectrogram puts energy where speech actually sits.
 *
 * Everything is seeded, so the server and the browser draw the same picture.
 */

/** Stable seed from a recording id, so every clip gets its own shape. */
export function seedFrom(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return (h % 40) + 1;
}

function rnd(i: number, seed: number) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Speech is bursts separated by breaths. A flat noise field looks nothing like it. */
function speechEnvelope(t: number, seed: number) {
  // syllables ride on top of phrases; phrases are separated by breaths
  const syllable = 0.55 + 0.45 * Math.sin(t * 13.7 + seed);
  const overtone = 0.75 + 0.25 * Math.sin(t * 27.1 + seed * 1.6);
  const phrase = Math.sin(t * 1.65 + seed * 0.7);
  const breath = phrase < -0.74 ? 0.32 : 1;
  const stress = 0.5 + 0.5 * Math.sin(t * 3.9 + seed * 2.1);
  return Math.max(0.17, syllable * overtone * stress * breath);
}

export function Waveform({
  bars = 96, seed = 3, className = "", tone = "gold",
}: { bars?: number; seed?: number; className?: string; tone?: "gold" | "mint" | "muted" }) {
  const color = tone === "gold" ? "var(--color-gold)" : tone === "mint" ? "var(--color-mint)" : "var(--color-line-2)";
  const W = 1000, H = 220, gap = 3;
  const bw = (W - gap * (bars - 1)) / bars;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const t = i / bars;
        const amp = speechEnvelope(t * 6, seed) * (0.58 + 0.42 * rnd(i, seed));
        const h = Math.max(4, amp * H * 0.95);
        const fade = 0.32 + 0.68 * Math.min(1, amp * 1.45);
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={(H - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={color}
            opacity={fade * 0.9}
          />
        );
      })}
    </svg>
  );
}

/** The same signal wrapped into a circle — a voice print. */
export function VoicePrint({
  spokes = 132, seed = 7, className = "",
}: { spokes?: number; seed?: number; className?: string }) {
  const S = 400, c = S / 2, inner = 74;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} aria-hidden>
      <defs>
        <radialGradient id="vp-core" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="var(--color-gold)" stopOpacity=".30" />
          <stop offset="65%"  stopColor="var(--color-gold)" stopOpacity=".06" />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={inner + 58} fill="url(#vp-core)" />
      <circle cx={c} cy={c} r={inner - 9} fill="none" stroke="var(--color-line-2)" strokeWidth="1" />

      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
        const amp = speechEnvelope((i / spokes) * 6, seed) * (0.5 + 0.5 * rnd(i, seed));
        const len = 9 + amp * 96;
        const x1 = c + Math.cos(a) * inner;
        const y1 = c + Math.sin(a) * inner;
        const x2 = c + Math.cos(a) * (inner + len);
        const y2 = c + Math.sin(a) * (inner + len);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--color-gold)"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={0.2 + 0.68 * Math.min(1, amp * 1.5)}
          />
        );
      })}
    </svg>
  );
}

/** Energy by frequency band over time. Speech piles up in the lower bands. */
export function Spectrogram({
  cols = 52, rows = 14, seed = 11, className = "",
}: { cols?: number; rows?: number; seed?: number; className?: string }) {
  const cw = 100 / cols, ch = 100 / rows;
  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: cols }, (_, x) =>
        Array.from({ length: rows }, (_, y) => {
          const t = x / cols;
          const band = 1 - y / rows;                       // 0 = high freq, 1 = low
          const energy =
            speechEnvelope(t * 6, seed) *
            Math.pow(band, 1.5) *
            (0.55 + 0.45 * rnd(x * rows + y, seed));
          if (energy < 0.06) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cw + cw * 0.12}
              y={y * ch + ch * 0.12}
              width={cw * 0.76}
              height={ch * 0.76}
              rx={cw * 0.3}
              fill="var(--color-gold)"
              opacity={Math.min(0.85, energy * 1.15)}
            />
          );
        })
      )}
    </svg>
  );
}

/** A slow warm bloom behind a hero. One per page, never more. */
export function AmbientGlow({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <div
        className="drift h-full w-full rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgb(240 180 41 / .17), rgb(240 180 41 / .04) 55%, transparent 72%)" }}
      />
    </div>
  );
}

/** Horizontal rule that fades at both ends. Softer than a full-width border. */
export function FadeRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ background: "linear-gradient(90deg, transparent, var(--color-line-2) 12%, var(--color-line-2) 88%, transparent)" }}
      aria-hidden
    />
  );
}

/** The clip itself, drawn as a waveform. Sits above the numbers on a feedback screen. */
export function ClipStrip({ id, tone = "gold", className = "" }: { id: string; tone?: "gold" | "muted"; className?: string }) {
  return (
    <div className={`h-[58px] w-full overflow-hidden opacity-80 ${className}`}>
      <Waveform className="h-full w-full" bars={168} seed={seedFrom(id)} tone={tone} />
    </div>
  );
}
