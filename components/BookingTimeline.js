"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { endHour, formatBookingHour, overlaps } from "@/lib/studio-booking";

const starts = Array.from({ length: 28 }, (_, index) => 8 + index / 2);
const rowHeight = 32;

export default function BookingTimeline({
  room, date, selectedSlots, storedSlots, availabilityReady, now, onSelect, onResize, onRemove,
}) {
  const [preview, setPreview] = useState(null);
  const selected = selectedSlots.filter((slot) => slot.room === room && slot.date === date);
  const stored = storedSlots.filter((slot) => slot.room === room && slot.date === date);
  const isPast = (hour) => new Date(`${date}T${formatBookingHour(hour)}:00`) <= now;
  const sameStart = (a, b) => a.room === b.room && a.date === b.date && a.hour === b.hour;
  const allowed = (slot, original) => availabilityReady && slot.hour >= 8 && !isPast(slot.hour) &&
    endHour(slot) <= 22 && slot.durationMinutes >= 60 &&
    !stored.some((other) => overlaps(slot, other)) &&
    !selected.some((other) => (!original || !sameStart(other, original)) && overlaps(slot, other));

  const styleFor = (slot) => ({
    top: (slot.hour - 8) * 2 * rowHeight,
    height: (endHour(slot) - slot.hour) * 2 * rowHeight,
  });
  const rangeLabel = (slot) => `${formatBookingHour(slot.hour)}–${formatBookingHour(endHour(slot))}`;

  return (
    <div data-timeline-date={date}
      className="relative isolate select-none border-x border-b border-gray-200 bg-white"
      style={{ height: starts.length * rowHeight }}
      onPointerLeave={() => setPreview(null)}
    >
      {starts.map((hour) => {
        const slot = { room, date, hour, durationMinutes: 60 };
        const available = allowed(slot);
        return (
          <button key={hour} type="button" data-booking-hour={hour}
            aria-label={`${room}, ${date}, ${rangeLabel(slot)} – ${available ? "szabad idősáv kiválasztása" : "nem választható"}`}
            disabled={!available}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setPreview(available ? slot : null);
            }}
            onFocus={() => setPreview(available ? slot : null)}
            onBlur={() => setPreview(null)}
            onClick={() => {
              if (available) {
                setPreview(null);
                onSelect(slot);
              }
            }}
            className={`absolute inset-x-0 flex w-full scroll-mt-28 items-start border-t px-2 pt-1 text-left text-[10px] focus-visible:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087c81] ${
              isPast(hour) ? "bg-gray-100 text-gray-400" : "text-gray-500"
            } ${Number.isInteger(hour) ? "border-gray-300" : "border-dashed border-gray-200"}`}
            style={{ top: (hour - 8) * 2 * rowHeight, height: rowHeight }}
          >
            {formatBookingHour(hour)}
          </button>
        );
      })}
      {stored.map((slot) => (
        <div key={`${slot.hour}-${slot.status}`} style={styleFor(slot)}
          role="img" aria-label={`${room}, ${date}, ${rangeLabel(slot)} – ${slot.status === "pending" ? "jóváhagyásra vár" : "foglalás alatt"}`}
          className={`pointer-events-none absolute inset-x-0 z-10 border px-2 py-1 text-xs font-bold ${
            slot.status === "pending" ? "border-amber-400 bg-amber-100 text-amber-900" : "border-blue-400 bg-blue-100 text-blue-900"
          }`}
        >
          {rangeLabel(slot)}
        </div>
      ))}
      {selected.map((slot) => {
        const earlier = { ...slot, hour: slot.hour - 0.5, durationMinutes: (slot.durationMinutes ?? 60) + 30 };
        const later = { ...slot, durationMinutes: (slot.durationMinutes ?? 60) + 30 };
        return (
        <div key={slot.hour} style={styleFor(slot)}
          className="absolute inset-x-0 z-20 border border-[#087c81] bg-[#40CFD5]/25 text-black">
          {/* A kijelölésre kattintva nem törlődik; törölni csak a sarokban lévő X-szel lehet. */}
          <div className="flex h-full w-full items-center justify-center px-1 text-[11px] font-extrabold text-[#065f63]">
            {rangeLabel(slot)}
          </div>
          <button type="button" onClick={() => onRemove(slot)}
            aria-label={`${room}, ${date}, ${rangeLabel(slot)} kijelölésének törlése`}
            title="Kijelölés törlése"
            className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm transition-colors hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black"
          ><X size={14} strokeWidth={2.75} aria-hidden="true" /></button>
          <button type="button"
            aria-label={`${room}, ${date}, ${rangeLabel(slot)} kezdése fél órával korábban`}
            title="Kezdés fél órával korábban"
            disabled={!allowed(earlier, slot)}
            onClick={() => { if (allowed(earlier, slot)) onResize(slot, earlier); }}
            className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded bg-white/70 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          ><ChevronUp size={20} aria-hidden="true" /></button>
          <button type="button"
            aria-label={`${room}, ${date}, ${rangeLabel(slot)} befejezése fél órával később`}
            title="Befejezés fél órával később"
            disabled={!allowed(later, slot)}
            onClick={() => { if (allowed(later, slot)) onResize(slot, later); }}
            className="absolute bottom-0 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded bg-white/70 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          ><ChevronDown size={20} aria-hidden="true" /></button>
        </div>
        );
      })}
      {preview && allowed(preview) && (
        <div data-booking-preview style={styleFor(preview)}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-30 border-2 border-dashed border-[#087c81] bg-[#40CFD5]/25"
        />
      )}
    </div>
  );
}
