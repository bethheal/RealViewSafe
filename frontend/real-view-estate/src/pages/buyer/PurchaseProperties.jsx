import React from 'react';

import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import  buyerService  from "../../services/buyer.service";
import { REALVIEW_CONTACT } from "../../constants/realviewContact";

export default function PurchaseProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerService.getPurchases()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Properties Bought</h1>
        <p className="text-gray-600 mt-1">Your purchase history.</p>
      </div>

      <Card title="Purchases" subtitle="Completed purchases appear here">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState title="No purchases" desc="When you buy a property it will show here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
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
