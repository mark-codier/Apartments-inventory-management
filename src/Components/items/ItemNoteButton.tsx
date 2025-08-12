'use client';
import { useState } from 'react';

export function ItemNoteButton({
  initialNote,
  onSave,
}: {
  initialNote?: string;
  onSave: (note: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(initialNote ?? '');
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-blue-700">📝 Notiz</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center">
          <div className="bg-white w-full md:w-[480px] rounded-2xl p-4">
            <h4 className="font-medium mb-2">Notiz zum Artikel</h4>
            <textarea value={val} onChange={e=>setVal(e.target.value)} className="w-full border rounded p-2 h-28" />
            <div className="mt-3 flex gap-2 justify-end">
              <button onClick={()=>setOpen(false)} className="px-3 py-1.5 rounded border">Abbrechen</button>
              <button onClick={async()=>{ await onSave(val); setOpen(false); }} className="px-3 py-1.5 rounded bg-blue-600 text-white">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}