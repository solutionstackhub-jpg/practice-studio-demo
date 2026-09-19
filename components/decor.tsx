import { VoicePrint, Spectrogram, Waveform, AmbientGlow } from "./art";

/** Student home, beside the greeting. */
export function MottoCard() {
  return (
    <div className="card relative h-full min-h-[196px] overflow-hidden">
      <div className="absolute -right-14 top-1/2 h-[212px] w-[212px] -translate-y-1/2 opacity-95">
        <VoicePrint className="h-full w-full" seed={4} />
      </div>
      <div className="relative flex h-full flex-col justify-end p-5">
        <p className="font-serif-display text-[25px] leading-[1.12] text-ink">
          Better speakers,
          <br />
          <span className="italic text-gold">brighter futures.</span>
        </p>
      </div>
    </div>
  );
}

/** Student home, below the practice list. */
export function QuoteCard() {
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[62%] opacity-40 [mask-image:linear-gradient(to_right,transparent,black_55%)]">
        <Spectrogram className="h-full w-full" seed={9} cols={78} rows={20} />
      </div>
      <div className="relative px-6 py-7 sm:py-8">
        <p className="font-serif-display max-w-sm text-[21px] leading-[1.35] text-ink-2">
          Practice isn’t about being perfect.
          <br className="hidden sm:block" /> It’s about making progress.
        </p>
      </div>
    </div>
  );
}

/**
 * A thin waveform rule under a page title. Gives every screen a piece of the
 * same signal without turning into decoration for its own sake.
 */
export function SignalRule({ seed = 5, className = "" }: { seed?: number; className?: string }) {
  return (
    <div className={`h-[34px] w-full overflow-hidden opacity-[0.5] [mask-image:linear-gradient(to_right,black,black_55%,transparent)] ${className}`}>
      <Waveform className="h-full w-full" bars={120} seed={seed} />
    </div>
  );
}

/** Wide hero band used at the top of the landing page. */
export function HeroSignal() {
  return (
    <div className="pointer-events-none relative h-[220px] w-full select-none">
      <AmbientGlow className="left-1/4 top-0 h-[300px] w-[520px]" />
      <div className="absolute inset-0 opacity-90 [mask-image:radial-gradient(70%_100%_at_50%_50%,black,transparent)]">
        <Waveform className="h-full w-full" bars={128} seed={3} />
      </div>
    </div>
  );
}
