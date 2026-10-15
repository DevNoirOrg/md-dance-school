"use client";

import { useEffect, useRef, useState } from "react";

export default function BookingDecisionPage() {
  const [input, setInput] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sendingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInput({ token: params.get("token"), action: params.get("action"), slot: params.get("slot") });
  }, []);

  const labels = {
    approve: "Idősáv jóváhagyása",
    reject: "Idősáv elutasítása",
    "approve-all": "Összes függő idősáv jóváhagyása",
  };
  const label = input && labels[input.action];

  const submit = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/studio-bookings/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || !Number.isInteger(result.changed)) {
        setError(result.error || "Nem sikerült menteni a döntést.");
        return;
      }
      setMessage(result.changed === 0
        ? "Az időpontokról már született döntés. Nem történt új módosítás."
        : input.action === "reject"
          ? "Az időpontot elutasítottad, ismét szabad a naptárban."
          : `${result.changed} időpont jóváhagyva. A naptárban „Foglalás alatt” állapotban jelenik meg, még nem végleges foglalás.`);
    } catch (error) {
      console.error("Booking decision request failed.", { name: error.name });
      setError("A mentés eredménye nem ellenőrizhető. Próbáld újra; a már lezárt időpontok változatlanok maradnak.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-5">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="mb-3 text-sm font-bold text-[#087c81]">MD Dance School</p>
        <h1 className="section-title text-3xl">{label || "Foglalási döntés"}</h1>
        {message ? <p role="status" className="my-6 text-gray-700">{message}</p> : (
          <>
            <p className="my-6 text-sm text-gray-600">
              Erősítsd meg a döntést. Csak a még jóváhagyásra váró időpontok
              változnak; a korábbi jóváhagyások és elutasítások megmaradnak.
            </p>
            {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
            {label && input.token ? (
              <button type="button" disabled={sending} onClick={submit}
                className="w-full rounded-xl bg-[#40CFD5] p-3 font-bold disabled:opacity-50">
                {sending ? "Mentés…" : `${label} megerősítése`}
              </button>
            ) : <p role="alert" className="text-red-700">Hiányzó vagy érvénytelen hivatkozás.</p>}
          </>
        )}
        <a href="/studio-berles" className="mt-6 inline-block font-bold text-[#087c81]">Vissza a naptárhoz</a>
      </section>
    </main>
  );
}
