"use client";

import { classRoster, recordingsFor } from "@/lib/db";
import { useSession } from "@/lib/use-store";

/** The class the student is actually enrolled in, not a hard-coded label. */
export function StudentHeroMeta() {
  const { store, person } = useSession();
  if (!person) return null;
  const cls = store.classes.find((c) =>
    store.enrollments.some((e) => e.classId === c.id && e.studentId === person.id)
  );
  const count = recordingsFor(store, person.id).filter((r) => !r.hidden).length;
  const peers = cls ? classRoster(store, cls.id).length : 0;

  return (
    <p className="eyebrow">
      {cls ? cls.name.replace(" — ", " · ") : "Not enrolled yet"}
      {peers > 0 && <span className="text-faint"> · {peers} students</span>}
      {count > 0 && <span className="text-faint"> · {count} recorded</span>}
    </p>
  );
}
