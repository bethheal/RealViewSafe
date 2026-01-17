import React from 'react';

import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import Button from "../../components/ui/Button";
import buyerService from "../../services/buyer.service";

export default function SaveProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerService.getSaved()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

 const buy = async (id) => {
  try {
    await buyerService.buyProperty(id);
    // remove from UI immediately
    setItems((prev) => prev.filter((x) => x.id !== id));
    alert("Purchased");
  } catch (e) {
    alert(e?.response?.data?.message || "Purchase failed");
  }
};


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Saved Properties</h1>
        <p className="text-gray-600 mt-1">Your favorites.</p>
      </div>

      <Card title="Saved" subtitle="Quickly return to listings you liked">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState title="No saved properties" desc="Tap Save on any property to add it here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                actions={<Button size="sm" onClick={() => buy(p.id)}>Buy</Button>}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
