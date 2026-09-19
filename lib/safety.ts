/**
 * Safety screening.
 *
 * Runs before any coaching note is written. Two stages in production:
 * this keyword pass, then a model classifier for the cases keywords miss.
 * The demo ships stage one, which is the stage that needs no network.
 *
 * Tuned to over-flag on purpose. A teacher clears a false alarm in seconds;
 * the other kind of mistake is not recoverable.
 */

export type SafetyCategory = "self-harm" | "violence" | "abuse" | "distress";

export type SafetyFlag = {
  category: SafetyCategory;
  severity: "review" | "urgent";
  /** the phrase that triggered it, shown only to staff */
  matched: string;
};

const PATTERNS: { category: SafetyCategory; severity: SafetyFlag["severity"]; re: RegExp }[] = [
  { category: "self-harm", severity: "urgent", re: /\b(kill myself|end it all|hurt myself|don'?t want to be here|no reason to live|want to die)\b/i },
  { category: "self-harm", severity: "review", re: /\b(everything feels pointless|can'?t keep going|give up on everything)\b/i },
  { category: "violence",  severity: "urgent", re: /\b(going to hurt (him|her|them|someone)|bring a (knife|gun)|make them pay)\b/i },
  { category: "abuse",     severity: "urgent", re: /\b(hits me|hit me at home|scared to go home|touched me|not safe at home)\b/i },
  { category: "distress",  severity: "review", re: /\b(haven'?t eaten|nobody cares|cry every|can'?t sleep at all|so alone)\b/i },
];

export function screen(transcript: string): SafetyFlag[] {
  const flags: SafetyFlag[] = [];
  for (const p of PATTERNS) {
    const m = transcript.match(p.re);
    if (m) flags.push({ category: p.category, severity: p.severity, matched: m[0] });
  }
  return flags;
}

export const CATEGORY_LABEL: Record<SafetyCategory, string> = {
  "self-harm": "Possible self-harm language",
  violence: "Possible threat of violence",
  abuse: "Possible disclosure of harm at home",
  distress: "Signs of distress",
};
