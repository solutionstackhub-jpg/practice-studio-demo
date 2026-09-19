"use client";

import { StaffShell } from "@/components/shells";
import { RoleGate } from "@/components/role-gate";
import { Users, Student, ClipboardCheck } from "@/components/icons";
import { openFlags } from "@/lib/db";
import { useStore } from "@/lib/use-store";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const pending = openFlags(store).length;

  return (
    <RoleGate role="teacher">
      <StaffShell
        nav={[
          { href: "/teacher", label: "Classes", icon: <Users width={17} height={17} /> },
          { href: "/teacher/students", label: "Students", icon: <Student width={17} height={17} /> },
          { href: "/teacher/review", label: "Review", icon: <ClipboardCheck width={17} height={17} />, badge: pending },
        ]}
      >
        {children}
      </StaffShell>
    </RoleGate>
  );
}
