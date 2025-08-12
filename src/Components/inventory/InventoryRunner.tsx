// src/components/inventory/InventoryRunner.tsx
"use client";
import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item, Category } from '../../lib/types/inventory'

export function InventoryRunner({
  aptId,
  items,
  standard,
  categoryOrder,
}: {
  aptId: string;
  items: Item[];
  standard: Record<string, number>; // { itemId: soll }
  categoryOrder: Array<{ category: Category; ids: string[] }>; // Reihenfolge
}) {
  // Reihenfolge berechnen
  const orderedIds = useMemo(() => {
    const set = new Set(items.map((i) => i.id));
    const seq: string[] = [];
    for (const group of categoryOrder) {
      for (const id of group.ids) if (set.has(id)) seq.push(id);
      // übrige derselben Kategorie anhängen
      const rest = items
        .filter((i) => i.category === group.category && !seq.includes(i.id))
        .map((i) => i.id);
      seq.push(...rest);
    }
    // alles was noch fehlt
    for (const i of items) if (!seq.includes(i.id)) seq.push(i.id);
    return seq;
  }, [items, categoryOrder]);

  const [index, setIndex] = useState(0);
  const currentId = orderedIds[index];
  const current = items.find((i) => i.id === currentId);

  const [actual, setActual] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      const ref = doc(db, 'apartments', aptId);
      const snap = await getDoc(ref);
      const inv = (snap.data()?.inventory ?? {}) as Record<string, number>;
      const a = inv[currentId] ?? 0;
      if (alive) { setActual(a); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [aptId, currentId]);

  const saveAndNext = async () => {
    if (!currentId) return;
    const ref = doc(db, 'apartments', aptId);
    const snap = await getDoc(ref);
    const data = snap.data() ?? {};
    const inv = { ...(data.inventory ?? {}), [currentId]: actual };
    await setDoc(ref, { inventory: inv, updatedAt: new Date().toISOString() }, { merge: true });
    setIndex((i) => Math.min(i + 1, orderedIds.length - 1));
  };

  if (!current) return <div className="p-6">Keine Artikel gefunden.</div>;
  const soll = standard[currentId] ?? 0;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-sm text-gray-500 mb-2">Schritt {index + 1} / {orderedIds.length}</div>
      <h2 className="text-xl font-semibold mb-1">{current.name}</h2>
      <div className="text-gray-600 mb-4">Soll: {soll} {current.unit}</div>

      <input
        type="number"
        value={actual}
        onChange={(e) => setActual(parseInt(e.target.value) || 0)}
        className="w-28 border rounded px-3 py-2"
      />

      <div className="mt-4 flex gap-2">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 rounded border">Zurück</button>
        <button onClick={() => setIndex((i) => Math.min(orderedIds.length - 1, i + 1))} className="px-3 py-2 rounded border">Überspringen</button>
        <button onClick={saveAndNext} className="px-3 py-2 rounded bg-green-600 text-white">Speichern & Weiter</button>
      </div>

      {loading && <div className="mt-2 text-sm text-gray-500">Lade aktuellen Wert…</div>}
    </div>
  );
}
