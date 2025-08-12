// src/components/items/ItemMiniProfile.tsx
"use client";
import Image from 'next/image';
import type { Item } from '../../lib/types/inventory';

export function ItemMiniProfile({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[520px] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {item.photoUrl && (
          <div className="relative w-full h-40 mb-3">
            <Image src={item.photoUrl} alt={item.name} fill className="object-cover rounded-xl" />
          </div>
        )}
        {item.description && <p className="text-sm text-gray-700">{item.description}</p>}
      </div>
    </div>
  );
}
