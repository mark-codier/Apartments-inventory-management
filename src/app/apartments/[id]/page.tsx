"use client";

import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import {
  apartmentStandards,
  ApartmentType,
  Inventory,
} from "@/lib/inventoryData";

const apartmentList: { id: string; type: ApartmentType }[] = [
  // Deluxe
  { id: "11", type: "Deluxe" },
  { id: "21", type: "Deluxe" },
  { id: "31", type: "Deluxe" },
  { id: "41", type: "Deluxe" },
  { id: "51", type: "Deluxe" },

  // Luxury
  { id: "12", type: "Luxury" },
  { id: "22", type: "Luxury" },
  { id: "32", type: "Luxury" },
  { id: "42", type: "Luxury" },
  { id: "52", type: "Luxury" },

  // Superior
  { id: "13", type: "Superior" },
  { id: "23", type: "Superior" },
  { id: "33", type: "Superior" },
  { id: "43", type: "Superior" },
  { id: "53", type: "Superior" },

  // Executive
  { id: "14", type: "Executive" },
  { id: "24", type: "Executive" },
  { id: "34", type: "Executive" },

  // Penthouses
  { id: "61", type: "Penthouse 1" },
  { id: "62", type: "Penthouse 2" },
  { id: "63", type: "Penthouse 3" },
];

export default function ApartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter(); // ← добавлено
  const apartment = apartmentList.find((a) => a.id === params.id);
  if (!apartment) notFound();

  const standard = apartmentStandards[apartment.type];

  const [current, setCurrent] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const ref = doc(db, "apartments", apartment.id);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setCurrent(data.inventory);
      } else {
        setCurrent({ ...standard });
      }

      setLoading(false);
    };

    loadData();
  }, [apartment.id, standard]);

  const handleChange = (item: string, value: string) => {
    setCurrent((prev) => ({
      ...prev,
      [item]: parseInt(value) || 0,
    }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "apartments", apartment.id);
      const prevDoc = await getDoc(ref);
      const prevData = prevDoc.data()?.inventory || {};

      const changes: Record<string, { before: number; after: number }> = {};
      for (const key in current) {
        const before = prevData[key] ?? 0;
        const after = current[key];
        if (before !== after) {
          changes[key] = { before, after };
        }
      }

      await setDoc(ref, {
        name: "Victoria Apartments",
        type: apartment.type,
        inventory: current,
        updatedAt: new Date().toISOString(),
      });

      if (Object.keys(changes).length > 0) {
        await addDoc(collection(db, "logs"), {
          type: "apartment",
          targetId: apartment.id,
          action: "update",
          updatedBy: "anon",
          changes,
          timestamp: new Date().toISOString(),
        });
      }

      alert("✅ Inventar wurde gespeichert!");
      router.push("/apartments"); // ← переход на список квартир
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("❌ Fehler beim Speichern des Inventars");
    }
  };


  if (loading) return <p className="p-6 text-gray-500">🔄 Wird geladen...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Kontrolle: Victoria Apartments Nr. {apartment.id}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Links — editierbar */}
        <div>
          <h2 className="text-lg font-semibold mb-2">📦 Aktueller Bestand</h2>
          <ul className="space-y-3">
            {Object.keys(standard).map((item) => {
              const expected = standard[item];
              const actual = current?.[item] ?? 0;

              let borderColor = "border-gray-300";
              if (actual < expected) borderColor = "border-red-500";
              else if (actual > expected) borderColor = "border-yellow-500";

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
                      ${
                        borderColor === "border-yellow-500"
                          ? "bg-yellow-50"
                          : ""
                      }
                    `}
                  />
                  <span className="text-sm text-gray-500">
                    Soll: {expected}
                  </span>
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

        {/* Rechts — Standard */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            ✅ Soll-Bestand ({apartment.type})
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(standard).map(([item, count]) => (
              <li key={item}>
                {item}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
