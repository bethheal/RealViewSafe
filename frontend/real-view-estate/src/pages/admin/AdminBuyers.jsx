import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import adminService from "../../services/admin.service";

export default function AdminBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await adminService.getBuyers();
        setBuyers(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Buyers</h1>
        <p className="text-gray-600 mt-1">All buyer accounts.</p>
      </div>

      <Card title="All Buyers">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : buyers.length === 0 ? (
          <EmptyState title="No buyers found" desc="Buyers will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-extrabold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {buyers.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-4 font-bold">{b.user?.fullName}</td>
                    <td className="px-4 py-4">{b.user?.email}</td>
                    <td className="px-4 py-4">{b.user?.phone || "—"}</td>
                    <td className="px-4 py-4">
                      {b.user?.createdAt ? new Date(b.user.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
