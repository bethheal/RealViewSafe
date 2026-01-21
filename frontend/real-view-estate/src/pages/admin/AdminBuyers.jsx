import React, { useEffect, useState } from "react";
import adminService from "../../services/admin.service";

export default function AdminBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const payload = await adminService.getBuyers();

        // ✅ supports both:
        // 1) [...]
        // 2) { data: [...] }
        const list = Array.isArray(payload) ? payload : payload?.data;

        setBuyers(Array.isArray(list) ? list : []);
      } catch (e) {
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Buyers & Purchases</h1>
        <p className="text-gray-600 mt-1">See what buyers purchased and which agent listed it.</p>
      </div>

      <div className="space-y-4">
        {buyers.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm p-6 text-gray-500">
            No buyers found.
          </div>
        ) : (
          buyers.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-extrabold text-gray-900">{b.user?.fullName}</div>
                  <div className="text-sm text-gray-600">
                    {b.user?.email} {b.user?.phone ? `• ${b.user.phone}` : ""}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Joined: {b.user?.createdAt ? new Date(b.user.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-extrabold text-gray-900">Purchases</div>

                {Array.isArray(b.purchases) && b.purchases.length ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left text-sm">
                      <thead className="text-xs uppercase text-gray-500">
                        <tr>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Property</th>
                          <th className="py-2 pr-4">Location</th>
                          <th className="py-2 pr-4">Price</th>
                          <th className="py-2 pr-4">Agent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {b.purchases.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3 pr-4 text-gray-600">
                              {p?.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                            </td>
                            <td className="py-3 pr-4 font-bold">{p.property?.title || "—"}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.property?.location || "—"}</td>
                            <td className="py-3 pr-4">
                              GHS {p.property?.price?.toLocaleString?.() ?? p.property?.price ?? "—"}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {p.property?.agent?.user?.fullName || "—"}
                              {p.property?.agent?.user?.email ? ` (${p.property.agent.user.email})` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">No purchases yet.</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
