"use client";

import { useState, type ReactNode } from "react";
import { Button, IconButton } from "./ui";

/*
  Általános lista-szerkesztő: kártyák egymás alatt, húzással vagy nyilakkal
  rendezhetők, törölhetők, újat lehet hozzáadni. A kártya tartalmát a
  `render` adja (a mezők), az elemet a `set` függvénnyel lehet módosítani.
*/
export default function ListEditor<T>({
  items,
  onChange,
  newItem,
  render,
  title,
  addLabel = "+ Új elem",
  max = 30,
  min = 0,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  render: (item: T, set: (patch: Partial<T>) => void, index: number) => ReactNode;
  /** A kártya fejlécében látszó rövid cím (pl. a név). */
  title?: (item: T, index: number) => ReactNode;
  addLabel?: string;
  max?: number;
  min?: number;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  const set = (i: number) => (patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          onDragOver={(e) => {
            if (drag === null) return;
            e.preventDefault();
            setOver(i);
          }}
          onDrop={() => {
            if (drag !== null) move(drag, i);
            setDrag(null);
            setOver(null);
          }}
          className={`rounded-2xl border-2 p-4 transition-colors ${
            over === i && drag !== null && drag !== i ? "border-md-cyan bg-md-pale/60" : "border-transparent bg-slate-50"
          } ${drag === i ? "opacity-50" : ""}`}
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              draggable
              onDragStart={() => setDrag(i)}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              className="cursor-grab select-none px-1 text-slate-300"
              title="Húzd az átrendezéshez"
            >
              ⋮⋮
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-extrabold uppercase tracking-widest text-slate-400">
              {title ? title(item, i) : `${i + 1}.`}
            </span>
            <IconButton label="Feljebb" onClick={() => move(i, i - 1)} disabled={i === 0}>
              ↑
            </IconButton>
            <IconButton label="Lejjebb" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
              ↓
            </IconButton>
            <IconButton
              label="Törlés"
              disabled={items.length <= min}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="hover:!bg-red-50 hover:!text-red-600"
            >
              ✕
            </IconButton>
          </div>
          {render(item, set(i), i)}
        </div>
      ))}
      {items.length < max && (
        <Button variant="ghost" onClick={() => onChange([...items, newItem()])}>
          {addLabel}
        </Button>
      )}
    </div>
  );
}
