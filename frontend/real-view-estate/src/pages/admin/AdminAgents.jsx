import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import adminService from "../../services/admin.service";

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getAgents();

      // ✅ supports:
      // 1) payload is array: [...]
      // 2) payload is object: { data: [...] }
      const list = Array.isArray(payload) ? payload : payload?.data;

      setAgents(Array.isArray(list) ? list : []);
    } catch (e) {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSuspend = async (agent) => {
    await adminService.suspendAgent(agent.id, { suspended: !agent.suspended });
    await load();
  };

  const toggleVerify = async (agent) => {
    await adminService.verifyAgent(agent.id, { verified: !agent.verified });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Agents</h1>
        <p className="text-gray-600 mt-1">Suspend or manage agent accounts.</p>
      </div>

      <Card title="All Agents">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : agents.length === 0 ? (
          <EmptyState title="No agents found" desc="Agents will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-extrabold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Suspended</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {agents.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-4 font-bold">{a.user?.fullName}</td>
                    <td className="px-4 py-4">{a.user?.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.verified ? "VERIFIED" : "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-4">{a.suspended ? "YES" : "NO"}</td>
                    <td className="px-4 py-4">{a.subscription?.plan || "FREE"}</td>
                    <td className="px-4 py-4">
                      {a.subscription?.expiresAt
                        ? new Date(a.subscription.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4 space-x-2 flex">
                      <Button
                        onClick={() => toggleVerify(a)}
                        variant={a.verified ? "danger" : "primary"}
                        size="sm"
                      >
                        {a.verified ? "Reject" : "Approve"}
                      </Button>
                      <Button
                        onClick={() => toggleSuspend(a)}
                        variant={a.suspended ? "primary" : "danger"}
                        size="sm"
                      >
                        {a.suspended ? "Unsuspend" : "Suspend"}
                      </Button>
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
