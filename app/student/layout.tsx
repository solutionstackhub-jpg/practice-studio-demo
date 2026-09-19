"use client";

import { RoleGate } from "@/components/role-gate";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate role="student">{children}</RoleGate>;
}
