// src/app/apartments/[id]/ApartmentClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ApartmentType, Inventory, apartmentStandards } from "@/lib/inventoryData";

type ApplianceStatus = { works: boolean; lastChecked: string; note?: string };

// Приборы (для переключателя "Funktioniert") — подгони под ключи стандарта, если нужно
const applianceItems = new Set<string>(["Fernseher", "Klimaanlage", "Kühlschrank", "Safe"]);

export default function ApartmentClient({ id, type }: { id: string; type: ApartmentType; }) {
  const router = useRouter();
  const standard = apartmentStandards[type];

  const [current, setCurrent] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistenz-Felder
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [appliancesStatus, setAppliancesStatus] = useState<Record<string, ApplianceStatus>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const ref = doc(db, "apartments", id);
      const snap = await getDoc(ref);
      const d = snap.data() ?? {};

      const inv = snap.exists() ? (d.inventory as Inventory) : ({ ...standard } as Inventory);

      if (alive) {
        setCurrent(inv);
        setDescription((d.description as string) ?? "");
        setNotes((d.notes as string) ?? "");
        setItemNotes((d.itemNotes as Record<string, string>) ?? {});
        setAppliancesStatus((d.appliancesStatus as Record<string, ApplianceStatus>) ?? {});
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, standard]);

  // Partial upsert
  const upsertApartment = async (partial: object) => {
    await setDoc(doc(db, "apartments", id), { ...partial, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const handleChange = (item: string, value: string) => {
    setCurrent((prev) => ({ ...(prev ?? {}), [item]: Number.parseInt(value) || 0 }));
  };

  const saveApartmentNote = async (text: string) => { setNotes(text); await upsertApartment({ notes: text }); };
  const saveApartmentDescription = async (text: string) => { setDescription(text); await upsertApartment({ description: text }); };
  const saveItemNote = async (itemId: string, text: string) => {
    const next = { ...(itemNotes ?? {}), [itemId]: text };
    setItemNotes(next);
    await upsertApartment({ itemNotes: next });
  };
  const setApplianceWorks = async (itemId: string, works: boolean, note?: string) => {
    const next = { ...(appliancesStatus ?? {}), [itemId]: { works, lastChecked: new Date().toISOString(), ...(note ? { note } : {}) } };
    setAppliancesStatus(next);
    await upsertApartment({ appliancesStatus: next });
  };

  const handleSave = async () => {
    try {
      if (!current) return;
      const ref = doc(db, "apartments", id);
      const prev = await getDoc(ref);
      const prevInv = (prev.data()?.inventory as Inventory) ?? {};

      const changes: Record<string, { before: number; after: number }> = {};
      for (const key of Object.keys(current)) {
        const before = prevInv[key] ?? 0;
        const after = current[key] ?? 0;
        if (before !== after) changes[key] = { before, after };
      }

      await setDoc(ref, {
        name: "Victoria Apartments",
        type,
        inventory: current,
        description,
        notes,
        itemNotes,
        appliancesStatus,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      if (Object.keys(changes).length > 0) {
        await addDoc(collection(db, "logs"), {
          type: "apartment",
          targetId: id,
          action: "update",
          updatedBy: "anon",
          changes,
          timestamp: new Date().toISOString(),
        });
      }

      alert("✅ Inventar wurde gespeichert!");
      router.push("/apartments");
    } catch (e) {
      console.error(e);
      alert("❌ Fehler beim Speichern des Inventars");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">🔄 Wird geladen...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kontrolle: Victoria Apartments Nr. {id}</h1>

      {/* Beschreibung & Gesamt-Notiz */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Wohnungsbeschreibung</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="z. B. Lage, Besonderheiten …"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={(e) => saveApartmentDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wohnungsnotiz</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="z. B. Strom ist vorübergehend außer Betrieb"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={(e) => saveApartmentNote(e.target.value)}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Links — editierbar */}
        <div>
          <h2 className="text-lg font-semibold mb-2">📦 Aktueller Bestand</h2>
          <ul className="space-y-3">
            {Object.entries(standard).map(([item, expected]) => {
              const actual = current?.[item] ?? 0;
              const expectedNum = expected as number;

              let borderColor = "border-gray-300";
              if (actual < expectedNum) borderColor = "border-red-500";
              else if (actual > expectedNum) borderColor = "border-yellow-500";

              const isAppliance = applianceItems.has(item);
              const works = appliancesStatus[item]?.works ?? false;

              return (
                <li key={item} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <label className="w-48">{item}</label>
                    <input
                      type="number"
                      value={actual}
                      onChange={(e) => handleChange(item, e.target.value)}
                      className={`w-24 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all
                        border ${borderColor}
                        ${borderColor === "border-red-500" ? "bg-red-50" : ""}
                        ${borderColor === "border-yellow-500" ? "bg-yellow-50" : ""}
                      `}
                    />
                    <span className="text-sm text-gray-500">Soll: {expectedNum}</span>

                    {isAppliance && (
                      <label className="ml-3 inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={works}
                          onChange={(e) => setApplianceWorks(item, e.target.checked)}
                        />
                        Funktioniert
                      </label>
                    )}
                  </div>

                  {/* Notiz je Artikel */}
                  <div className="pl-0 md:pl-48">
                    <input
                      className="w-full md:w-80 border rounded px-2 py-1 text-sm"
                      placeholder="Notiz zum Artikel (optional)"
                      value={itemNotes[item] ?? ""}
                      onChange={(e) => setItemNotes({ ...itemNotes, [item]: e.target.value })}
                      onBlur={(e) => saveItemNote(item, e.target.value)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <button onClick={handleSave} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Speichern
          </button>
        </div>
        {/* Rechts — Standard */}
      </div>
    </main>
  );
}
