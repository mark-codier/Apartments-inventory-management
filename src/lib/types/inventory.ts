// src/lib/types/items.ts
export type Category = 'verbrauch' | 'geraete' | 'geschirr';

export type Item = {
  id: string;         // slug, z.B. "kaffee"
  name: string;       // "Kaffee"
  category: Category; // "verbrauch" | "geraete" | "geschirr"
  unit: string;       // "Stk", "Pck", "Rolle" ...
  photoUrl?: string;
  description?: string;
  alias?: string[];
};

export type ApplianceStatus = {
  works: boolean;
  lastChecked: string; // ISO
  note?: string;
};
