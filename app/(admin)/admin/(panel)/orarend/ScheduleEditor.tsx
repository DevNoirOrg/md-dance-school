"use client";

import { useState } from "react";
import { saveSchedule } from "@/app/actions/admin";
import LanguageEditor from "@/components/admin/LanguageEditor";
import { Button, Field, IconButton, PageHeader, SaveBar, inputCls, isSame, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { Room } from "@/lib/content-types";

/*
  Órarend-szerkesztő (az Under Cover admin mintájára): termenként 1–4 oszlop
  (pl. „Hétfő - Szerda”), az oszlopcímek átírhatók. Az órakártyák húzással
  (oszlopon belül és oszlopok között) vagy a nyilakkal rendezhetők. Mentéskor
  az egész órarend egyben kerül az oldalra.
*/

type EClass = { key: string; id?: string; time: string; title: string };
type Cols = EClass[][];
const MAX_COLS = 4;
const MD_COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" };
type ERoom = {
  key: string;
  id?: string;
  name: string;
  shortName: string;
  headings: string[];
  columns: Cols;
  en?: Room["en"];
};

let seq = 0;
const k = () => `n${++seq}`;

function fromRooms(rooms: Room[]): ERoom[] {
  return rooms.map((r) => ({
    key: r.id,
    id: r.id,
    name: r.name,
    shortName: r.shortName,
    headings: r.columns.map((c) => c.heading),
    columns: r.columns.map((col) => col.classes.map((c) => ({ key: c.id, id: c.id, time: c.time, title: c.title }))),
    en: r.en,
  }));
}

function toPayload(hint: string, englishHint: string, rooms: ERoom[]) {
  return {
    hint,
    en: { hint: englishHint },
    rooms: rooms.map((r) => ({
      id: r.id,
      name: r.name,
      shortName: r.shortName,
      headings: r.headings,
      en: r.en,
      columns: r.columns.map((col) => col.map(({ id, time, title }) => ({ id, time, title }))),
    })),
  };
}

type DragRef = { col: number; index: number } | null;

export default function ScheduleEditor({ initial, initialHint, initialEnglishHint, info }: { initial: Room[]; initialHint: string; initialEnglishHint: string; info: EditInfo }) {
  const [saved, setSaved] = useState<ERoom[]>(() => fromRooms(initial));
  const [rooms, setRooms] = useState<ERoom[]>(() => fromRooms(initial));
  const [savedHint, setSavedHint] = useState(initialHint);
  const [hint, setHint] = useState(initialHint);
  const [savedEnglishHint, setSavedEnglishHint] = useState(initialEnglishHint);
  const [englishHint, setEnglishHint] = useState(initialEnglishHint);
  const [activeKey, setActiveKey] = useState<string>(() => rooms[0]?.key ?? "");
  const [drag, setDrag] = useState<DragRef>(null);
  const [dropCol, setDropCol] = useState<number | null>(null);
  const { pending, status, save } = useSaver();

  const languageValue = { hint, rooms, en: { hint: englishHint, rooms: rooms.map((item) => item.en ?? {}) } };
  const updateLanguageValue = (value: typeof languageValue) => {
    setHint(value.hint);
    setEnglishHint(value.en.hint ?? "");
    setRooms(value.rooms.map((item, index) => ({ ...item, en: value.en.rooms?.[index] as Room["en"] })));
  };
  const dirty = !isSame(toPayload(hint, englishHint, rooms), toPayload(savedHint, savedEnglishHint, saved));

  return (
    <div>
      <PageHeader
        title="Órarend"
        description="Termenként (fülenként) 1–4 oszlop (napok). Az órákat húzással vagy a nyilakkal rendezheted, oszlopok között is. A kiválasztott óra chipje magától készül: „Rövid név · oszlopcím kezdés”."
      />

      <LanguageEditor value={languageValue} onChange={updateLanguageValue}>
      {(x, setX, locale) => {
        const hint = x.hint;
        const rooms = x.rooms;
        const setHint = (next: string) => setX({ ...x, hint: next });
        const setRooms = (next: ERoom[] | ((previous: ERoom[]) => ERoom[])) =>
          setX({ ...x, rooms: typeof next === "function" ? next(rooms) : next });
        const ri = Math.max(0, rooms.findIndex((candidate) => candidate.key === activeKey));
        const room = rooms[ri];
        const updateRoom = (patch: Partial<ERoom> | ((current: ERoom) => ERoom)) =>
          setRooms((previous) => previous.map((candidate, index) =>
            index === ri ? (typeof patch === "function" ? patch(candidate) : { ...candidate, ...patch }) : candidate,
          ));
        const updateCols = (update: (columns: Cols) => Cols) =>
          updateRoom((current) => ({ ...current, columns: update(current.columns.map((column) => [...column])) }));
        const setColumnCount = (count: number) => {
          if (!room || count === room.columns.length || locale === "en") return;
          if (count < room.columns.length) {
            const moved = room.columns.slice(count).flat().length;
            if (moved && !window.confirm(`A megszűnő oszlop(ok) ${moved} órája átkerül a(z) ${count}. oszlopba. Folytatod?`)) return;
          }
          updateRoom((current) => {
            if (count > current.columns.length) {
              const add = count - current.columns.length;
              return {
                ...current,
                headings: [...current.headings, ...Array<string>(add).fill("")],
                columns: [...current.columns, ...Array.from({ length: add }, (): EClass[] => [])],
              };
            }
            const columns = current.columns.slice(0, count).map((column) => [...column]);
            columns[count - 1].push(...current.columns.slice(count).flat());
            return { ...current, headings: current.headings.slice(0, count), columns };
          });
        };
        const moveClass = (from: { col: number; index: number }, to: { col: number; index: number }) => {
          if (locale === "en") return;
          updateCols((columns) => {
            const [item] = columns[from.col].splice(from.index, 1);
            let index = to.index;
            if (from.col === to.col && from.index < to.index) index -= 1;
            columns[to.col].splice(Math.max(0, Math.min(index, columns[to.col].length)), 0, item);
            return columns;
          });
        };
        const setClass = (column: number, index: number, patch: Partial<EClass>) =>
          updateCols((columns) => {
            columns[column][index] = { ...columns[column][index], ...patch };
            return columns;
          });
        const addRoom = () => {
          if (locale === "en") return;
          const nextRoom: ERoom = {
            key: k(),
            name: "Új terem",
            shortName: "Új",
            headings: [...(room?.headings ?? ["Hétfő - Szerda", "Kedd - Csütörtök", "Péntek"])],
            columns: (room?.headings ?? ["", "", ""]).map((): EClass[] => []),
          };
          setRooms((previous) => [...previous, nextRoom]);
          setActiveKey(nextRoom.key);
        };
        const deleteRoom = () => {
          if (!room || locale === "en") return;
          const count = room.columns.flat().length;
          if (!window.confirm(`Biztosan törlöd a(z) „${room.name}” termet${count ? ` és a benne lévő ${count} órát` : ""}? (Mentéskor lesz végleges.)`)) return;
          const next = rooms.filter((_, index) => index !== ri);
          setRooms(next);
          setActiveKey(next[0]?.key ?? "");
        };
        return (
      <>
      <div className="mb-5 rounded-[1.75rem] bg-white p-5 shadow-[0_10px_30px_-18px_rgba(13,13,13,0.35)] md:p-6">
        <Field label="Felirat az ÓRAREND cím alatt" htmlFor="hint">
          <input id="hint" className={inputCls} value={hint} onChange={(e) => setHint(e.target.value)} />
        </Field>
      </div>

      {/* Terem-fülek */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {rooms.map((r, roomIndex) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setActiveKey(r.key)}
            className={`rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-colors ${
              r.key === room?.key ? "bg-ink text-white" : "bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {r.name || languageValue.rooms[roomIndex]?.name || "Névtelen terem"}
            <span className="ml-2 rounded-full bg-md-pale px-1.5 py-0.5 text-[10px] text-md-teal">{r.columns.flat().length}</span>
          </button>
        ))}
        {rooms.length < 6 && (
          <Button variant="ghost" onClick={addRoom} disabled={locale === "en"}>
            + Új terem
          </Button>
        )}
      </div>

      {room ? (
        <>
          <div className="mb-5 grid gap-4 rounded-[1.75rem] bg-white p-5 shadow-[0_10px_30px_-18px_rgba(13,13,13,0.35)] md:grid-cols-[1fr_1fr_auto_auto] md:items-end md:p-6">
            <Field label="Terem neve" htmlFor="rname" hint="A terem-fülön és a jelentkezésben.">
              <input id="rname" className={inputCls} value={room.name} onChange={(e) => updateRoom({ name: e.target.value })} />
            </Field>
            <Field label="Rövid név" htmlFor="rshort" hint="A kiválasztás-chip elején, pl. „Nagy”.">
              <input id="rshort" className={inputCls} value={room.shortName} onChange={(e) => updateRoom({ shortName: e.target.value })} />
            </Field>
            <Field label="Oszlopok" hint="Napok száma">
              <div className="flex gap-1 rounded-full bg-slate-100 p-1">
                {Array.from({ length: MAX_COLS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={locale === "en"}
                    aria-label={`${n} oszlop`}
                    aria-pressed={room.columns.length === n}
                    onClick={() => setColumnCount(n)}
                    className={`h-9 w-9 rounded-full text-sm font-extrabold transition-colors ${
                      room.columns.length === n ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
            <Button variant="danger" onClick={deleteRoom} disabled={rooms.length <= 1 || locale === "en"}>
              Terem törlése
            </Button>
          </div>

          <div className="rounded-[2rem] bg-ink p-3 md:p-4">
            <div className={`grid gap-3 ${MD_COLS[room.columns.length] ?? MD_COLS[3]}`}>
              {room.columns.map((col, ci) => (
                <div
                  key={ci}
                  onDragOver={(e) => {
                    if (locale === "en") return;
                    e.preventDefault();
                    setDropCol(ci);
                  }}
                  onDragLeave={() => setDropCol((c) => (c === ci ? null : c))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag) moveClass(drag, { col: ci, index: room.columns[ci].length });
                    setDrag(null);
                    setDropCol(null);
                  }}
                  className={`flex flex-col gap-3 rounded-[1.5rem] p-3 transition-colors ${
                    dropCol === ci && drag ? "bg-white/35" : "bg-white/15"
                  }`}
                >
                  <input
                    aria-label={`${ci + 1}. oszlop címe`}
                    className="w-full rounded-xl border-2 border-white/30 bg-white/20 px-3 py-2 text-center text-xs font-extrabold uppercase tracking-widest text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                    placeholder="pl. Hétfő - Szerda"
                    value={room.headings[ci] ?? ""}
                    onChange={(e) =>
                      updateRoom((r) => {
                        const headings = [...r.headings];
                        headings[ci] = e.target.value;
                        return { ...r, headings };
                      })
                    }
                  />

                  {col.map((c, i) => (
                    <div
                      key={c.key}
                      draggable={locale === "hu"}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDrag({ col: ci, index: i });
                      }}
                      onDragEnd={() => {
                        setDrag(null);
                        setDropCol(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (drag) moveClass(drag, { col: ci, index: i });
                        setDrag(null);
                        setDropCol(null);
                      }}
                      className={`rounded-2xl bg-white/80 p-3 shadow-sm transition-opacity ${
                        drag?.col === ci && drag.index === i ? "opacity-40" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="cursor-grab select-none text-slate-400" title="Húzd az átrendezéshez">
                          ⋮⋮
                        </span>
                        <div className="flex">
                          <IconButton label="Előző oszlopba" disabled={ci === 0 || locale === "en"} onClick={() => moveClass({ col: ci, index: i }, { col: ci - 1, index: room.columns[ci - 1].length })}>
                            ←
                          </IconButton>
                          <IconButton label="Feljebb" disabled={i === 0 || locale === "en"} onClick={() => moveClass({ col: ci, index: i }, { col: ci, index: i - 1 })}>
                            ↑
                          </IconButton>
                          <IconButton label="Lejjebb" disabled={i === col.length - 1 || locale === "en"} onClick={() => moveClass({ col: ci, index: i }, { col: ci, index: i + 2 })}>
                            ↓
                          </IconButton>
                          <IconButton label="Következő oszlopba" disabled={ci === room.columns.length - 1 || locale === "en"} onClick={() => moveClass({ col: ci, index: i }, { col: ci + 1, index: room.columns[ci + 1].length })}>
                            →
                          </IconButton>
                          <IconButton
                            label="Óra törlése"
                            disabled={locale === "en"}
                            className="hover:!bg-red-50 hover:!text-red-600"
                            onClick={() =>
                              updateCols((cols) => {
                                cols[ci].splice(i, 1);
                                return cols;
                              })
                            }
                          >
                            ✕
                          </IconButton>
                        </div>
                      </div>
                      <input
                        aria-label="Időpont"
                        className="w-full rounded-lg border-2 border-transparent bg-white px-2.5 py-1.5 text-[15px] font-bold text-ink placeholder:text-slate-300 focus:border-md-cyan focus:outline-none"
                        placeholder="18:30-20:00"
                        value={c.time}
                        disabled={locale === "en"}
                        onChange={(e) => setClass(ci, i, { time: e.target.value })}
                      />
                      <input
                        aria-label="Óra neve"
                        className="mt-1.5 w-full rounded-lg border-2 border-transparent bg-white px-2.5 py-1.5 text-sm font-semibold text-ink/80 placeholder:text-slate-300 focus:border-md-cyan focus:outline-none"
                        placeholder="Hip-hop Dalmával"
                        value={c.title}
                        onChange={(e) => setClass(ci, i, { title: e.target.value })}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    disabled={locale === "en"}
                    onClick={() =>
                      updateCols((cols) => {
                        cols[ci].push({ key: k(), time: "", title: "" });
                        return cols;
                      })
                    }
                    className="rounded-2xl border-2 border-dashed border-white/40 py-3 text-xs font-extrabold uppercase tracking-widest text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                  >
                    + Új óra
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">Nincs terem. Adj hozzá egyet!</p>
      )}
      </>
        );
      }}
      </LanguageEditor>

      <SaveBar
        dirty={dirty}
        pending={pending}
        status={status}
        info={info}
        onReset={() => {
          setHint(savedHint);
          setEnglishHint(savedEnglishHint);
          setRooms(saved);
          setActiveKey(saved[0]?.key ?? "");
        }}
        onSave={() =>
          save(() => saveSchedule(toPayload(hint, englishHint, rooms)), undefined, () => {
            setSaved(rooms);
            setSavedHint(hint);
            setSavedEnglishHint(englishHint);
          })
        }
      />
    </div>
  );
}
