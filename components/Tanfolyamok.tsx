"use client";
import FadeIn from "./FadeIn";
import HalftoneDots from "./HalftoneDots";
import type { CoursesContent } from "@/lib/content-types";

/* Tanfolyamok (az /orarend oldalon) — a szövegek az adminban szerkeszthetők. */

function GroupTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8 flex items-end gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-md-deep">{kicker}</p>
        <h3 className="section-title mt-2 text-3xl text-black sm:text-4xl">{title}</h3>
      </div>
      <div className="mb-3 h-[2px] flex-1 bg-black/10" />
    </div>
  );
}

export default function Tanfolyamok({ courses }: { courses: CoursesContent }) {
  return (
    <section id="tanfolyamok" className="relative z-20 scroll-mt-24 bg-white px-4 pb-24 pt-8 sm:pb-32" style={{ overflowX: "clip" }}>
      <HalftoneDots className="hidden md:block" size={260} zIndex={0} style={{ top: "38%", left: -130 }} />
      <HalftoneDots className="hidden md:block" size={240} zIndex={0} style={{ bottom: 120, right: -120 }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mb-14 text-center sm:mb-20">
          <h2 className="section-title text-5xl text-black sm:text-6xl">{courses.title}</h2>
          {courses.intro && <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">{courses.intro}</p>}
        </FadeIn>

        {/* 1) Mielőtt jössz */}
        {courses.steps.length > 0 && (
          <>
            <GroupTitle kicker="Első lépések" title="Mielőtt jössz" />
            <div className="grid gap-5 md:grid-cols-3">
              {courses.steps.map((c, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="h-full rounded-[1.75rem] bg-black p-7 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <span className="section-title text-4xl text-md-cyan">{String(i + 1).padStart(2, "0")}</span>
                    <h4 className="mt-3 text-xl font-extrabold">{c.title}</h4>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/75">{c.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </>
        )}

        {/* 2) Stílusok */}
        {courses.styles.length > 0 && (
          <div className="mt-20 sm:mt-24">
            <GroupTitle kicker="Amit tanítunk" title="Stílusok" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.styles.map((c, i) => (
                <FadeIn key={i} delay={(i % 3) * 0.08}>
                  <div className="group flex h-full flex-col rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-colors hover:border-md-cyan">
                    <div className="mb-4 h-1.5 w-12 rounded-full bg-md-cyan transition-all duration-300 group-hover:w-20" />
                    <h4 className="section-title text-3xl text-black">{c.title}</h4>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-600">{c.text}</p>
                    {c.teachers.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Tanár</span>
                        {c.teachers.map((t) => (
                          <span key={t} className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* 3) Szintek és csoportok */}
        {courses.groups.length > 0 && (
          <div className="mt-20 sm:mt-24">
            <GroupTitle kicker="Kinek szól" title="Szintek és csoportok" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.groups.map((c, i) => (
                <FadeIn key={i} delay={(i % 3) * 0.08}>
                  <div className="h-full rounded-[1.75rem] bg-gray-50 p-7 ring-1 ring-black/5">
                    {c.tag && (
                      <span className="inline-block rounded-full bg-md-cyan px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-black">
                        {c.tag}
                      </span>
                    )}
                    <h4 className="mt-4 text-2xl font-extrabold text-black">{c.title}</h4>
                    <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{c.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <FadeIn className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#jelentkezes"
            className="w-full rounded-xl bg-black px-7 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-md-cyan hover:text-black sm:w-auto"
          >
            Jelentkezem egy tanfolyamra
          </a>
          <a
            href="#orarend"
            className="w-full rounded-xl border-[3px] border-black px-7 py-[13px] text-center text-sm font-extrabold uppercase tracking-widest text-black transition-colors hover:border-md-cyan hover:bg-md-cyan sm:w-auto"
          >
            Vissza az órarendhez
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
