"use client";

import { StaffShell } from "@/components/shells";
import { RoleGate } from "@/components/role-gate";
import { Grid, Users, Student, ClipboardCheck } from "@/components/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="admin">
      <StaffShell
        nav={[
          { href: "/admin", label: "Overview", icon: <Grid width={17} height={17} /> },
          { href: "/admin/classes", label: "Classes", icon: <ClipboardCheck width={17} height={17} /> },
          { href: "/admin/teachers", label: "Teachers", icon: <Users width={17} height={17} /> },
          { href: "/admin/students", label: "Students", icon: <Student width={17} height={17} /> },
        ]}
      >
        {children}
      </StaffShell>
    </RoleGate>
  );
}
