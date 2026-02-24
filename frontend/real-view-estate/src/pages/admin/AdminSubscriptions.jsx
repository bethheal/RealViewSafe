import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import adminService from "../../services/admin.service";

export default function AdminSubscriptions() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getSubscriptions();
      // some endpoints return { data: [...] } while others return [...] directly
      const list = Array.isArray(payload) ? payload : payload?.data;
      setAgents(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const assign = async (agentId) => {
    const plan = prompt("Plan? (FREE, BASIC, PRO, PREMIUM)", "BASIC");
    if (!plan) return;

    const daysStr = prompt("Days? (leave empty for no expiry)", "30");
    const days = daysStr ? Number(daysStr) : undefined;

    await adminService.assignSubscription({ agentId, plan, days });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">View and assign plans.</p>
      </div>

      <Card title="Agent Subscriptions">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-extrabold">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {(Array.isArray(agents) ? agents : []).map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-4 font-bold">{a.user?.fullName}</td>
                    <td className="px-4 py-4">{a.user?.email}</td>
                    <td className="px-4 py-4">{a.subscription?.plan || "FREE"}</td>
                    <td className="px-4 py-4">
                      {a.subscription?.expiresAt ? new Date(a.subscription.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Button onClick={() => assign(a.id)}>Assign / Update</Button>
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
