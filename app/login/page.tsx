"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, ArrowRight, Check, Mic, Users, Grid } from "@/components/icons";
import { Field, Input } from "@/components/forms";
import { Waveform, AmbientGlow } from "@/components/art";
import { actions } from "@/lib/db";
import { useStore } from "@/lib/use-store";

const HOME: Record<string, string> = { student: "/student", teacher: "/teacher", admin: "/admin" };
const ROLE_ICON = { student: Mic, teacher: Users, admin: Grid } as const;

export default function LoginPage() {
  const router = useRouter();
  const store = useStore();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const quick = store.people.filter((p) => ["s-maya", "u-alex", "u-sam"].includes(p.id));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const match = store.people.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) {
      setError("We don’t have an account with that address. Try one of the demo accounts below.");
      return;
    }
    if (mode === "password" && password.length < 4) {
      setError("Enter any password of four characters or more — this demo does not check it.");
      return;
    }
    setBusy(true);
    if (mode === "magic") {
      // A real build emails a signed, single-use link. Here the link is the button.
      setSent(match.email);
      setBusy(false);
      return;
    }
    actions.signInByEmail(match.email);
    router.push(HOME[match.role]);
  }

  function signInAs(id: string, role: string) {
    actions.signIn(id);
    router.push(HOME[role]);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <AmbientGlow className="left-1/2 top-[-60px] h-[420px] w-[620px] -translate-x-1/2" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] opacity-[0.18] [mask-image:radial-gradient(60%_100%_at_50%_0%,black,transparent)]">
        <Waveform className="h-full w-full" bars={120} seed={13} />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="rise flex flex-col items-center text-center">
          <Logo className="text-gold" size={26} />
          <h1 className="mt-5 text-[25px] font-semibold tracking-[-0.03em] text-ink">Sign in to Practice Studio</h1>
          <p className="mt-2 text-[13.5px] text-body">
            {mode === "magic" ? "We’ll send a one-time link to your school address." : "Use your school email address."}
          </p>
        </div>

        {sent ? (
          <div className="rise card mt-8 px-5 py-7 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-mint/[0.10] text-mint ring-1 ring-mint/20">
              <Check width={20} height={20} />
            </span>
            <h2 className="mt-4 text-[16px] font-semibold text-ink">Check your inbox</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-body">
              A sign-in link is on its way to <span className="text-ink">{sent}</span>.
            </p>
            <button
              onClick={() => { const p = actions.signInByEmail(sent); if (p) router.push(HOME[p.role]); }}
              className="btn btn-primary mt-5 w-full justify-center"
            >
              Open the link <ArrowRight width={15} height={15} />
            </button>
            <p className="mt-3 text-[11.5px] text-faint">
              No mail is actually sent in this demo — the button stands in for the link.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="rise card mt-8 px-5 py-5" style={{ animationDelay: "60ms" }}>
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-surface p-1">
              {(["password", "magic"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className={`rounded-md py-1.5 text-[12.5px] font-medium transition-colors ${
                    mode === m ? "bg-surface-3 text-ink" : "text-muted hover:text-ink-2"
                  }`}
                >
                  {m === "password" ? "Password" : "Magic link"}
                </button>
              ))}
            </div>

            <div className="space-y-3.5">
              <Field label="School email">
                <Input
                  type="email" value={email} autoComplete="email" required
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@humorize.edu"
                />
              </Field>

              {mode === "password" && (
                <Field label="Password" hint="Any password works here. Nothing is stored or checked.">
                  <Input
                    type="password" value={password} autoComplete="current-password"
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                  />
                </Field>
              )}
            </div>

            {error && (
              <p className="mt-3.5 rounded-lg border border-rose/20 bg-rose/[0.07] px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full justify-center py-3">
              {mode === "magic" ? "Send me a link" : "Sign in"}
              <ArrowRight width={15} height={15} />
            </button>
          </form>
        )}

        <div className="rise mt-7" style={{ animationDelay: "140ms" }}>
          <p className="eyebrow text-center">Demo accounts — one click</p>
          <div className="mt-3 space-y-2">
            {quick.map((p) => {
              const Icon = ROLE_ICON[p.role];
              return (
                <button
                  key={p.id}
                  onClick={() => signInAs(p.id, p.role)}
                  className="card flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:border-gold/35"
                >
                  <span className="chip h-8 w-8 bg-white/[0.04] text-body ring-1 ring-line-2">
                    <Icon width={15} height={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-ink">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-muted">{p.email}</span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">{p.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-7 text-center text-[12px] text-faint">
          <Link href="/" className="hover:text-body">Back to the demo overview</Link>
        </p>
      </div>
    </div>
  );
}
