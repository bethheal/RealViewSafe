// BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import buyerService from "../../services/buyer.service";
import { REALVIEW_CONTACT } from "../../constants/realviewContact";

export default function BuyerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerService.getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-600 font-semibold">Loading...</div>;
  if (!data) return <EmptyState title="No data" desc="Dashboard data could not load." />;

  const { stats, recentSaved, recentPurchases } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Your activity overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Saved" subtitle="Properties you saved">
          <div className="text-3xl font-extrabold">{stats?.savedCount ?? 0}</div>
        </Card>
        <Card title="Bought" subtitle="Properties purchased">
          <div className="text-3xl font-extrabold">{stats?.purchaseCount ?? 0}</div>
        </Card>
        <Card title="Leads" subtitle="Chats/contact attempts">
          <div className="text-3xl font-extrabold">{stats?.leadCount ?? 0}</div>
        </Card>
      </div>

      <Card title="Recent Saved" subtitle="Your latest favorites">
        {!recentSaved?.length ? (
          <EmptyState title="No saved properties" desc="Save a property to see it here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSaved.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                footer={
                  p?.listedByAdmin ? (
                    <div className="text-xs font-semibold text-gray-700">
                      Listed by Real View • {REALVIEW_CONTACT.phone} • {REALVIEW_CONTACT.email}
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Recent Purchases" subtitle="Your latest buys">
        {!recentPurchases?.length ? (
          <EmptyState title="No purchases" desc="When you buy a property it will show here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPurchases.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                footer={
                  p?.listedByAdmin ? (
                    <div className="text-xs font-semibold text-gray-700">
                      Listed by Real View • {REALVIEW_CONTACT.phone} • {REALVIEW_CONTACT.email}
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
