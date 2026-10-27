"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { inputCls } from "@/components/admin/ui";

const initial: LoginState = { step: "email", email: "" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const { step, email, error } = state;

  if (step === "code") {
    return (
      <form action={action} className="mt-6 space-y-4">
        <p className="rounded-2xl bg-md-pale/70 px-4 py-3 text-sm font-semibold text-md-teal">{state.message ?? "Elküldtük a belépési kódot."}</p>
        <input type="hidden" name="email" value={email} />
        <div className="space-y-1.5">
          <label htmlFor="code" className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            Belépési kód
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            maxLength={10}
            placeholder="123456"
            className={`${inputCls} text-center text-2xl tracking-[0.4em]`}
          />
        </div>
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-ink py-4 text-xs font-extrabold uppercase tracking-[0.25em] text-white transition-colors hover:bg-md-teal disabled:opacity-60"
        >
          {pending ? "Ellenőrzés…" : "Belépés"}
        </button>
        <p className="text-center text-xs text-slate-400">
          Nem jött meg? Nézd meg a spam mappát, vagy{" "}
          <a href="/admin/belepes" className="font-bold text-md-teal underline">
            kérj új kódot
          </a>
          .
        </p>
      </form>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <p className="text-sm text-slate-500">Add meg az e-mail címed, és küldünk egy egyszer használatos belépési kódot.</p>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          E-mail cím
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          defaultValue={email}
          placeholder="te@pelda.hu"
          className={inputCls}
        />
      </div>
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-ink py-4 text-xs font-extrabold uppercase tracking-[0.25em] text-white transition-colors hover:bg-md-teal disabled:opacity-60"
      >
        {pending ? "Küldés…" : "Kód küldése"}
      </button>
    </form>
  );
}
