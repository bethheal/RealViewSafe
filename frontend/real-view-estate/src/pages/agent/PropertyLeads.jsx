import React  from 'react'
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { agentService } from "../../services/agent.service";

export default function PropertyLead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentService.getLeads()
      .then((res) => setLeads(res.data))
      .finally(() => setLoading(false));
  }, []);

 const openWhatsApp = (lead) => {
  const phone = lead.buyerPhone || lead.buyer?.phone;
  if (!phone) {
    alert("Buyer phone not available yet."); // optional: replace with modal
    return;
  }
  const name = lead.buyerName || lead.buyer?.fullName || "there";
  const title = lead.propertyTitle || lead.property?.title || "your listing";
  const msg = `Hello ${name}, thanks for reaching out about "${title}".`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Property Leads</h1>
        <p className="text-gray-600 mt-1">People who contacted you via WhatsApp.</p>
      </div>

      <Card title="Leads" subtitle="Use this to follow up fast">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : leads.length === 0 ? (
          <EmptyState title="No leads yet" desc="When buyers contact you, they will appear here." />
        ) : (
          <div className="space-y-3">
            {leads.map((l) => (
              <div key={l.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-extrabold text-gray-900">{l.buyerName}</p>
                  <p className="text-sm text-gray-600 mt-1">Interested in: <span className="font-bold">{l.propertyTitle}</span></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(l.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button onClick={() => openWhatsApp(l.buyerName, l.propertyTitle)}>
                  Reply on WhatsApp
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
