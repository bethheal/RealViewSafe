import React, { useEffect, useState } from "react";
import adminService from "../../services/admin.service";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5">
      <div className="text-sm text-gray-500 font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await adminService.getDashboard();
        setStats(data.stats);
        setRecentPending(data.recentPending || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-1">Real-time admin metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Agents" value={stats?.agents ?? 0} />
        <Stat label="Buyers" value={stats?.buyers ?? 0} />
        <Stat label="Pending approvals" value={stats?.pending ?? 0} />
        <Stat label="Active subscriptions" value={stats?.activeSubs ?? 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">Recent pending submissions</h2>
            <span className="text-sm text-gray-500">Last 6</span>
          </div>

          <div className="mt-4 space-y-3">
            {recentPending.length === 0 ? (
              <div className="text-gray-500 text-sm">No pending properties.</div>
            ) : (
              recentPending.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-4 border border-gray-100 rounded-xl p-4">
                  <div>
                    <div className="font-extrabold text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-600">{p.location}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Agent: {p.agent?.user?.fullName} ({p.agent?.user?.email})
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm p-5">
          <h2 className="font-extrabold text-gray-900">Property status</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Approved</span><b>{stats?.approved ?? 0}</b></div>
            <div className="flex justify-between"><span>Rejected</span><b>{stats?.rejected ?? 0}</b></div>
            <div className="flex justify-between"><span>Sold</span><b>{stats?.sold ?? 0}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
