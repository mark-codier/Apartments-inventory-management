"use client";

import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ApartmentType, Inventory, apartmentStandards } from "@/lib/inventoryData";

export default function ApartmentClient({
  id,
  type,
}: {
  id: string;
  type: ApartmentType;
}) {
  const router = useRouter();
  const standard = apartmentStandards[type];

  const [current, setCurrent] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ref = doc(db, "apartments", id);
      const snap = await getDoc(ref);
      const data = snap.exists()
        ? (snap.data().inventory as Inventory)
        : ({ ...standard } as Inventory);
      if (alive) {
        setCurrent(data);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, standard]);

  const handleChange = (item: string, value: string) => {
    setCurrent((prev) => ({ ...(prev ?? {}), [item]: Number.parseInt(value) || 0 }));
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
        updatedAt: new Date().toISOString(),
      });

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
      <h1 className="text-2xl font-bold mb-6">Kontrolle: Victoria Apartments Nr. {id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">📦 Aktueller Bestand</h2>
          <ul className="space-y-3">
            {Object.entries(standard).map(([item, expected]) => {
              const actual = current?.[item] ?? 0;

              let borderColor = "border-gray-300";
              if (actual < (expected as number)) borderColor = "border-red-500";
              else if (actual > (expected as number)) borderColor = "border-yellow-500";

              return (
                <li key={item} className="flex items-center gap-2">
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
                  <span className="text-sm text-gray-500">Soll: {expected as number}</span>
                </li>
              );
            })}
          </ul>
          <button
            onClick={handleSave}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Speichern
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">✅ Soll-Bestand ({type})</h2>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(standard).map(([item, count]) => (
              <li key={item}>{item}: {count as number}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
