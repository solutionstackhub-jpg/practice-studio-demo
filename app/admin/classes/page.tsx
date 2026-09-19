"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ArrowRight } from "@/components/icons";
import { Modal, Field, Input, Select, Toast } from "@/components/forms";
import { EmptyNote } from "@/components/ui";
import { actions, classStats } from "@/lib/db";
import { useStore } from "@/lib/use-store";

export default function AdminClasses() {
  const store = useStore();
  const teachers = store.people.filter((p) => p.role === "teacher");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [toast, setToast] = useState<string | null>(null);

  function create(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !teacherId) return;
    const c = actions.createClass(name, teacherId);
    setName("");
    setOpen(false);
    setToast(`“${c.name}” created.`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{store.classes.length} classes</p>
          <h1 className="mt-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Classes</h1>
          <p className="mt-2 text-[14px] text-body">Create a class, assign a teacher, enroll students.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus width={16} height={16} /> Create class</button>
      </div>

      {store.classes.length === 0 ? (
        <div className="mt-6"><EmptyNote>No classes yet.</EmptyNote></div>
      ) : (
        <div className="rise mt-6 card overflow-hidden" style={{ animationDelay: "70ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-white/[0.02]">
                  <th className="thead px-5 py-3">Class</th>
                  <th className="thead px-5 py-3">Teacher</th>
                  <th className="thead px-5 py-3">Students</th>
                  <th className="thead px-5 py-3">Recordings</th>
                  <th className="thead px-5 py-3">Avg. WPM</th>
                  <th className="thead px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {store.classes.map((c) => {
                  const s = classStats(store, c.id);
                  const t = store.people.find((p) => p.id === c.teacherId);
                  return (
                    <tr key={c.id} className="border-b border-line last:border-0 transition-colors hover:bg-white/[0.022]">
                      <td className="px-5 py-3 text-[14px] font-medium text-ink">{c.name}</td>
                      <td className="px-5 py-3 text-[13px] text-body">{t?.name ?? "Unassigned"}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{s.students}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{s.recordings}</td>
                      <td className="tnum px-5 py-3 text-[13px] text-body">{s.avgWpm || "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/teacher/class/${c.id}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-gold hover:text-gold-2">
                          Open <ArrowRight width={13} height={13} />
                        </Link>
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
        open={open}
        onClose={() => setOpen(false)}
        title="Create a class"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={() => create()} disabled={!name.trim() || !teacherId} className="btn btn-primary disabled:bg-line-2 disabled:text-faint">
              Create class
            </button>
          </>
        }
      >
        <form onSubmit={create} className="space-y-4">
          <Field label="Class name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Period 2 — Persuasive Speaking" autoFocus /></Field>
          <Field label="Teacher">
            <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
        </form>
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
