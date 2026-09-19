import { analyze, type Analysis } from "./analysis";
import { screen, type SafetyFlag } from "./safety";

export type Role = "student" | "teacher" | "admin";

export type Person = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  subtitle?: string;
};

export const MAYA: Person   = { id: "u-maya",   name: "Maya Chen",   initials: "M",  role: "student" };
export const TEACHER: Person = { id: "u-alex",  name: "Alex Morgan", initials: "AM", role: "teacher", subtitle: "Teacher" };
export const ADMIN: Person   = { id: "u-sam",   name: "Sam Lee",     initials: "SL", role: "admin",   subtitle: "Admin" };

export type SeedRecording = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  topic: string;
  date: string;      // ISO
  dateLabel: string;
  durationSec: number;
  transcript: string;
  teacherComment?: { author: string; body: string; when: string };
  hidden?: boolean;
};

/* ------------------------------------------------------------------ *
 * Transcripts. Written out in full so every number on screen is
 * derived, not typed in. Change a word and the metrics move.
 * ------------------------------------------------------------------ */

const T_PERSUASIVE = `I think public speaking is um something that everyone should learn, and not just the people who already enjoy it. When I started this class I could barely get through a paragraph without losing my place. My hands would shake and I would rush to the end so I could sit down again. But the thing nobody tells you is that, you know, confidence is not something you are born with. It is something you build one take at a time.

Here is what changed for me. I stopped trying to sound like a professional speaker and started trying to sound like myself on a good day. That meant slowing down. It meant, um, letting a sentence finish before starting the next one. And it meant being okay with a bit of silence, because, like, silence feels a lot longer to the person talking than it does to anyone listening.

There is a practical side to this too. Every job I can think of involves explaining something to someone who does not already agree with you. Doctors explain treatment options to families who are frightened. Engineers explain trade-offs to people paying the bill. Teachers explain everything, all day, to a room that did not ask to be there. If you cannot hold a room for two minutes, you are going to spend a long career watching other people get credit for ideas that started with you.

So, my argument is simple. Public speaking should not be an elective that a few brave students sign up for. It should be a skill we all practice, uh, the same way we practice writing. Because the ideas that win are not always the best ideas. They are the ones that got explained well.`;

const T_PRACTICE_4 = `Okay so, I want to talk about why our school should keep the late bus running. Right now it leaves at four fifteen, which sounds fine until you actually, um, look at when clubs finish. Robotics runs until four thirty. Debate runs until four forty five. So the students who stay for the things the school keeps telling us to join are the exact students who, like, cannot get home.

I asked around my grade and, you know, twelve people told me they quit an activity this year because of the bus. Twelve. That is one full club. And it is always the same group of people, because if your family has a second car this is not a problem you have ever had to think about.

I am not asking for a whole new route. I am asking for one bus, thirty minutes later, two days a week. I worked out roughly what that costs and it is, uh, less than what we spent on the new scoreboard. I know that is not a fair comparison, but I think it says something about what we decide is worth paying for.

So basically, if we want people to show up for things, we have to give them a way to get home afterwards. That is the whole argument. Thank you.`;

const T_PRACTICE_3 = `Good morning. I am going to explain how a small change to the library schedule would help a lot of people.

At the moment the library closes at three. Most students finish their last class at two fifty, which gives you ten minutes to get across the building, find what you need and check it out. In practice that means you do not go at all. You tell yourself you will go tomorrow and then tomorrow has the same ten minutes in it.

If the library stayed open until four, that is one extra hour, and I think the people who would use it are the people who need it most. Not everybody has a quiet room at home. Not everybody has a desk. For some students that hour is the only stretch of the day where nobody needs anything from them.

I spoke to the librarian and she said staffing is the real problem, not the hours. So maybe the answer is student volunteers. I would sign up. I know at least four other people who would too. It is a small idea, but small ideas are the ones that actually get done.`;

const T_INTRO = `Hi everyone, um, my name is Maya and this is my first year in this class.

I signed up because I am fine talking to one person and completely useless talking to thirty. I can write something I am proud of and then read it out loud and, you know, watch it fall apart in front of me. I would like that to stop being true.

Outside of school I make short videos about cooking, which is, like, a strange thing to admit in a speech class, because the whole appeal of video is that you can cut out every bad take. There is no cutting here. That is the part I am nervous about and also the part I think I need.

My goal for this semester is pretty small. I want to get through three minutes without apologizing once. So, um, that is me. Thanks for listening.`;

const T_JORDAN_FLAGGED = `I was supposed to talk about a person I admire but honestly I have been finding it hard to care about any of this lately. Everything feels pointless most days and I have not really told anyone that.

I still did the assignment. My topic was my grandmother. She moved here on her own when she was nineteen and did not speak the language and she just figured it out, which is the kind of thing that sounds inspiring when you say it out loud in a classroom.

I do not know. I have been really tired. I can't sleep at all most nights and then the whole day is just getting through it. Anyway that is my speech. Sorry it is not very good.`;

const T_SOFIA_FLAGGED = `So my speech is about a time I had to be brave. Last month things got loud at home again and I ended up sitting outside for a couple of hours because I was scared to go home while it was still going on.

I do not really want to say more than that. The brave part I guess was going back in. I did not feel brave. I felt like I did not have anywhere else to be.

Um, I know this was supposed to be two minutes and it is shorter. I could not think of anything else that was true.`;

const T_ETHAN = `I want to make the case for keeping handwritten notes in a world where everybody has a laptop open.

There is research on this, and, um, the short version is that typing lets you keep up. You can transcribe a whole lecture without understanding a word of it. Writing by hand is slow enough that you are forced to decide what matters. The slowness is not a bug, it is the entire point.

I am not saying throw out your laptop. I use mine constantly. I am saying that for the forty minutes where someone is trying to explain something difficult to you, being slightly worse at recording it makes you significantly better at understanding it.

So, my ask is small. Try one class a week on paper. Compare what you remember. That is it.`;

const T_OLIVIA = `Today I am talking about why the school should compost its cafeteria waste.

Every lunch period we throw out, uh, somewhere around four large bins of food. Most of that is not packaging. It is apple cores, sandwich crusts, the vegetables nobody wanted. That material goes to landfill where it breaks down without oxygen and produces methane, which is a far more aggressive greenhouse gas than carbon dioxide over a twenty year window.

A compost program at our scale is not complicated. Three bins, clear signage, and one person checking them at the end of lunch. Two schools in the district already do it and, you know, neither of them reported it being difficult.

The reason I care is that this is one of the few climate things a school can actually control. We cannot change national policy from a cafeteria. We can change what leaves the cafeteria.`;

export const SEED_RECORDINGS: SeedRecording[] = [
  {
    id: "r-1", studentId: "s-maya", studentName: "Maya Chen",
    className: "Period 3 — Public Speaking", topic: "Persuasive Speech",
    date: "2026-09-17", dateLabel: "Sep 17, 2026", durationSec: 0, transcript: T_PERSUASIVE,
    teacherComment: {
      author: "Alex Morgan",
      body: "The middle section is the strongest thing you have recorded. Bring that same energy to your opening next time.",
      when: "Sep 17, 2026",
    },
  },
  { id: "r-2", studentId: "s-maya", studentName: "Maya Chen", className: "Period 3 — Public Speaking",
    topic: "Practice #4", date: "2026-09-12", dateLabel: "Sep 12, 2026", durationSec: 0, transcript: T_PRACTICE_4 },
  { id: "r-3", studentId: "s-maya", studentName: "Maya Chen", className: "Period 3 — Public Speaking",
    topic: "Practice #3", date: "2026-09-08", dateLabel: "Sep 8, 2026", durationSec: 0, transcript: T_PRACTICE_3 },
  { id: "r-4", studentId: "s-maya", studentName: "Maya Chen", className: "Period 3 — Public Speaking",
    topic: "Class Introduction", date: "2026-09-03", dateLabel: "Sep 3, 2026", durationSec: 0, transcript: T_INTRO },
  { id: "r-5", studentId: "s-jordan", studentName: "Jordan Lee", className: "Period 3 — Public Speaking",
    topic: "Someone I Admire", date: "2026-09-18", dateLabel: "18 minutes ago", durationSec: 0, transcript: T_JORDAN_FLAGGED },
  { id: "r-6", studentId: "s-sofia", studentName: "Sofia Reyes", className: "Period 3 — Public Speaking",
    topic: "A Time I Was Brave", date: "2026-09-18", dateLabel: "2 hours ago", durationSec: 0, transcript: T_SOFIA_FLAGGED },
  { id: "r-7", studentId: "s-ethan", studentName: "Ethan Park", className: "Period 3 — Public Speaking",
    topic: "Practice #2", date: "2026-09-15", dateLabel: "Sep 15, 2026", durationSec: 0, transcript: T_ETHAN },
  { id: "r-8", studentId: "s-olivia", studentName: "Olivia Carter", className: "Period 3 — Public Speaking",
    topic: "Persuasive Speech", date: "2026-09-14", dateLabel: "Sep 14, 2026", durationSec: 0, transcript: T_OLIVIA },
];

/** Durations chosen so each clip lands at a realistic delivery speed. */
const TARGET_WPM: Record<string, number> = {
  "r-1": 142, "r-2": 156, "r-3": 149, "r-4": 138,
  "r-5": 131, "r-6": 124, "r-7": 148, "r-8": 155,
};

for (const r of SEED_RECORDINGS) {
  const words = (r.transcript.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) ?? []).length;
  r.durationSec = Math.round((words / TARGET_WPM[r.id]) * 60);
}

export type EnrichedRecording = SeedRecording & {
  analysis: Analysis;
  flags: SafetyFlag[];
};

export function enrich(r: SeedRecording): EnrichedRecording {
  return { ...r, analysis: analyze(r.transcript, r.durationSec), flags: screen(r.transcript) };
}

export const RECORDINGS: EnrichedRecording[] = SEED_RECORDINGS.map(enrich);

export function recordingById(id: string) {
  return RECORDINGS.find((r) => r.id === id);
}

export const MAYA_RECORDINGS = RECORDINGS.filter((r) => r.studentId === "s-maya");
export const FLAGGED = RECORDINGS.filter((r) => r.flags.length > 0);

/* ------------------------------------------------------------------ *
 * Roster and class aggregates
 * ------------------------------------------------------------------ */

export type RosterRow = {
  id: string; name: string; initials: string;
  recordings: number; avgPace: number; fillerTrendPct: number; lastPractice: string;
};

export type ClassRow = {
  id: string; name: string; students: number; recordings: number; avgWpm: number;
  roster?: RosterRow[];
};

export const CLASSES: ClassRow[] = [
  {
    id: "c-p3", name: "Period 3 — Public Speaking", students: 24, recordings: 81, avgWpm: 143,
    roster: [
      { id: "s-maya",   name: "Maya Chen",     initials: "MC", recordings: 6, avgPace: 142, fillerTrendPct: -18, lastPractice: "Today" },
      { id: "s-jordan", name: "Jordan Lee",    initials: "JL", recordings: 4, avgPace: 161, fillerTrendPct: -7,  lastPractice: "Yesterday" },
      { id: "s-sofia",  name: "Sofia Reyes",   initials: "SR", recordings: 7, avgPace: 137, fillerTrendPct: 4,   lastPractice: "Sep 16" },
      { id: "s-ethan",  name: "Ethan Park",    initials: "EP", recordings: 5, avgPace: 148, fillerTrendPct: -12, lastPractice: "Sep 15" },
      { id: "s-olivia", name: "Olivia Carter", initials: "OC", recordings: 3, avgPace: 155, fillerTrendPct: -9,  lastPractice: "Sep 14" },
    ],
  },
  { id: "c-p1", name: "Period 1 — Speech & Debate",     students: 26, recordings: 112, avgWpm: 139 },
  { id: "c-p5", name: "Period 5 — Communication Skills", students: 21, recordings: 64,  avgWpm: 147 },
];

/* ------------------------------------------------------------------ *
 * Admin figures
 * ------------------------------------------------------------------ */

export const ADMIN_STATS = {
  students: 247, teachers: 18, recordingsThisMonth: 1284, avgWpm: 142,
};

export const RECORDINGS_OVER_TIME = [
  28, 34, 31, 47, 39, 52, 44, 36, 58, 49, 61, 55,
  43, 67, 59, 72, 64, 51, 78, 69, 83, 74, 66, 91,
  85, 77, 96, 88, 102, 94,
];

export const FILLER_TREND = [6.2, 6.0, 6.4, 5.9, 6.1, 5.6, 5.8, 5.4, 5.7, 5.2];

export const ACTIVITY = [
  { kind: "class"  as const, text: "Alex Morgan created a new class", when: "2 hours ago" },
  { kind: "people" as const, text: "24 students were enrolled in Period 3", when: "3 hours ago" },
  { kind: "flag"   as const, text: "Jordan Lee's recording was flagged for review", when: "4 hours ago" },
  { kind: "people" as const, text: "Priya Raman was added as a teacher", when: "Yesterday" },
  { kind: "class"  as const, text: "Period 5 — Communication Skills was archived", when: "2 days ago" },
];

/* ------------------------------------------------------------------ *
 * Stand-in for Whisper.
 *
 * The demo has no transcription key, so a recording is paired with one of
 * these passages, trimmed to the number of words a person would actually
 * speak in the time recorded. Everything downstream — pace, fillers,
 * coaching, screening — then runs for real on that text.
 * ------------------------------------------------------------------ */

const POOL = [T_PERSUASIVE, T_PRACTICE_4, T_PRACTICE_3, T_ETHAN, T_OLIVIA];

export function simulateTranscript(durationSec: number, seed = Date.now()): string {
  const pick = POOL[Math.floor(seed / 1000) % POOL.length];
  const wpm = 118 + ((Math.floor(seed / 37) % 50));
  const target = Math.max(12, Math.round((durationSec / 60) * wpm));

  const words = pick.split(/\s+/);
  const out: string[] = [];
  let i = 0;
  while (out.length < target) {
    out.push(words[i % words.length]);
    i++;
    if (i > words.length * 3) break;
  }
  let text = out.join(" ").trim();
  const lastStop = Math.max(text.lastIndexOf("."), text.lastIndexOf("?"), text.lastIndexOf("!"));
  if (lastStop > text.length * 0.5) text = text.slice(0, lastStop + 1);
  else text = text.replace(/[,;:]?$/, ".");
  return text;
}
