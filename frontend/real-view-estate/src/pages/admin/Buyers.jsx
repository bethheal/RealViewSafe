import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import DataTable from "../../components/data/DataTable";
import MobileList from "../../components/data/MobileList";
import { adminService } from "../../services/admin.service";

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getBuyers()
      .then((res) => setBuyers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "fullName", header: "Name", render: (b) => <span className="font-extrabold text-gray-900">{b.fullName}</span> },
    { key: "email", header: "Email" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Registered Buyers</h1>
        <p className="text-gray-600 mt-1">View all buyers on the platform.</p>
      </div>

      <Card title="Buyers" subtitle="Desktop table + mobile cards">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : buyers.length === 0 ? (
          <EmptyState title="No buyers" desc="Buyers will appear here after signup." />
        ) : (
          <>
            <DataTable columns={columns} rows={buyers} rowKey="id" />
            <MobileList
              rows={buyers}
              renderItem={(b) => (
                <div key={b.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="font-extrabold text-gray-900">{b.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1 break-all">{b.email}</p>
                </div>
              )}
            />
          </>
        )}
      </Card>
    </div>
  );
}
