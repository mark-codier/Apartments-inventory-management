"use client";
import { useState } from "react";
import { seedItems } from '../../../lib/seed/items.seed'

export default function SeedItemsPage() {
  const [status, setStatus] = useState<"idle"|"running"|"done"|"error">("idle");
  const [msg, setMsg] = useState<string>("");

  const run = async () => {
    try {
      setStatus("running");
      await seedItems();
      setStatus("done");
      setMsg("Items wurden erfolgreich in Firestore geschrieben.");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message ?? "Unbekannter Fehler");
      console.error(e);
    }
  };

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-4">Item-Katalog seeden</h1>
      <button
        onClick={run}
        disabled={status==="running"}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {status==="running" ? "Läuft…" : "Seeden"}
      </button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <p className="mt-6 text-gray-500 text-sm">
        Öffne diese Seite nur in Dev/Preview. Danach kannst du sie entfernen.
      </p>
    </main>
  );
}
