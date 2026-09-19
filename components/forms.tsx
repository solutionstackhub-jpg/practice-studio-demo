"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "./icons";

export function Modal({
  open, onClose, title, subtitle, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  children: ReactNode; footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const first = ref.current?.querySelector<HTMLElement>("input, textarea, select, button");
    first?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rise relative w-full max-w-[440px] overflow-hidden rounded-t-2xl border border-line-2 bg-surface-2 shadow-[0_32px_80px_-20px_rgb(0_0_0/.85)] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="-mr-1 shrink-0 rounded-md p-1.5 text-faint hover:bg-surface-3 hover:text-ink">
            <X width={16} height={16} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-faint">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-line-2 bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-gold/50";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} resize-none leading-relaxed ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputBase} appearance-none pr-9 ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <div className="rise fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-line-2 bg-surface-3 px-4 py-2.5 text-[13px] font-medium text-ink shadow-[0_18px_44px_-14px_rgb(0_0_0/.8)]">
      {message}
    </div>
  );
}
