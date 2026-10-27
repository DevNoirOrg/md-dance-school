"use client";

/* eslint-disable @next/next/no-img-element -- logó */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/actions/admin";
import { adminNav } from "@/lib/admin-nav";

/** Admin menü: asztalon bal oldali sáv, telefonon felső, vízszintesen görgethető sor. */
function NavLinks({ active }: { active?: (href: string) => boolean }) {
  return adminNav.map((item) => {
    const on = active?.(item.href) ?? false;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-colors ${
          on ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}

function ActiveNavLinks() {
  // admin subdomainen az útvonal "/orarend" is lehet — egységesítjük "/admin/..."-ra
  const raw = usePathname() ?? "/admin";
  const path = raw.startsWith("/admin") ? raw : "/admin" + (raw === "/" ? "" : raw);
  return (
    <NavLinks active={(href) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"))} />
  );
}

export default function AdminSidebar({ account }: { account: React.ReactNode }) {
  return (
    <aside className="bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 md:block md:px-6 md:pt-8">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/canva/logo-md-black-trim.png" alt="MD Dance School" className="h-11 w-auto invert" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-md-cyan">
            Admin
          </span>
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 hover:text-white md:mt-6 md:inline-block"
        >
          Oldal megnyitása ↗
        </a>
      </div>

      <nav className="mt-4 flex gap-1 overflow-x-auto px-3 pb-3 md:mt-6 md:flex-1 md:flex-col md:overflow-y-auto md:px-3 md:pb-6">
        <Suspense fallback={<NavLinks />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>

      <div className="hidden border-t border-white/10 px-6 py-5 text-xs md:block">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Bejelentkezve</p>
        {account}
        <form action={signOut} className="mt-3">
          <button type="submit" className="text-[11px] font-extrabold uppercase tracking-widest text-md-cyan hover:text-white">
            Kijelentkezés
          </button>
        </form>
      </div>
      <form action={signOut} className="px-5 pb-4 md:hidden">
        <button type="submit" className="text-[10px] font-extrabold uppercase tracking-widest text-md-cyan">
          Kijelentkezés
        </button>
      </form>
    </aside>
  );
}
