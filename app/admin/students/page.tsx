"use client";

import { useState } from "react";
import { Avatar, EmptyNote, Pill } from "@/components/ui";
import { Plus, Alert } from "@/components/icons";
import { Modal, Field, Input, Select, Textarea, Toast } from "@/components/forms";
import { actions, initials, recordingsFor, classRoster } from "@/lib/db";
import { useStore } from "@/lib/use-store";

export default function AdminStudents() {
  const store = useStore();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState(store.classes[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [csv, setCsv] = useState("");

  const rows = store.classes.flatMap((c) =>
    classRoster(store, c.id).map((s) => ({ ...s, className: c.name, classId: c.id }))
  );
  const filtered = q.trim()
    ? rows.filter((r) => (r.name + r.email + r.className).toLowerCase().includes(q.trim().toLowerCase()))
    : rows;

  function enroll(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !classId) return;
    const addr = email.trim() || `${name.trim().toLowerCase().replace(/[^a-z]+/g, ".")}@student.humorize.edu`;
    if (store.people.some((p) => p.email.toLowerCase() === addr.toLowerCase())) {
      setError("That email address is already enrolled.");
      return;
    }
    const s = actions.enrollStudent(name, addr, classId);
    setName(""); setEmail(""); setError(null); setEnrollOpen(false);
    setToast(`${s.name} enrolled.`);
  }

  function runImport(e?: React.FormEvent) {
    e?.preventDefault();
    if (!csv.trim() || !classId) return;
    const { added, skipped } = actions.importRoster(csv, classId);
    setCsv(""); setCsvOpen(false);
    setToast(
      added === 0
        ? "Nothing imported — every row was already on the roster."
        : `${added} student${added === 1 ? "" : "s"} enrolled${skipped.length ? `, ${skipped.length} already on the roster` : ""}.`
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{rows.length} enrolled</p>
          <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Students</h1>
          <p className="mt-2 text-[14px] text-body">Enroll one at a time, or paste a roster from your SIS export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCsvOpen(true)} className="btn btn-ghost">Import roster</button>
          <button onClick={() => setEnrollOpen(true)} className="btn btn-primary"><Plus width={16} height={16} /> Enroll student</button>
        </div>
      </div>

      <div className="rise mt-5 w-full sm:w-[280px]" style={{ animationDelay: "50ms" }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5"><EmptyNote>{q ? `Nobody matches “${q}”.` : "No students enrolled yet."}</EmptyNote></div>
      ) : (
        <div className="rise mt-4 card overflow-hidden" style={{ animationDelay: "80ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-white/[0.02]">
                  <th className="thead px-5 py-3">Student</th>
                  <th className="thead px-5 py-3">Class</th>
                  <th className="thead px-5 py-3">Recordings</th>
                  <th className="thead px-5 py-3">Avg. pace</th>
                  <th className="thead px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const recs = recordingsFor(store, s.id);
                  const clean = recs.filter((r) => r.flags.length === 0);
                  const avg = clean.length ? Math.round(clean.reduce((n, r) => n + r.analysis.wpm, 0) / clean.length) : 0;
                  const pending = recs.filter((r) => r.flags.length > 0 && !r.reviewed).length;
                  return (
                    <tr key={`${s.id}-${s.classId}`} className="border-b border-line last:border-0 transition-colors hover:bg-white/[0.022]">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2.5">
                          <Avatar initials={initials(s.name)} tone="soft" size={26} />
                          <span>
                            <span className="block text-[14px] font-medium text-ink">{s.name}</span>
                            <span className="block text-[11.5px] text-muted">{s.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-body">{s.className}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{recs.length}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{avg || "—"}</td>
                      <td className="px-5 py-3">
                        {pending > 0
                          ? <Pill tone="amber"><Alert width={12} height={12} /> {pending} to review</Pill>
                          : <span className="text-[12.5px] text-faint">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={enrollOpen}
        onClose={() => { setEnrollOpen(false); setError(null); }}
        title="Enroll a student"
        footer={
          <>
            <button onClick={() => setEnrollOpen(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={() => enroll()} disabled={!name.trim() || !classId} className="btn btn-primary disabled:bg-line-2 disabled:text-faint">Enroll</button>
          </>
        }
      >
        <form onSubmit={enroll} className="space-y-4">
          <Field label="Full name"><Input value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Ravi Menon" autoFocus /></Field>
          <Field label="School email" hint="Leave blank and we will generate one.">
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="ravi.m@student.humorize.edu" />
          </Field>
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {store.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          {error && <p className="rounded-lg border border-rose/20 bg-rose/[0.07] px-3 py-2.5 text-[12.5px] text-amber-700">{error}</p>}
        </form>
      </Modal>

      <Modal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Import a roster"
        subtitle="One student per line: name, email. A header row is ignored, and anyone already enrolled is skipped."
        footer={
          <>
            <button onClick={() => setCsvOpen(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={() => runImport()} disabled={!csv.trim() || !classId} className="btn btn-primary disabled:bg-line-2 disabled:text-faint">
              Import
            </button>
          </>
        }
      >
        <form onSubmit={runImport} className="space-y-4">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {store.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Rows">
            <Textarea
              rows={7}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={"Name, Email\nRavi Menon, ravi.m@student.humorize.edu\nGrace Okafor, grace.o@student.humorize.edu"}
              className="font-mono text-[12.5px]"
            />
          </Field>
          <button
            type="button"
            onClick={() => setCsv("Name, Email\nRavi Menon, ravi.m@student.humorize.edu\nGrace Okafor, grace.o@student.humorize.edu\nTom Baker, tom.b@student.humorize.edu")}
            className="text-[12.5px] font-medium text-gold hover:text-gold-2"
          >
            Paste a sample roster
          </button>
        </form>
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
