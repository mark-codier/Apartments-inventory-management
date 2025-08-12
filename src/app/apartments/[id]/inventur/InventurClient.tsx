"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apartmentStandards } from "@/lib/inventoryData";
import type { Item, Category } from '../../../../lib/types/inventory'
import { InventoryRunner } from "../../../../Components/inventory/InventoryRunner";

export default function InventurClient({ aptId }: { aptId: string }) {
  const [aptType, setAptType] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1) Wohnungstyp laden
        const aptRef = doc(db, "apartments", aptId);
        const aptSnap = await getDoc(aptRef);
        const type = (aptSnap.data()?.type as string) ?? null;

        // 2) Items laden
        const itemsSnap = await getDocs(collection(db, "items"));
        const list: Item[] = itemsSnap.docs.map(d => d.data() as Item);

        if (alive) {
          setAptType(type);
          setItems(list);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [aptId]);

  const standard = useMemo(() => {
    if (!aptType) return {};
    // @ts-ignore – dein apartmentStandards ist bereits vorhanden
    return apartmentStandards[aptType] ?? {};
  }, [aptType]);

  // Reihenfolge: Geschirr → Verbrauch → Geräte (mit ein paar vorgeschlagenen IDs zuerst)
  const categoryOrder: Array<{ category: Category; ids: string[] }> = useMemo(() => ([
    { category: "geschirr", ids: ["Gabel","Löffel","Messer","Teller (klein)","Teller (groß)","Platte/Servierplatte","Schüssel","Glas","Weinglas","Tasse","Bierkrug","Pfanne","Topf"] },
    { category: "verbrauch", ids: ["Kaffee","Zucker","Pfeffer","Salz","Papierrollen","Sahne","Tee"] },
    { category: "geraete",   ids: ["Fernseher","Klimaanlage","Kühlschrank","Safe"] },
  ]), []);

  if (loading) return <main className="p-6">🔄 Lädt…</main>;
  if (!aptType) return <main className="p-6">Wohnungstyp nicht gefunden.</main>;
  if (!items.length) return <main className="p-6">Keine Items im Katalog. Bitte seeden.</main>;

  // Runner bekommt: items, standard & categoryOrder
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-3">Inventur – Wohnung {aptId}</h1>
      <InventoryRunner
        aptId={aptId}
        items={items}
        standard={standard as Record<string, number>}
        categoryOrder={categoryOrder}
      />
    </main>
  );
}
