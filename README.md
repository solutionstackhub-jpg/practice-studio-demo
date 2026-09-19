# Practice Studio — MVP demo

A working walkthrough of the Practice Studio brief: a student records a short clip and gets
feedback on their delivery; a teacher sees the class, the transcripts and a review queue;
an admin sees usage across the program.

It runs with **no API keys and no database**, so it can be opened from a link and clicked
through end to end.

```
npm install
npm run dev          # http://localhost:3000

npm run build && npx next start -p 7845
npm run test:e2e     # 28 checks against a running server
```

Sign in with any of the demo accounts on `/login` — password is not checked —
or use the one-click buttons. `maya.c@student.humorize.edu`,
`alex.morgan@humorize.edu`, `sam.lee@humorize.edu`.

## What is actually running

Everything except transcription and model-written sentences is the real implementation.

| Piece | Where | Notes |
| --- | --- | --- |
| Words per minute | `lib/analysis.ts` | word count over clip length |
| Filler detection | `lib/analysis.ts` | `um`/`uh` always count; `like`, `so`, `you know`, `actually` only count when a pause follows them, so *"I like pizza"* and *"So I went home"* are left alone |
| Coaching notes | `lib/coaching.ts` | three allowed dimensions, at most two notes, one correction paired with one thing that went well |
| Scope guardrail | `lib/coaching.ts` | `violatesScope()` rejects anything touching content, appearance or mood — word-boundary matched, so *"averaged"* does not trip the ban on *"age"* |
| Safety screening | `lib/safety.ts` | keyword pass, tuned to over-flag; runs **before** any note is written |
| Auth and roles | `lib/db.ts`, `components/role-gate.tsx` | password or magic-link sign-in, each area gated, sign out |
| Cross-role state | `lib/db.ts` | one store behind `useSyncExternalStore`, persisted to localStorage — a teacher's comment, a hidden note and a hidden recording all land on the student's screen |
| Admin CRUD | `app/admin/*` | create class, add teacher, enroll student, paste an SIS roster |
| Analytics | `app/admin/page.tsx` | counts, charts and activity derived from the store, with a live date filter |
| Recording | `components/recorder.tsx` | `MediaRecorder` plus an `AnalyserNode` for the live waveform, 3-minute cap, falls back to a sample clip if the mic is blocked |

Every number on every screen is derived from a transcript. Edit a word in `lib/data.ts`
and the pace, filler counts, notes and flags all move with it.

`e2e.mjs` drives a real browser through all of it — sign-in, the gate, creating a
class, a comment crossing from teacher to student, hiding a note, the review
queue, the roster import, and recording a clip through to its feedback screen.

## What is standing in

- **Speech to text.** Production uses Whisper. Here a clip is paired with a sample passage
  trimmed to the number of words a person would speak in the time recorded
  (`simulateTranscript` in `lib/data.ts`).
- **Model-written coaching sentences.** The demo ships only the deterministic fallback —
  which is the piece worth seeing, because it is what keeps the product working when the
  model is slow, down, or off-scope.
- **Sign-in**, and anything shared between devices. Recordings you make live in the tab
  you made them in.

## Worth knowing before this becomes the real thing

Whisper is tuned to produce clean, readable transcripts and tends to tidy `um` and `uh`
out of the text on the way. Filler counting is the center of this product, so that is the
first thing to verify against real student audio — roughly a day's work, and it decides
whether the transcription layer stays as-is or swaps for a service that preserves
disfluencies. Word-level timestamps also replace the punctuation stand-in used here for
the pause rule.

## Layout

```
app/
  page.tsx                      role picker and the real/simulated note
  student/                      home, record, feedback, practice list
  teacher/                      classes, students, review queue, recording detail
  admin/                        overview, classes, teachers, students
lib/
  analysis.ts  coaching.ts  safety.ts   the parts that do the work
  data.ts                               transcripts and roster
  store.ts                              browser-side recordings
components/                             shells, charts, recorder, transcript
```

The pill in the bottom-right corner jumps between screens. It is there for the
walkthrough and is not part of the product.

## Design

Dark by default, built as a dark interface rather than an inverted light one:
near-black surfaces separated by hairlines and a top edge highlight instead of
drop shadows, one warm accent used sparingly, and a fine grain over the whole
page so the flat areas do not read as paint.

Type is Inter Tight for the interface, JetBrains Mono for every figure, and
Instrument Serif for the few lines addressed to a student rather than a user.

The artwork on each screen is drawn from the thing the product measures — a
voice over time. `components/art.tsx` generates it: a waveform with syllables
and breaths in it, the same signal wrapped into a circle as a voice print, and
a spectrogram with the energy where speech actually sits. Each recording seeds
its own shape, so the row thumbnails in the practice table are not the same
picture repeated.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · deployed on Vercel.
No database, no server state, nothing to configure.
