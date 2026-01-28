// BrowseProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PropertyCard from "../../components/property/PropertyCard";
import buyerService from "../../services/buyer.service";
import { REALVIEW_CONTACT } from "../../constants/realviewContact";

const cleanPhone = (phone) => String(phone || "").replace(/\D/g, "");

export default function BrowseProperties() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    Promise.all([buyerService.browse(), buyerService.getSaved()])
      .then(([browseRes, savedRes]) => {
        // browseRes.data might be {data: []} OR []
        const list = Array.isArray(browseRes.data) ? browseRes.data : (browseRes.data?.data || []);
        setItems(list);

        // savedRes.data might be [] of properties
        const ids = new Set((savedRes.data || []).map((p) => p.id));
        setSavedIds(ids);
      })
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return items.filter((p) => `${p.title} ${p.location}`.toLowerCase().includes(needle));
  }, [items, q]);

  const openWhatsApp = (phone, title, isRealViewContact) => {
    const p = cleanPhone(phone);
    if (!p) return alert("Agent phone number not available");
    const msg = isRealViewContact
      ? `Hello, I'm interested in "${title}" listed by Real View.`
      : `Hello, I'm interested in "${title}".`;
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const callAgent = (phone) => {
    const p = cleanPhone(phone);
    if (!p) return alert("Agent phone number not available");
    window.open(`tel:${p}`, "_self");
  };

  const toggleSave = async (propertyId) => {
    setSavingId(propertyId);
    const isSaved = savedIds.has(propertyId);

    // Optimistic UI
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    try {
      if (isSaved) await buyerService.unsaveProperty(propertyId);
      else await buyerService.saveProperty(propertyId);
    } catch (e) {
      // rollback if API fails
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Browse Properties</h1>
        <p className="text-gray-600 mt-1">Explore approved listings.</p>
      </div>

      <Card title="Search" subtitle="Fast, responsive search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location or title..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isSaved = savedIds.has(p.id);

          const isAdminListing = Boolean(p?.listedByAdmin);
          const agentPhone = p?.agent?.user?.phone || "";
          const isRealViewContact = isAdminListing || !agentPhone;
          const contactPhone = isRealViewContact ? REALVIEW_CONTACT.phone : agentPhone;

          const contactFooter = isRealViewContact ? (
            <div className="text-xs font-semibold text-gray-700">
              Real View Contact: {REALVIEW_CONTACT.phone} | {REALVIEW_CONTACT.email}
            </div>
          ) : null;

          return (
            <PropertyCard
              key={p.id}
              property={p}
              footer={contactFooter}
              actions={
                <>
                  <Button
                    variant={isSaved ? "outline" : "primary"}
                    size="sm"
                    disabled={savingId === p.id}
                    onClick={() => toggleSave(p.id)}
                  >
                    {savingId === p.id ? "Working..." : isSaved ? "Undo Save" : "Save"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!cleanPhone(contactPhone)}
                    onClick={() => callAgent(contactPhone)}
                  >
                    {isRealViewContact ? "Call Real View" : "Call Agent"}
                  </Button>

                  <Button
                    size="sm"
                    disabled={!cleanPhone(contactPhone)}
                    onClick={() => openWhatsApp(contactPhone, p.title, isRealViewContact)}
                  >
                    {isRealViewContact ? "Chat Real View" : "Chat on WhatsApp"}
                  </Button>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
