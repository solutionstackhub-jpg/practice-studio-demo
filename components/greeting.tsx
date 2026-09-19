"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-store";

export function Greeting() {
  const { person } = useSession();
  const [part, setPart] = useState("afternoon");
  useEffect(() => {
    const h = new Date().getHours();
    setPart(h < 12 ? "morning" : h < 18 ? "afternoon" : "evening");
  }, []);
  return <>Good {part}, {person?.name.split(" ")[0] ?? "there"}</>;
}
