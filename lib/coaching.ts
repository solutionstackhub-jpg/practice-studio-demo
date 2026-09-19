/**
 * Coaching notes.
 *
 * In production a model writes the sentence and this file is the cage around
 * it: a fixed set of dimensions, a validator, and these templates as the
 * fallback when the model is slow, unavailable, or says something off-scope.
 *
 * The demo runs on the fallback alone, which is the point worth showing —
 * the product still works with the model switched off.
 */

import type { Analysis } from "./analysis";

/** The only three things a note is ever allowed to be about. */
export type Dimension = "pace" | "fillers" | "clarity";

export type CoachingNote = {
  dimension: Dimension;
  title: string;
  body: string;
  /** "template" here; "model" once a live LLM call is wired in */
  source: "template" | "model";
};

/**
 * Phrases a note may never contain. Runs on model output before it is stored.
 *
 * Matched on word boundaries, not as substrings — "age" must not fire on
 * "averaged", and "look" must not fire on "overlooked".
 */
const BANNED = [
  // the content of what was said
  "topic", "argument", "opinion", "point you made", "your idea", "subject matter",
  // appearance and identity
  "you look", "appearance", "your face", "your voice sounds", "accent", "gender", "your age",
  // emotional state
  "nervous", "anxious", "upset", "sad", "angry", "you feel", "emotional", "stressed",
];

const BANNED_RE = BANNED.map((phrase) => ({
  phrase,
  re: new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
}));

export function violatesScope(text: string): string | null {
  return BANNED_RE.find(({ re }) => re.test(text))?.phrase ?? null;
}

function ordinalFiller(a: Analysis): string | null {
  const top = a.byFiller[0];
  if (!top || top.count < 2) return null;
  return top.label;
}

/**
 * Deterministic notes from the measured numbers. At most two, because a
 * student who is handed five things to fix fixes none of them.
 */
export function buildCoachingNotes(a: Analysis): CoachingNote[] {
  const candidates: (CoachingNote & { weight: number })[] = [];

  if (a.paceBand === "brisk") {
    candidates.push({
      dimension: "pace",
      title: "Give your ideas a little more room.",
      body: `You averaged ${a.wpm} words a minute, which is quick for a room. Try adding a short pause between your main points.`,
      source: "template",
      weight: a.wpm > 165 ? 95 : 70,
    });
  } else if (a.paceBand === "slow" && a.durationSec > 25) {
    candidates.push({
      dimension: "pace",
      title: "Lift the pace a little.",
      body: `You averaged ${a.wpm} words a minute. A touch more momentum will help the room stay with you.`,
      source: "template",
      weight: 60,
    });
  }

  if (a.fillersPerMinute >= 2.5) {
    // Name the habit when one word dominates; otherwise talk about the total.
    const top = ordinalFiller(a);
    candidates.push({
      dimension: "fillers",
      title: top ? "Watch repeated filler words." : "Filler words are creeping in.",
      body: top
        ? `“${top}” came up ${a.byFiller[0].count} times, mostly between ideas. Try a silent pause in those places instead.`
        : `${a.fillerCount} of them across the take, spread over ${a.byFiller.length} different words. They tend to land where you are deciding what comes next — a silent pause does the same job.`,
      source: "template",
      weight: 80 + Math.min(a.fillersPerMinute, 10),
    });
  }

  if (a.longestSentenceWords >= 34) {
    candidates.push({
      dimension: "clarity",
      title: "Break up your longest sentence.",
      body: `One run went ${a.longestSentenceWords} words without a full stop. Splitting it in two gives the listener somewhere to catch up.`,
      source: "template",
      weight: 65,
    });
  }

  if (a.durationSec < 30) {
    candidates.push({
      dimension: "clarity",
      title: "Try a longer take next time.",
      body: "Under thirty seconds is not much to work with. Aim for a minute so there is something to measure.",
      source: "template",
      weight: 85,
    });
  }

  const ORDER: Dimension[] = ["pace", "fillers", "clarity"];
  const picked = candidates.sort((x, y) => y.weight - x.weight).slice(0, 2);

  // One thing to work on, one thing that already works. Two is the ceiling:
  // a student handed five corrections acts on none of them.
  while (picked.length < 2) {
    const used = new Set(picked.map((n) => n.dimension));
    const strength = strengthNote(a, used);
    if (!strength) break;
    picked.push({ ...strength, weight: 0 });
  }

  return picked
    .sort((x, y) => ORDER.indexOf(x.dimension) - ORDER.indexOf(y.dimension))
    .map(({ weight: _weight, ...note }) => note);
}

/** Something that genuinely went well, so feedback is never only corrective. */
function strengthNote(a: Analysis, used: Set<Dimension>): CoachingNote | null {
  if (!used.has("fillers") && a.fillersPerMinute < 2.5) {
    return {
      dimension: "fillers",
      title: "Filler words are well under control.",
      body: a.fillerCount === 0
        ? "Not one in the whole take. That is the hard part of this, and you have it."
        : `Only ${a.fillerCount} in the whole take, which is well below where most people start.`,
      source: "template",
    };
  }
  if (!used.has("pace") && a.paceBand === "steady") {
    return {
      dimension: "pace",
      title: "Your pace sat right where you want it.",
      body: `${a.wpm} words a minute is comfortable to listen to. Try to find that again next take.`,
      source: "template",
    };
  }
  if (!used.has("clarity") && a.longestSentenceWords > 0 && a.longestSentenceWords < 34) {
    return {
      dimension: "clarity",
      title: "Your sentences were easy to follow.",
      body: `Your longest run was ${a.longestSentenceWords} words, so the listener always had somewhere to breathe.`,
      source: "template",
    };
  }
  return null;
}

export const DIMENSION_STYLE: Record<
  Dimension,
  { tint: string; border: string; icon: string; title: string }
> = {
  pace:    { tint: "bg-mint-50",   border: "border-mint-100",   icon: "text-mint-600",   title: "Pace" },
  fillers: { tint: "bg-violet-50", border: "border-violet-100", icon: "text-violet-600", title: "Filler words" },
  clarity: { tint: "bg-brand-50",  border: "border-brand-100",  icon: "text-brand-600",  title: "Clarity" },
};
