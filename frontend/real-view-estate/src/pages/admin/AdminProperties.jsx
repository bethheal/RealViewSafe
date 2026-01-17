import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import adminService from "../../services/admin.service";

export default function AdminProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

const load = async () => {
  setLoading(true);
  try {
    const res = await adminService.getPendingProperties();
    // supports: array OR {data: array}
    const arr = Array.isArray(res) ? res : (res?.data || []);
    setItems(arr);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await adminService.reviewProperty(id, { action: "APPROVED" });
    load();
  };

  const reject = async (id) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    await adminService.reviewProperty(id, { action: "REJECTED", reason });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Property Approvals</h1>
        <p className="text-gray-600 mt-1">Approve or reject agent submissions.</p>
      </div>

      <Card title="Pending Properties">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState title="No pending properties" desc="New submissions will show here." />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-extrabold text-gray-900">{p.title}</div>
                  <div className="text-sm text-gray-600">{p.location}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Agent: {p.agent?.user?.fullName} ({p.agent?.user?.email})
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => approve(p.id)}>Approve</Button>
                  <Button variant="danger" onClick={() => reject(p.id)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
