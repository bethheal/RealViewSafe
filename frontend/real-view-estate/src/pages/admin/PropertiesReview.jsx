import React from 'react';  

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/data/DataTable";
import MobileList from "../../components/data/MobileList";

export default function PropertiesReview() {
  // later: api/mock
  const rows = [
    { id: "p1", title: "2 Bedroom Apartment", location: "East Legon", price: 250000, status: "PENDING" },
    { id: "p2", title: "Luxury Villa", location: "Airport Hills", price: 1200000, status: "PENDING" },
  ];

  const columns = [
    { key: "title", header: "Property", render: (r) => <p className="font-bold text-gray-900">{r.title}</p> },
    { key: "location", header: "Location" },
    { key: "price", header: "Price", render: (r) => <span className="font-extrabold text-[#F37A2A]">GH₵ {r.price.toLocaleString()}</span> },
    { key: "status", header: "Status", render: (r) => <Badge tone="yellow">{r.status}</Badge> },
    {
      key: "action",
      header: "Action",
      className: "text-center",
      tdClassName: "text-center",
      render: (r) => (
        <Button variant="outline" onClick={() => alert(`Open review ${r.id}`)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Property Reviews</h1>
        <p className="text-gray-600 mt-1">Approve or reject agent submissions.</p>
      </div>

      <Card title="Pending Properties" subtitle="Desktop table + mobile cards">
        <DataTable columns={columns} rows={rows} />

        <MobileList
          rows={rows}
          renderItem={(r) => (
            <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-extrabold text-gray-900">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {r.location}</p>
                </div>
                <Badge tone="yellow">{r.status}</Badge>
              </div>
              <p className="mt-3 font-extrabold text-[#F37A2A]">GH₵ {r.price.toLocaleString()}</p>
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => alert(`Open review ${r.id}`)}>
                  Review
                </Button>
              </div>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
