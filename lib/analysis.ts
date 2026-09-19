/**
 * Delivery analysis.
 *
 * Everything in this file runs locally on the transcript. No model, no API call.
 * These are the two numbers the product is actually built on, so they are
 * deliberately plain and testable.
 */

export type FillerId =
  | "um" | "uh" | "like" | "you-know" | "so" | "i-mean" | "kind-of" | "actually" | "basically";

type Rule = {
  id: FillerId;
  label: string;
  /** token sequence to match, lower-cased, punctuation stripped */
  tokens: string[];
  /** variants that map onto the same rule */
  alts?: string[][];
  /**
   * `always` words are disfluencies wherever they appear ("um", "uh").
   * The rest are ordinary English words too, so they only count as filler
   * when a pause sits next to them. In production the pause comes from
   * word-level timestamps; here punctuation stands in for it.
   */
  always: boolean;
};

const RULES: Rule[] = [
  { id: "um",        label: "um",        tokens: ["um"],   alts: [["umm"], ["ummm"], ["hmm"]], always: true },
  { id: "uh",        label: "uh",        tokens: ["uh"],   alts: [["uhh"], ["er"], ["erm"], ["ahh"]], always: true },
  { id: "you-know",  label: "you know",  tokens: ["you", "know"], always: false },
  { id: "i-mean",    label: "I mean",    tokens: ["i", "mean"],   always: false },
  { id: "kind-of",   label: "kind of",   tokens: ["kind", "of"],  alts: [["sort", "of"]], always: false },
  { id: "like",      label: "like",      tokens: ["like"], always: false },
  { id: "so",        label: "so",        tokens: ["so"],   always: false },
  { id: "actually",  label: "actually",  tokens: ["actually"], always: false },
  { id: "basically", label: "basically", tokens: ["basically"], always: false },
];

export type Token = {
  raw: string;
  clean: string;
  start: number;
  end: number;
  /** punctuation immediately after the token, e.g. "," or "." */
  trailing: string;
};

export type FillerHit = {
  id: FillerId;
  label: string;
  start: number;
  end: number;
  tokenIndex: number;
};

export type Analysis = {
  wordCount: number;
  durationSec: number;
  wpm: number;
  paceBand: "slow" | "steady" | "brisk";
  fillerCount: number;
  fillersPerMinute: number;
  hits: FillerHit[];
  byFiller: { id: FillerId; label: string; count: number }[];
  longestSentenceWords: number;
  sentenceCount: number;
};

const WORD_RE = /[A-Za-z0-9][A-Za-z0-9'’-]*/g;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;
    const after = text.slice(end, end + 2);
    const punct = after.match(/^\s*([,.;:!?…—-])/);
    out.push({
      raw: m[0],
      clean: m[0].toLowerCase().replace(/[’']/g, "'"),
      start,
      end,
      trailing: punct ? punct[1] : "",
    });
  }
  return out;
}

/**
 * Ambiguous words only count as filler when a pause FOLLOWS them.
 *
 *   "So, that is my point."   -> filler      (pause after)
 *   "So I went home."         -> conjunction (no pause)
 *   "It was, like, long."     -> filler
 *   "I sound like myself."    -> verb
 *
 * A pause before is not enough on its own: plenty of ordinary sentences
 * open with "So" or "Like". Real builds read the pause off word-level
 * timestamps; punctuation is the stand-in until those exist.
 */
function pauseFollows(tokens: Token[], i: number, len: number): boolean {
  const last = tokens[i + len - 1];
  return Boolean(last && last.trailing !== "");
}

function matchesAt(tokens: Token[], i: number, seq: string[]): boolean {
  for (let k = 0; k < seq.length; k++) {
    if (!tokens[i + k] || tokens[i + k].clean !== seq[k]) return false;
  }
  return true;
}

export function findFillers(text: string, tokens = tokenize(text)): FillerHit[] {
  const hits: FillerHit[] = [];
  let i = 0;
  while (i < tokens.length) {
    let matched = false;
    for (const rule of RULES) {
      const candidates = [rule.tokens, ...(rule.alts ?? [])];
      for (const seq of candidates) {
        if (!matchesAt(tokens, i, seq)) continue;
        if (!rule.always && !pauseFollows(tokens, i, seq.length)) continue;
        hits.push({
          id: rule.id,
          label: rule.label,
          start: tokens[i].start,
          end: tokens[i + seq.length - 1].end,
          tokenIndex: i,
        });
        i += seq.length;
        matched = true;
        break;
      }
      if (matched) break;
    }
    if (!matched) i += 1;
  }
  return hits;
}

export function paceBandFor(wpm: number): Analysis["paceBand"] {
  if (wpm < 115) return "slow";
  if (wpm > 135) return "brisk";
  return "steady";
}

export function analyze(text: string, durationSec: number): Analysis {
  const tokens = tokenize(text);
  const hits = findFillers(text, tokens);
  const wordCount = tokens.length;
  const minutes = Math.max(durationSec, 1) / 60;
  const wpm = Math.round(wordCount / minutes);

  const counts = new Map<FillerId, { label: string; count: number }>();
  for (const h of hits) {
    const prev = counts.get(h.id);
    counts.set(h.id, { label: h.label, count: (prev?.count ?? 0) + 1 });
  }

  const sentences = text.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  const sentenceWordCounts = sentences.map((s) => (s.match(WORD_RE) ?? []).length);

  return {
    wordCount,
    durationSec,
    wpm,
    paceBand: paceBandFor(wpm),
    fillerCount: hits.length,
    fillersPerMinute: Math.round((hits.length / minutes) * 10) / 10,
    hits,
    byFiller: [...counts.entries()]
      .map(([id, v]) => ({ id, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count),
    longestSentenceWords: sentenceWordCounts.length ? Math.max(...sentenceWordCounts) : 0,
    sentenceCount: sentences.length,
  };
}
