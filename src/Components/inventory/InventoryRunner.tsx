"use client";
import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item, Category } from '../../lib/types/inventory';

export function InventoryRunner({
  aptId,
  items,
  standard,
  categoryOrder,
}: {
  aptId: string;
  items: Item[];
  standard: Record<string, number>; // keys are your current labels (e.g. "Fernseher")
  categoryOrder: Array<{ category: Category; ids: string[] }>;
}) {
  // Reihenfolge
  const orderedIds = useMemo(() => {
    const set = new Set(items.map((i) => i.id));
    const seq: string[] = [];
    for (const group of categoryOrder) {
      // gewünschte IDs zuerst (falls deine Item-IDs == Anzeigenamen, passt das;
      // falls nicht, werden die restlichen Items der Kategorie unten ergänzt)
      for (const id of group.ids) if (set.has(id)) seq.push(id);
      const rest = items
        .filter((i) => i.category === group.category && !seq.includes(i.id))
        .map((i) => i.id);
      seq.push(...rest);
    }
    for (const i of items) if (!seq.includes(i.id)) seq.push(i.id);
    return seq;
  }, [items, categoryOrder]);

  const [index, setIndex] = useState(0);
  const currentId = orderedIds[index];
  const current = items.find((i) => i.id === currentId);

  // Schlüssel ermitteln: bevorzugt der Anzeigename, wenn er im Standard existiert,
  // sonst die technische ID – so bleiben wir kompatibel mit deinem aktuellen Datenmodell.
  const inventoryKey = current
    ? (standard[current.name] !== undefined ? current.name : current.id)
    : "";

  const [actual, setActual] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!current || !inventoryKey) return;
    let alive = true;
    (async () => {
      setLoading(true);
      const ref = doc(db, 'apartments', aptId);
      const snap = await getDoc(ref);
      const inv = (snap.data()?.inventory ?? {}) as Record<string, number>;
      const a = inv[inventoryKey] ?? 0;
      if (alive) { setActual(a); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [aptId, inventoryKey, current]);

  const saveAndNext = async () => {
    if (!current || !inventoryKey) return;
    const ref = doc(db, 'apartments', aptId);
    const snap = await getDoc(ref);
    const data = snap.data() ?? {};
    const inv = { ...(data.inventory ?? {}), [inventoryKey]: actual };
    await setDoc(ref, { inventory: inv, updatedAt: new Date().toISOString() }, { merge: true });
    setIndex((i) => Math.min(i + 1, orderedIds.length - 1));
  };

  if (!current) return <div className="p-6">Keine Artikel gefunden.</div>;
  const soll =
    standard[inventoryKey] ??
    standard[current.name] ??
    standard[current.id] ??
    0;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-sm text-gray-500 mb-2">
        Schritt {index + 1} / {orderedIds.length}
      </div>
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
