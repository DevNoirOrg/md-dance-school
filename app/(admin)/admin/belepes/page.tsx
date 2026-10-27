/* eslint-disable @next/next/no-img-element -- logó */
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Belépés" };

const LINK_ERRORS: Record<string, string> = {
  link: "A belépési link lejárt vagy hibás. Kérj új kódot, és a levélben lévő linket ugyanebben a böngészőben nyisd meg.",
  jog: "Ehhez a címhez nincs admin jogosultság.",
};

async function LinkError({ searchParams }: { searchParams: Promise<{ hiba?: string }> }) {
  const { hiba } = await searchParams;
  const msg = hiba ? LINK_ERRORS[hiba] : undefined;
  if (!msg) return null;
  return <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{msg}</p>;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ hiba?: string }> }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 py-16">
      <div className="w-full max-w-md">
        <img src="/canva/logo-md-black-trim.png" alt="MD Dance School" className="mx-auto mb-8 h-24 w-auto invert" />
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] md:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-md-teal">Admin felület</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Belépés</h1>
          <Suspense fallback={null}>
            <LinkError searchParams={searchParams} />
          </Suspense>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
