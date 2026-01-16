import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import DataTable from "../../components/data/DataTable";
import MobileList from "../../components/data/MobileList";
import { adminService } from "../../services/admin.service";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAgents()
      .then((res) => setAgents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "fullName", header: "Name", render: (a) => <span className="font-extrabold text-gray-900">{a.fullName}</span> },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge tone={a.status === "active" ? "green" : "yellow"}>
          {a.status?.toUpperCase() || "PENDING"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Registered Agents</h1>
        <p className="text-gray-600 mt-1">View all agents on the platform.</p>
      </div>

      <Card title="Agents" subtitle="Desktop table + mobile cards">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : agents.length === 0 ? (
          <EmptyState title="No agents" desc="Agents will appear here after signup." />
        ) : (
          <>
            <DataTable columns={columns} rows={agents} rowKey="id" />
            <MobileList
              rows={agents}
              renderItem={(a) => (
                <div key={a.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-gray-900">{a.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1 break-all">{a.email}</p>
                    </div>
                    <Badge tone={a.status === "active" ? "green" : "yellow"}>
                      {a.status?.toUpperCase() || "PENDING"}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </>
        )}
      </Card>
    </div>
  );
}
