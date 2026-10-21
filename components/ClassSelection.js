'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Közös állapot az Órarend és a Jelentkezés között (az UC oldal mintájára):
 * az órarendben kiválasztott órák chipként megjelennek az órarend alatt,
 * a mobil lebegő sávban és a jelentkezési űrlap tetején is.
 *
 * Egy óra: { id, room, day, time, title, chip, full }
 */
const ClassSelectionContext = createContext(null)

export function ClassSelectionProvider({ children }) {
  // id -> óra objektum, a kiválasztás sorrendjében
  const [selected, setSelected] = useState([])

  const isSelected = useCallback((id) => selected.some((c) => c.id === id), [selected])

  const toggle = useCallback((item) => {
    setSelected((prev) =>
      prev.some((c) => c.id === item.id) ? prev.filter((c) => c.id !== item.id) : [...prev, item],
    )
  }, [])

  const remove = useCallback((id) => {
    setSelected((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const value = useMemo(
    () => ({ selected, isSelected, toggle, remove, clear }),
    [selected, isSelected, toggle, remove, clear],
  )

  return <ClassSelectionContext.Provider value={value}>{children}</ClassSelectionContext.Provider>
}

export function useClassSelection() {
  const ctx = useContext(ClassSelectionContext)
  if (!ctx) throw new Error('useClassSelection: hiányzik a ClassSelectionProvider')
  return ctx
}

/**
 * Mobil lebegő sáv (csak telefonon): ha van kiválasztott óra, alul megjelenik
 * a darabszámmal és egy „Jelentkezem” gombbal. Elbújik, amikor az órarend alatti
 * összegző vagy maga a jelentkezési szekció látszik.
 */
export function SelectionDock() {
  const { selected } = useClassSelection()
  const [covered, setCovered] = useState(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)))
        setCovered(visible.size > 0)
      },
      { threshold: 0.12 },
    )
    ;['jelentkezes', 'selection-bar'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const show = selected.length > 0 && !covered
  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-3 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="rounded-2xl bg-black/95 backdrop-blur px-5 py-4 flex items-center gap-4 shadow-2xl border border-white/10">
        <span className="text-white font-bold text-sm">{selected.length} óra kiválasztva</span>
        <a
          href="#jelentkezes"
          className="ml-auto shrink-0 bg-[#40CFD5] text-black px-5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest"
        >
          Jelentkezem
        </a>
      </div>
    </div>
  )
}

/** Kiválasztott óra chip, × gombbal. `dark`: fekete háttéren (órarend alatt / mobil sáv). */
export function SelectionChip({ item, dark = false, onRemove }) {
  return (
    <span
      title={item.full}
      className={`inline-flex items-center gap-1.5 rounded-full pl-3.5 pr-1.5 py-1.5 text-[13px] font-semibold ${
        dark ? 'bg-white/10 text-white border border-white/20' : 'bg-[#40CFD5]/15 text-black border border-[#40CFD5]/50'
      }`}
    >
      {item.chip}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`${item.chip} eltávolítása`}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-base leading-none transition-colors ${
          dark ? 'hover:bg-white/20' : 'hover:bg-black/10'
        }`}
      >
        ×
      </button>
    </span>
  )
}
