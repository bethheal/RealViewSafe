import React from 'react';

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PropertyCard from "../../components/property/PropertyCard";

export default function BrowseProperties() {
  const [q, setQ] = useState("");
  const properties = [
    { id: "b1", title: "2 Bedroom Apartment", location: "East Legon", price: 250000, status: "APPROVED", featured: true, image: "https://via.placeholder.com/800x500", agentPhone: "233201234567" },
    { id: "b2", title: "Townhouse", location: "Tema", price: 310000, status: "APPROVED", featured: false, image: "https://via.placeholder.com/800x500", agentPhone: "233501234567" },
  ];

  const filtered = properties.filter((p) =>
    (p.title + p.location).toLowerCase().includes(q.toLowerCase())
  );

  const openWhatsApp = (phone, title) => {
    const msg = `Hello, I'm interested in "${title}".`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Browse Properties</h1>
        <p className="text-gray-600 mt-1">Featured listings appear more often.</p>
      </div>

      <Card title="Search" subtitle="Fast, responsive search (filters can be added next)">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location or title..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => alert(`Save ${p.id}`)}>Save</Button>
                <Button size="sm" onClick={() => openWhatsApp(p.agentPhone, p.title)}>Chat on WhatsApp</Button>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
