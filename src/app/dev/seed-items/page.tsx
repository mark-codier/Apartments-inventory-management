'use client';
import { seedItems } from '@/lib/seed/items.seed';
import { useState } from 'react';

export default function SeedItemsPage() {
  const [done, setDone] = useState(false);
  const run = async () => { await seedItems(); setDone(true); };
  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-2">Items seeden</h1>
      <p className="text-sm text-gray-600 mb-4">Nur in der Entwicklung verwenden.</p>
      <button onClick={run} className="bg-blue-600 text-white px-4 py-2 rounded">Seeden</button>
      {done && <div className="mt-3 text-green-700">Fertig ✅</div>}
    </main>
  );
}