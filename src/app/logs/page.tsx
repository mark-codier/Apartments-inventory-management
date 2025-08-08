"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";

type LogEntry = {
  type: "apartment" | "storage";
  targetId: string;
  action: string;
  updatedBy: string;
  timestamp: string;
  changes: Record<string, { before: number; after: number }>;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => doc.data() as LogEntry);
      setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Änderungsprotokoll</h1>

      {loading ? (
        <p className="text-gray-500">Wird geladen...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">Keine Einträge</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log, index) => (
            <li key={index} className="border p-4 rounded bg-white shadow-sm">
              <div className="text-sm text-gray-600">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="mt-1 font-medium">
                {log.type === "apartment"
                  ? `🏢 Wohnung Nr. ${log.targetId}`
                  : "📦 Lager"}
              </div>
              <div className="text-sm text-gray-500">👤 {log.updatedBy}</div>

              <ul className="mt-2 list-disc list-inside text-sm text-gray-800">
                {Object.entries(log.changes).map(([item, change]) => (
                  <li key={item}>
                    {item}: {change.before} → {change.after}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
