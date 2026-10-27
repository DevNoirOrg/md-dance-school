"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteApplication, saveApplicationNote, setApplicationStatus } from "@/app/actions/admin";
import { Button, Card, EditInfoLine, StatusText, textareaCls, useSaver } from "@/components/admin/ui";

const STATUS_BUTTONS = [
  { id: "uj", label: "Új" },
  { id: "felvettuk", label: "Felvettük" },
  { id: "elutasitva", label: "Elutasítva" },
  { id: "archivalt", label: "Archivált" },
] as const;

export default function ApplicationActions({
  kind,
  id,
  status,
  note,
  email,
  cc,
  statusInfo,
}: {
  kind: "orak" | "tabor";
  id: string;
  status: string;
  note: string;
  email: string;
  cc: string | null;
  statusInfo: { updatedAt: string; updatedBy: string } | null;
}) {
  const router = useRouter();
  const [noteText, setNoteText] = useState(note);
  const statusSaver = useSaver();
  const noteSaver = useSaver();

  return (
    <div className="space-y-6">
      <Card title="Státusz">
        <div className="grid grid-cols-2 gap-2">
          {STATUS_BUTTONS.map((s) => (
            <Button
              key={s.id}
              variant={s.id === status ? "primary" : "secondary"}
              disabled={statusSaver.pending}
              onClick={() => statusSaver.save(() => setApplicationStatus(kind, id, s.id), "Státusz frissítve.")}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <StatusText status={statusSaver.status} />
          {!statusSaver.status && <EditInfoLine info={statusInfo} />}
        </div>
        <a
          href={`mailto:${email}${cc ? `?cc=${encodeURIComponent(cc)}` : ""}`}
          className="mt-5 block rounded-xl bg-ink px-4 py-3 text-center text-xs font-extrabold uppercase tracking-widest text-white hover:bg-md-teal"
        >
          Válasz e-mailben
        </a>
      </Card>

      <Card title="Belső megjegyzés" description="Csak az adminok látják.">
        <textarea rows={4} className={textareaCls} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="primary"
            disabled={noteSaver.pending || noteText === note}
            onClick={() => noteSaver.save(() => saveApplicationNote(kind, id, noteText), "Megjegyzés mentve.")}
          >
            Mentés
          </Button>
          <StatusText status={noteSaver.status} />
        </div>
      </Card>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          if (!window.confirm("Biztosan véglegesen törlöd ezt a jelentkezést?")) return;
          statusSaver.save(
            () => deleteApplication(kind, id),
            "Törölve.",
            () => router.push(`/admin/jelentkezesek${kind === "tabor" ? "?tipus=tabor" : ""}`),
          );
        }}
      >
        Jelentkezés törlése
      </Button>
    </div>
  );
}
