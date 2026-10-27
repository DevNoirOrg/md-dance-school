"use client";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { SelectionChip, useClassSelection, type SelectedClass } from "./ClassSelection";
import HalftoneDots from "./HalftoneDots";
import type { Room } from "@/lib/content-types";

const MD_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

function ScheduleItem({ cls, index }: { cls: SelectedClass; index: number }) {
  const { isSelected, toggle } = useClassSelection();
  const on = isSelected(cls.id);
  return (
    <motion.button
      type="button"
      onClick={() => toggle(cls)}
      aria-pressed={on}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`group relative mb-4 block w-full rounded-2xl px-4 pb-0 pt-4 text-left transition-colors duration-200 ${
        on ? "bg-md-cyan/15" : "hover:bg-gray-50"
      }`}
    >
      {/* Kiválasztás-jelző pipa */}
      <span
        aria-hidden="true"
        className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          on ? "scale-100 bg-md-cyan" : "scale-90 border-2 border-gray-300 group-hover:border-black"
        }`}
      >
        {on && (
          <svg viewBox="0 0 12 10" className="h-3 w-3.5">
            <path d="M1 5l3 3 7-7" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div className="pr-10 text-lg font-bold text-black sm:text-xl">{cls.time}</div>
      <div className="mb-4 mt-1 pr-10 text-base text-gray-600 sm:text-lg">{cls.title}</div>
      <div className={`h-[3px] w-full transition-colors ${on ? "bg-md-cyan" : "bg-black"}`} />
    </motion.button>
  );
}

function DayColumn({ room, column }: { room: Room; column: Room["columns"][number] }) {
  return (
    <div>
      {/* Fekete nap-fejléc, fehér betűvel */}
      <div className="mb-6 rounded-2xl bg-black py-4 text-center shadow-[0_6px_20px_rgba(0,0,0,0.18)] sm:py-5">
        <h3 className="text-2xl text-white sm:text-3xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {column.heading}
        </h3>
      </div>
      <div>
        {column.classes.map((c, i) => (
          <ScheduleItem key={c.id} cls={{ ...c, room: room.name }} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Orarend({ rooms, hint }: { rooms: Room[]; hint: string }) {
  const [activeId, setActiveId] = useState(rooms[0]?.id ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { selected, remove } = useClassSelection();
  const room = rooms.find((r) => r.id === activeId) ?? rooms[0];
  const countFor = (name: string) => selected.filter((c) => c.room === name).length;

  return (
    <section
      id="orarend"
      className="relative z-30 scroll-mt-24 bg-white px-4 py-16 sm:py-24"
      // oldalra levágjuk (nincs vízszintes görgetés), de felfelé/lefelé a pöttyök átlóghatnak a szomszéd szekciókba
      style={{ overflowX: "clip", overflowY: "visible" }}
    >
      {/* dekoratív pöttyök — átlósan: bal felső és jobb alsó sarok */}
      <HalftoneDots size={260} zIndex={0} style={{ top: -110, left: -120 }} />
      <HalftoneDots size={260} zIndex={0} style={{ bottom: 20, right: -120 }} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-6xl"
      >
        {/* Tabok + cím-doboz */}
        <div className="relative">
          {rooms.length > 1 && (
            <div className="relative z-20 pl-6 sm:pl-10">
              <div className="inline-flex gap-[2px] rounded-t-[18px] bg-[#a6a6a6] p-[2px] pb-0">
                {rooms.map((r) => {
                  const active = room?.id === r.id;
                  const n = countFor(r.name);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setActiveId(r.id)}
                      className={`inline-flex items-center gap-2 rounded-t-[16px] px-6 py-2.5 text-sm font-bold transition-colors duration-200 sm:px-8 sm:text-base ${
                        active ? "bg-white text-black shadow-[0_3px_10px_rgba(0,0,0,0.22)]" : "text-white"
                      }`}
                    >
                      {r.name}
                      {n > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-md-cyan px-1.5 text-[11px] font-extrabold text-black">
                          {n}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fehér cím-doboz, fekete felirattal */}
          <div className="relative z-0 rounded-[1.75rem] border border-gray-200 bg-white px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:py-6">
            <h2 className="section-title text-center text-3xl tracking-wide text-black sm:text-4xl">ÓRAREND</h2>
            {hint && (
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-widest text-gray-500 sm:text-sm">{hint}</p>
            )}
          </div>
        </div>

        {/* Nap-oszlopok */}
        {room && (
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className={`mt-10 grid grid-cols-1 gap-6 sm:mt-12 lg:gap-10 ${MD_COLS[room.columns.length] ?? MD_COLS[3]}`}
            >
              {room.columns.map((col, i) => (
                <DayColumn key={i} room={room} column={col} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Kiválasztás-összegző */}
        <div
          id="selection-bar"
          className="mt-10 flex flex-col gap-5 rounded-[1.75rem] bg-black px-6 py-6 text-white sm:px-8 md:flex-row md:items-center"
        >
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold">
              {selected.length === 0 ? "Még nem választottál órát" : `${selected.length} óra kiválasztva`}
            </div>
            <div className="mt-1 text-sm text-white/60">
              {selected.length === 0 ? "Kattints egy órára az órarendben" : "Többet is választhatsz, vagy vedd le a chipről"}
            </div>
            {selected.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.map((c) => (
                  <SelectionChip key={c.id} item={c} dark onRemove={remove} />
                ))}
              </div>
            )}
          </div>
          <a
            href="#jelentkezes"
            className="shrink-0 rounded-xl bg-md-cyan px-6 py-3.5 text-center text-xs font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-white"
          >
            Tovább a jelentkezéshez
          </a>
        </div>
      </motion.div>
    </section>
  );
}
