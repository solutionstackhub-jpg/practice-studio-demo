"use client";

import { useState } from "react";
import { Avatar, EmptyNote } from "@/components/ui";
import { Plus } from "@/components/icons";
import { Modal, Field, Input, Toast } from "@/components/forms";
import { actions, initials, classStats } from "@/lib/db";
import { useStore } from "@/lib/use-store";

export default function AdminTeachers() {
  const store = useStore();
  const teachers = store.people.filter((p) => p.role === "teacher");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function add(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    const addr = email.trim() || `${name.trim().toLowerCase().replace(/[^a-z]+/g, ".")}@humorize.edu`;
    if (store.people.some((p) => p.email.toLowerCase() === addr.toLowerCase())) {
      setError("That email address is already on the roster.");
      return;
    }
    const t = actions.addTeacher(name, addr);
    setName(""); setEmail(""); setError(null); setOpen(false);
    setToast(`${t.name} added. They can sign in with ${t.email}.`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{teachers.length} teachers</p>
          <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Teachers</h1>
          <p className="mt-2 text-[14px] text-body">Teachers see only the classes assigned to them.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus width={16} height={16} /> Add teacher</button>
      </div>

      <div className="rise mt-6 space-y-2.5" style={{ animationDelay: "70ms" }}>
        {teachers.map((t) => {
          const classes = store.classes.filter((c) => c.teacherId === t.id);
          const students = classes.reduce((n, c) => n + classStats(store, c.id).students, 0);
          return (
            <article key={t.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <Avatar initials={initials(t.name)} tone="soft" size={36} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{t.name}</span>
                  <span className="block truncate text-[12px] text-muted">{t.email}</span>
                </span>
              </span>
              <span className="tnum flex items-center gap-7 text-[13px] text-body">
                <span>{classes.length} class{classes.length === 1 ? "" : "es"}</span>
                <span>{students} students</span>
              </span>
            </article>
          );
        })}
        {teachers.length === 0 && <EmptyNote>No teachers yet.</EmptyNote>}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Add a teacher"
        subtitle="They sign in with this address. No invitation email is sent in the demo."
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={() => add()} disabled={!name.trim()} className="btn btn-primary disabled:bg-line-2 disabled:text-faint">Add teacher</button>
          </>
        }
      >
        <form onSubmit={add} className="space-y-4">
          <Field label="Full name"><Input value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Nora Beckett" autoFocus /></Field>
          <Field label="School email" hint="Leave blank and we will generate one.">
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="nora.beckett@humorize.edu" />
          </Field>
          {error && <p className="rounded-lg border border-rose/20 bg-rose/[0.07] px-3 py-2.5 text-[12.5px] text-amber-700">{error}</p>}
        </form>
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
