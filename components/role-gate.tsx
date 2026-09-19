"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSnapshot, type Role } from "@/lib/db";
import { useSession } from "@/lib/use-store";
import { Logo } from "./icons";

/**
 * Keeps each area behind a session.
 *
 * The first client render has to match the server, which has no session, so
 * the check waits one tick and then reads the store directly. Without that
 * wait every navigation bounces a signed-in person back to the login screen.
 */
export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const { person } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => { setChecked(true); }, []);

  useEffect(() => {
    if (!checked) return;
    const s = getSnapshot();
    const me = s.session ? s.people.find((p) => p.id === s.session!.userId) ?? null : null;
    if (!me) router.replace("/login");
    else if (me.role !== role) router.replace(`/${me.role}`);
  }, [checked, person, role, router]);

  if (!checked || !person || person.role !== role) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Logo className="animate-pulse text-gold" size={26} />
      </div>
    );
  }
  return <>{children}</>;
}
