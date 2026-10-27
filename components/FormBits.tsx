"use client";
import type { ReactNode, SelectHTMLAttributes } from "react";

/* Az űrlapok (órajelentkezés, tánctábor, „Írj nekünk”) közös elemei. */

export const inputBase =
  "w-full rounded-2xl border-2 bg-gray-50 px-5 py-4 font-semibold text-black transition-colors placeholder:font-medium placeholder:text-gray-300 focus:outline-none";

/** Beviteli mező osztályai: hibánál piros, egyébként türkiz fókusz. */
export const inputCls = (error: unknown, extra = "") =>
  `${inputBase} ${error ? "border-red-300 bg-red-50/60" : "border-transparent focus:border-md-cyan/60"} ${extra}`;

export function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="ml-3 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
        {label} {required && <span className="text-[#1a9ea3]">*</span>}
      </label>
      {children}
      {error && <p className="ml-3 text-[13px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  options,
  className,
  value,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; value: string }) {
  return (
    <div className="relative">
      <select {...props} value={value} className={`${className} cursor-pointer appearance-none pr-12 ${value ? "" : "text-gray-400"}`}>
        <option value="">Válassz…</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-black">
            {o}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500">
        <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Sikeres beküldés utáni pipa-ikon. */
export function SuccessIcon({ size = "h-20 w-20" }: { size?: string }) {
  return (
    <div className={`mx-auto flex ${size} items-center justify-center rounded-full bg-md-cyan/20`}>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#000" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Összegző sorok a köszönő állapotban. */
export function SummaryRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-8 space-y-3 rounded-3xl bg-gray-50 p-6 text-left">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
          <span className="shrink-0 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 sm:w-44">{label}</span>
          <span className="whitespace-pre-line text-sm font-bold text-black">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** Rejtett spam-csapda mező (ember nem látja, nem tölti ki). */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute -left-[9999px] h-0 w-0 opacity-0"
      aria-hidden="true"
    />
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
      {children}
    </p>
  );
}
