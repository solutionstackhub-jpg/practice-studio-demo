"use client";

/**
 * The demo's shared store.
 *
 * Everything a teacher does has to show up on the student's screen, and
 * anything an admin creates has to appear everywhere else. That needs one
 * source of truth, so this is it: a small reducer over localStorage with a
 * subscription, read through useSyncExternalStore.
 *
 * In production this is Postgres behind an API. The shape is deliberately the
 * same — rows, ids, foreign keys — so swapping it out is a data-layer job and
 * nothing above it changes.
 */

import { analyze, type Analysis } from "./analysis";
import { screen, type SafetyFlag } from "./safety";
import { SEED_RECORDINGS, CLASSES as SEED_CLASSES, simulateTranscript } from "./data";

const KEY = "practice-studio:v3";

export type Role = "student" | "teacher" | "admin";

export type ClassRec   = { id: string; name: string; teacherId: string; term: string };
export type PersonRec  = { id: string; name: string; email: string; role: Role; createdAt: number };
export type Enrollment = { studentId: string; classId: string };

export type RecordingRec = {
  id: string;
  studentId: string;
  classId: string;
  topic: string;
  createdAt: number;
  dateLabel: string;
  durationSec: number;
  transcript: string;
  hasAudio: boolean;
};

export type CommentRec = {
  id: string; recordingId: string; authorId: string; body: string; createdAt: number;
};

export type Store = {
  session: { userId: string; role: Role } | null;
  people: PersonRec[];
  classes: ClassRec[];
  enrollments: Enrollment[];
  recordings: RecordingRec[];
  comments: CommentRec[];
  /** recordingId -> coaching note titles the teacher has hidden */
  hiddenNotes: Record<string, string[]>;
  /** recordings a teacher has hidden from the student */
  hiddenRecordings: string[];
  /** safety flags a teacher has signed off */
  reviewed: string[];
};

/* ------------------------------------------------------------------ *
 * seed
 * ------------------------------------------------------------------ */

const SEED_PEOPLE: PersonRec[] = [
  { id: "u-alex",  name: "Alex Morgan",   email: "alex.morgan@humorize.edu",  role: "teacher", createdAt: 0 },
  { id: "u-priya", name: "Priya Raman",   email: "priya.raman@humorize.edu",  role: "teacher", createdAt: 0 },
  { id: "u-dan",   name: "Dan Whitfield", email: "dan.whitfield@humorize.edu", role: "teacher", createdAt: 0 },
  { id: "u-sam",   name: "Sam Lee",       email: "sam.lee@humorize.edu",      role: "admin",   createdAt: 0 },
  { id: "s-maya",   name: "Maya Chen",     email: "maya.c@student.humorize.edu",   role: "student", createdAt: 0 },
  { id: "s-jordan", name: "Jordan Lee",    email: "jordan.l@student.humorize.edu", role: "student", createdAt: 0 },
  { id: "s-sofia",  name: "Sofia Reyes",   email: "sofia.r@student.humorize.edu",  role: "student", createdAt: 0 },
  { id: "s-ethan",  name: "Ethan Park",    email: "ethan.p@student.humorize.edu",  role: "student", createdAt: 0 },
  { id: "s-olivia", name: "Olivia Carter", email: "olivia.c@student.humorize.edu", role: "student", createdAt: 0 },
];

const SEED_CLASS_RECS: ClassRec[] = [
  { id: "c-p3", name: "Period 3 — Public Speaking",      teacherId: "u-alex",  term: "Fall 2026" },
  { id: "c-p1", name: "Period 1 — Speech & Debate",      teacherId: "u-alex",  term: "Fall 2026" },
  { id: "c-p5", name: "Period 5 — Communication Skills", teacherId: "u-alex",  term: "Fall 2026" },
];

const SEED_ENROLL: Enrollment[] = ["s-maya", "s-jordan", "s-sofia", "s-ethan", "s-olivia"].map(
  (studentId) => ({ studentId, classId: "c-p3" })
);

const SEED_RECS: RecordingRec[] = SEED_RECORDINGS.map((r, i) => ({
  id: r.id,
  studentId: r.studentId,
  classId: "c-p3",
  topic: r.topic,
  createdAt: Date.parse(r.date) - i,
  dateLabel: r.dateLabel,
  durationSec: r.durationSec,
  transcript: r.transcript,
  hasAudio: false,
}));

const SEED_COMMENTS: CommentRec[] = SEED_RECORDINGS.flatMap((r) =>
  r.teacherComment
    ? [{ id: `cm-${r.id}`, recordingId: r.id, authorId: "u-alex", body: r.teacherComment.body, createdAt: Date.parse(r.date) }]
    : []
);

function seed(): Store {
  return {
    session: null,
    people: SEED_PEOPLE,
    classes: SEED_CLASS_RECS,
    enrollments: SEED_ENROLL,
    recordings: SEED_RECS,
    comments: SEED_COMMENTS,
    hiddenNotes: {},
    hiddenRecordings: [],
    reviewed: [],
  };
}

/* ------------------------------------------------------------------ *
 * store
 * ------------------------------------------------------------------ */

const SERVER_SNAPSHOT = seed();
let state: Store | null = null;
const listeners = new Set<() => void>();

function load(): Store {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Store>;
      state = { ...seed(), ...parsed };
      return state;
    }
  } catch {
    /* blocked or corrupt storage — fall through to a clean seed */
  }
  state = seed();
  return state;
}

function persist() {
  if (typeof window === "undefined" || !state) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode: the tab keeps working from memory */
  }
}

function commit(next: Store) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function getSnapshot(): Store { return load(); }
export function getServerSnapshot(): Store { return SERVER_SNAPSHOT; }

function update(fn: (s: Store) => Store) { commit(fn(load())); }

/* ------------------------------------------------------------------ *
 * audio lives in the tab only — blobs never go to storage
 * ------------------------------------------------------------------ */

const audioUrls = new Map<string, string>();
export function keepAudio(id: string, url: string) { audioUrls.set(id, url); }
export function getAudio(id: string) { return audioUrls.get(id); }

/* ------------------------------------------------------------------ *
 * actions
 * ------------------------------------------------------------------ */

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const actions = {
  signIn(userId: string) {
    const person = load().people.find((p) => p.id === userId);
    if (!person) return false;
    update((s) => ({ ...s, session: { userId, role: person.role } }));
    return true;
  },

  signOut() { update((s) => ({ ...s, session: null })); },

  /** Demo sign-in: any password, but the address has to be a real account. */
  signInByEmail(email: string) {
    const person = load().people.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!person) return null;
    update((s) => ({ ...s, session: { userId: person.id, role: person.role } }));
    return person;
  },

  addRecording(input: { studentId: string; classId: string; durationSec: number; transcript?: string; topic?: string; hasAudio: boolean }) {
    const id = uid("rec");
    const rec: RecordingRec = {
      id,
      studentId: input.studentId,
      classId: input.classId,
      topic: input.topic ?? "Practice recording",
      createdAt: Date.now(),
      dateLabel: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      durationSec: input.durationSec,
      transcript: input.transcript ?? simulateTranscript(input.durationSec, Date.now()),
      hasAudio: input.hasAudio,
    };
    update((s) => ({ ...s, recordings: [rec, ...s.recordings] }));
    return rec;
  },

  addComment(recordingId: string, authorId: string, body: string) {
    const c: CommentRec = { id: uid("cm"), recordingId, authorId, body: body.trim(), createdAt: Date.now() };
    update((s) => ({ ...s, comments: [...s.comments, c] }));
    return c;
  },

  deleteComment(id: string) {
    update((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) }));
  },

  toggleNoteHidden(recordingId: string, noteTitle: string) {
    update((s) => {
      const cur = s.hiddenNotes[recordingId] ?? [];
      const next = cur.includes(noteTitle) ? cur.filter((t) => t !== noteTitle) : [...cur, noteTitle];
      return { ...s, hiddenNotes: { ...s.hiddenNotes, [recordingId]: next } };
    });
  },

  toggleRecordingHidden(recordingId: string) {
    update((s) => ({
      ...s,
      hiddenRecordings: s.hiddenRecordings.includes(recordingId)
        ? s.hiddenRecordings.filter((r) => r !== recordingId)
        : [...s.hiddenRecordings, recordingId],
    }));
  },

  markReviewed(recordingId: string) {
    update((s) => (s.reviewed.includes(recordingId) ? s : { ...s, reviewed: [...s.reviewed, recordingId] }));
  },

  reopenReview(recordingId: string) {
    update((s) => ({ ...s, reviewed: s.reviewed.filter((r) => r !== recordingId) }));
  },

  createClass(name: string, teacherId: string, term = "Fall 2026") {
    const c: ClassRec = { id: uid("c"), name: name.trim(), teacherId, term };
    update((s) => ({ ...s, classes: [...s.classes, c] }));
    return c;
  },

  addTeacher(name: string, email: string) {
    const t: PersonRec = { id: uid("u"), name: name.trim(), email: email.trim(), role: "teacher", createdAt: Date.now() };
    update((s) => ({ ...s, people: [...s.people, t] }));
    return t;
  },

  enrollStudent(name: string, email: string, classId: string) {
    const st: PersonRec = { id: uid("s"), name: name.trim(), email: email.trim(), role: "student", createdAt: Date.now() };
    update((s) => ({
      ...s,
      people: [...s.people, st],
      enrollments: [...s.enrollments, { studentId: st.id, classId }],
    }));
    return st;
  },

  /** "Name, email" per line — the shape of an SIS export. */
  importRoster(csv: string, classId: string) {
    const rows = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const added: PersonRec[] = [];
    const skipped: string[] = [];
    const existing = new Set(load().people.map((p) => p.email.toLowerCase()));

    for (const row of rows) {
      const [rawName, rawEmail] = row.split(",").map((c) => c?.trim() ?? "");
      if (!rawName) continue;
      if (/^(name|student)$/i.test(rawName)) continue;           // header row
      const email = rawEmail || `${rawName.toLowerCase().replace(/[^a-z]+/g, ".")}@student.humorize.edu`;
      if (existing.has(email.toLowerCase())) { skipped.push(rawName); continue; }
      existing.add(email.toLowerCase());
      added.push({ id: uid("s"), name: rawName, email, role: "student", createdAt: Date.now() });
    }

    if (added.length) {
      update((s) => ({
        ...s,
        people: [...s.people, ...added],
        enrollments: [...s.enrollments, ...added.map((a) => ({ studentId: a.id, classId }))],
      }));
    }
    return { added: added.length, skipped };
  },

  resetDemo() {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
    }
    commit(seed());
  },
};

/* ------------------------------------------------------------------ *
 * derived reads
 * ------------------------------------------------------------------ */

export type FullRecording = RecordingRec & {
  analysis: Analysis;
  flags: SafetyFlag[];
  studentName: string;
  className: string;
  hidden: boolean;
  reviewed: boolean;
  comments: (CommentRec & { authorName: string })[];
  hiddenNoteTitles: string[];
};

export function hydrate(s: Store, r: RecordingRec): FullRecording {
  return {
    ...r,
    analysis: analyze(r.transcript, r.durationSec),
    flags: screen(r.transcript),
    studentName: s.people.find((p) => p.id === r.studentId)?.name ?? "Unknown student",
    className: s.classes.find((c) => c.id === r.classId)?.name ?? "—",
    hidden: s.hiddenRecordings.includes(r.id),
    reviewed: s.reviewed.includes(r.id),
    hiddenNoteTitles: s.hiddenNotes[r.id] ?? [],
    comments: s.comments
      .filter((c) => c.recordingId === r.id)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((c) => ({ ...c, authorName: s.people.find((p) => p.id === c.authorId)?.name ?? "Teacher" })),
  };
}

export function recordingsFor(s: Store, studentId: string) {
  return s.recordings
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((r) => hydrate(s, r));
}

export function classRoster(s: Store, classId: string) {
  return s.enrollments
    .filter((e) => e.classId === classId)
    .map((e) => s.people.find((p) => p.id === e.studentId))
    .filter((p): p is PersonRec => Boolean(p));
}

export function classStats(s: Store, classId: string) {
  const roster = classRoster(s, classId);
  const recs = s.recordings.filter((r) => r.classId === classId).map((r) => hydrate(s, r));
  const wpm = recs.length ? Math.round(recs.reduce((n, r) => n + r.analysis.wpm, 0) / recs.length) : 0;
  const fillers = recs.length
    ? Math.round((recs.reduce((n, r) => n + r.analysis.fillerCount, 0) / recs.length) * 10) / 10
    : 0;
  return { students: roster.length, recordings: recs.length, avgWpm: wpm, avgFillers: fillers, roster, recs };
}

export function openFlags(s: Store) {
  return s.recordings
    .map((r) => hydrate(s, r))
    .filter((r) => r.flags.length > 0 && !r.reviewed)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
