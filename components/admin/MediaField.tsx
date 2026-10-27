"use client";

/* eslint-disable @next/next/no-img-element -- admin előnézet */
import { useRef, useState } from "react";
import { createUploadTarget } from "@/app/actions/admin";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "./ui";

/*
  Kép / videó feltöltése közvetlenül a Supabase Storage-ba.
   - Kép: a böngésző feltöltés előtt WebP-re alakítja és lekicsinyíti
     (max. 1600 px), így a nagy telefonos fotók sem lassítják az oldalt.
   - Videó: MP4, legfeljebb 50 MB.
  A mező értéke a fájl útvonala; mentéskor kerül az adatbázisba.
*/

const MAX_IMAGE_SIDE = 1600;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_INPUT_BYTES = 25 * 1024 * 1024;

/** Kép betöltése rajzoláshoz. Az SVG-t (pl. logók) a createImageBitmap nem mindenhol tudja → <img>-en át. */
async function loadImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    // az SVG-nek lehet, hogy nincs saját mérete → 1200 px széles alapértelmezés
    const width = img.naturalWidth || 1200;
    const height = img.naturalHeight || 600;
    return { source: img, width, height, done: () => URL.revokeObjectURL(url) };
  }
}

async function toWebp(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("A böngésző nem tudja feldolgozni a képet.");
  ctx.drawImage(img.source, 0, 0, w, h);
  img.done();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
  if (!blob) throw new Error("Nem sikerült a képet átalakítani.");
  return blob;
}

/**
 * Fájl feltöltése a Storage-ba (kép → WebP, max. 1600 px; videó → MP4, max. 50 MB).
 * Visszaadja a fájl útvonalát (pl. "images/2026/….webp"). Hiba esetén kivételt dob.
 */
export async function uploadMedia(kind: "image" | "video", file: File): Promise<string> {
  let blob: Blob;
  let contentType: "image/webp" | "video/mp4";
  if (kind === "image") {
    if (!file.type.startsWith("image/")) throw new Error("Ez nem képfájl.");
    if (file.size > MAX_IMAGE_INPUT_BYTES) throw new Error("A kép túl nagy (max. 25 MB).");
    blob = await toWebp(file);
    contentType = "image/webp";
  } else {
    if (file.type !== "video/mp4") throw new Error("Csak MP4 videó tölthető fel.");
    if (file.size > MAX_VIDEO_BYTES) throw new Error("A videó túl nagy (max. 50 MB). Tömörítsd, vagy vágd rövidebbre.");
    blob = file;
    contentType = "video/mp4";
  }
  const target = await createUploadTarget({ kind, contentType });
  if (!target.ok) throw new Error(target.error);
  const { error: upErr } = await supabaseBrowser()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(target.path, target.token, blob, { contentType });
  if (upErr) throw new Error("A feltöltés nem sikerült: " + upErr.message);
  return target.path;
}

export default function MediaField({
  kind,
  value,
  onChange,
  allowRemove = true,
  aspectClass = "aspect-[4/3]",
  emptyLabel,
}: {
  kind: "image" | "video";
  value: string | null;
  onChange: (path: string | null) => void;
  allowRemove?: boolean;
  aspectClass?: string;
  emptyLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      onChange(await uploadMedia(kind, file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba a feltöltés közben.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative w-full max-w-sm ${aspectClass} overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50`}
      >
        {value ? (
          kind === "image" ? (
            <img src={mediaUrl(value)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <video src={mediaUrl(value)} className="absolute inset-0 h-full w-full object-cover" muted loop autoPlay playsInline />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs font-bold uppercase tracking-widest text-slate-300">
            {emptyLabel ?? (kind === "image" ? "Nincs kép" : "Nincs videó")}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs font-extrabold uppercase tracking-widest text-md-teal">
            Feltöltés…
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {value ? "Csere" : kind === "image" ? "Kép feltöltése" : "Videó feltöltése"}
        </Button>
        {allowRemove && value && (
          <Button variant="ghost" onClick={() => onChange(null)} disabled={busy}>
            Eltávolítás
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={kind === "image" ? "image/*" : "video/mp4"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <p className="text-xs text-slate-400">
        {kind === "image"
          ? "Bármilyen kép jó: feltöltéskor automatikusan WebP-re alakul és max. 1600 px-re kicsinyül."
          : "MP4, legfeljebb 50 MB. Álló (9:16) videó a legszebb."}
      </p>
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}

