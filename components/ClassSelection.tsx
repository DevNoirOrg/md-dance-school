"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ClassItem } from "@/lib/content-types";

/**
 * Közös állapot az Órarend és a Jelentkezés között (az UC oldal mintájára):
 * az órarendben kiválasztott órák chipként megjelennek az órarend alatt,
 * a mobil lebegő sávban és a jelentkezési űrlap tetején is.
 */
export type SelectedClass = ClassItem & { room: string };

type Ctx = {
  selected: SelectedClass[];
  isSelected: (id: string) => boolean;
  toggle: (item: SelectedClass) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const ClassSelectionContext = createContext<Ctx | null>(null);

export function ClassSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedClass[]>([]);

  const isSelected = useCallback((id: string) => selected.some((c) => c.id === id), [selected]);
  const toggle = useCallback((item: SelectedClass) => {
    setSelected((prev) =>
      prev.some((c) => c.id === item.id) ? prev.filter((c) => c.id !== item.id) : [...prev, item],
    );
  }, []);
  const remove = useCallback((id: string) => setSelected((prev) => prev.filter((c) => c.id !== id)), []);
  const clear = useCallback(() => setSelected([]), []);

  const value = useMemo(() => ({ selected, isSelected, toggle, remove, clear }), [selected, isSelected, toggle, remove, clear]);
  return <ClassSelectionContext.Provider value={value}>{children}</ClassSelectionContext.Provider>;
}

export function useClassSelection(): Ctx {
  const ctx = useContext(ClassSelectionContext);
  if (!ctx) throw new Error("useClassSelection: hiányzik a ClassSelectionProvider");
  return ctx;
}

/**
 * Mobil lebegő sáv (csak telefonon): ha van kiválasztott óra, alul megjelenik
 * a darabszámmal és egy „Jelentkezem” gombbal. Elbújik, amikor az órarend alatti
 * összegző vagy maga a jelentkezési szekció látszik.
 */
export function SelectionDock() {
  const { selected } = useClassSelection();
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
        setCovered(visible.size > 0);
      },
      { threshold: 0.12 },
    );
    ["jelentkezes", "selection-bar"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const show = selected.length > 0 && !covered;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-3 transition-all duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/95 px-5 py-4 shadow-2xl backdrop-blur">
        <span className="text-sm font-bold text-white">{selected.length} óra kiválasztva</span>
        <a
          href="#jelentkezes"
          className="ml-auto shrink-0 rounded-xl bg-md-cyan px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-black"
        >
          Jelentkezem
        </a>
      </div>
    </div>
  );
}

/** Kiválasztott óra chip, × gombbal. `dark`: fekete háttéren (órarend alatt / mobil sáv). */
export function SelectionChip({
  item,
  dark = false,
  onRemove,
}: {
  item: SelectedClass;
  dark?: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <span
      title={item.full}
      className={`inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-1.5 text-[13px] font-semibold ${
        dark ? "border border-white/20 bg-white/10 text-white" : "border border-md-cyan/50 bg-md-cyan/15 text-black"
      }`}
    >
      {item.chip}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`${item.chip} eltávolítása`}
        className={`flex h-5 w-5 items-center justify-center rounded-full text-base leading-none transition-colors ${
          dark ? "hover:bg-white/20" : "hover:bg-black/10"
        }`}
      >
        ×
      </button>
    </span>
  );
}
