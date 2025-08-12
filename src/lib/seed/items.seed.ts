// src/lib/items.seed.ts
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item } from '../types/inventory';

const ITEMS: Item[] = [
  // Verbrauch
  { id: 'kaffee', name: 'Kaffee', category: 'verbrauch', unit: 'Pck', description: 'Filterkaffee oder Kapseln – je nach Wohnung.' },
  { id: 'zucker', name: 'Zucker', category: 'verbrauch', unit: 'Pck' },
  { id: 'pfeffer', name: 'Pfeffer', category: 'verbrauch', unit: 'Pck' },
  { id: 'salz', name: 'Salz', category: 'verbrauch', unit: 'Pck' },
  { id: 'papierrollen', name: 'Papierrollen', category: 'verbrauch', unit: 'Rolle' },
  { id: 'sahne', name: 'Sahne', category: 'verbrauch', unit: 'Pck', description: 'Kaffeesahne/Creme.' },
  { id: 'tee', name: 'Tee', category: 'verbrauch', unit: 'Pck' },

  // Geräte
  { id: 'fernseher', name: 'Fernseher', category: 'geraete', unit: 'Stk', description: 'TV-Gerät. Bei Inventur bitte Funktion testen.' },
  { id: 'klimaanlage', name: 'Klimaanlage', category: 'geraete', unit: 'Stk' },
  { id: 'kuehlschrank', name: 'Kühlschrank', category: 'geraete', unit: 'Stk' },
  { id: 'safe', name: 'Safe', category: 'geraete', unit: 'Stk', description: 'Tresor. Funktion (Öffnen/Schließen) prüfen.' },

  // Geschirr (erweiterbar)
  { id: 'gabel', name: 'Gabel', category: 'geschirr', unit: 'Stk' },
  { id: 'loeffel', name: 'Löffel', category: 'geschirr', unit: 'Stk' },
  { id: 'messer', name: 'Messer', category: 'geschirr', unit: 'Stk' },
  { id: 'teller-klein', name: 'Teller (klein)', category: 'geschirr', unit: 'Stk' },
  { id: 'teller-gross', name: 'Teller (groß)', category: 'geschirr', unit: 'Stk' },
  { id: 'platte', name: 'Platte/Servierplatte', category: 'geschirr', unit: 'Stk' },
  { id: 'schuessel', name: 'Schüssel', category: 'geschirr', unit: 'Stk' },
  { id: 'glas', name: 'Glas', category: 'geschirr', unit: 'Stk' },
  { id: 'weinglas', name: 'Weinglas', category: 'geschirr', unit: 'Stk' },
  { id: 'tasse', name: 'Tasse', category: 'geschirr', unit: 'Stk' },
  { id: 'bierkrug', name: 'Bierkrug', category: 'geschirr', unit: 'Stk' },
  { id: 'pfanne', name: 'Pfanne', category: 'geschirr', unit: 'Stk' },
  { id: 'topf', name: 'Topf', category: 'geschirr', unit: 'Stk' },
];

export async function seedItems() {
  const col = collection(db, 'items');
  await Promise.all(
    ITEMS.map((it) => setDoc(doc(col, it.id), it, { merge: true })) // idempotent
  );
}
