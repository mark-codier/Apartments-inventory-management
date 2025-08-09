"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apartmentStandards, ApartmentType } from "@/lib/inventoryData";

type Inventory = Record<string, number>;

type ApartmentRow = {
  id: string;
  type: ApartmentType;
  inventory: Inventory;
};

export default function ApartmentTable() {
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      const snapshot = await getDocs(collection(db, "apartments"));
      const data: ApartmentRow[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data() as { type: ApartmentType; inventory?: Inventory };
        return {
          id: docSnap.id,
          type: d.type,
          inventory: d.inventory ?? {},
        };
      });
      setApartments(data);
      setLoading(false);
    };

    fetchApartments();
  }, []);

  const getStatus = (type: ApartmentType, inventory: Inventory) => {
    const standard = apartmentStandards[type];
    let hasLess = false;
    let hasMore = false;

    for (const item in standard) {
      const expected = standard[item];
      const actual = inventory[item] ?? 0;
      if (actual < expected) hasLess = true;
      if (actual > expected) hasMore = true;
    }

    if (hasLess) return "❌ Fehlend";
    if (hasMore) return "⚠ Überschuss";
    return "✅ Alles in Ordnung";
  };

  if (loading) {
    return <p className="text-gray-500">🔄 Wird geladen...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border-b">Nummer</th>
            <th className="text-left px-4 py-2 border-b">Typ</th>
            <th className="text-left px-4 py-2 border-b">Status</th>
            <th className="text-left px-4 py-2 border-b">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {apartments.map((apt) => (
            <tr key={apt.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{apt.id}</td>
              <td className="px-4 py-2 border-b">{apt.type}</td>
              <td className="px-4 py-2 border-b">
                {getStatus(apt.type, apt.inventory)}
              </td>
              <td className="px-4 py-2 border-b">
                <Link href={`/apartments/${apt.id}`}>
                  <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                    Prüfen
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
