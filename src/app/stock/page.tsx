"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

type Inventory = Record<string, number>;

function sumInventories(apartments: any[]): Inventory {
  const total: Inventory = {};
  for (const apt of apartments) {
    const inv = apt.inventory || {};
    for(const key in inv) {
      total[key] = (total[key] || 0) + inv[key];
    }
  }
  console.log(total)
  return total;
}

export default function StockPage() {
  const [storage, setStorage] = useState<Inventory>({});
  const [used, setUsed] = useState<Inventory>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const aptSnap = await getDocs(collection(db, "apartments"));
      const apartments = aptSnap.docs.map((doc) => doc.data());
      const usedInApts = sumInventories(apartments);
      setUsed(usedInApts);

      const storageSnap = await getDoc(doc(db, "storage", "main"));
      const storageData = storageSnap.exists()
        ? storageSnap.data()
        : { inventory: {} };
      setStorage(storageData.inventory || {});
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (item: string, value: string) => {
    setStorage((prev) => ({
      ...prev,
      [item]: parseInt(value) || 0,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "storage", "main"), {
      inventory: storage,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    alert("✅ Lager wurde aktualisiert");
  };

  if (loading) return <p className="p-6 text-gray-500">🔄 Wird geladen...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Lager</h1>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border-b">Artikel</th>
            <th className="text-left px-4 py-2 border-b">Im Lager</th>
            <th className="text-left px-4 py-2 border-b">In Wohnungen</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(storage).map((item) => (
            <tr key={item} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{item}</td>
              <td className="px-4 py-2 border-b">
                <input
                  type="number"
                  value={storage[item]}
                  onChange={(e) => handleChange(item, e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="px-4 py-2 border-b">{used[item]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? "Speichern..." : "Änderungen speichern"}
      </button>
    </main>
  );
}
