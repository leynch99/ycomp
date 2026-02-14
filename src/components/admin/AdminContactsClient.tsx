"use client";

import { useState } from "react";

type ContactRow = {
  id: string;
  phone: string;
  question: string;
  status: string;
};

export function AdminContactsClient({ requests }: { requests: ContactRow[] }) {
  const [rows, setRows] = useState<ContactRow[]>(requests);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setError(null);
    const prev = rows;
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row)),
    );
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setRows(prev);
        setError(`Помилка оновлення (${res.status})`);
      }
    } catch (err) {
      setRows(prev);
      setError("Помилка мережі");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
      {error && <div className="mb-3 text-xs text-red-600">{error}</div>}
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2">Телефон</th>
            <th className="py-2">Питання</th>
            <th className="py-2">Статус</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((req) => (
            <tr key={req.id} className="border-t border-slate-100">
              <td className="py-2">{req.phone}</td>
              <td className="py-2">{req.question}</td>
              <td className="py-2">
                <select
                  defaultValue={req.status}
                  onChange={(event) => updateStatus(req.id, event.target.value)}
                  className="rounded-lg border border-lilac px-2 py-1 text-xs text-slate-700"
                >
                  {["NEW", "DONE"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
