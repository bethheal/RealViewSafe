// BrowseProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import PropertyCard from "../../components/property/PropertyCard";
import buyerService from "../../services/buyer.service";
import { REALVIEW_CONTACT } from "../../constants/realviewContact";
import { formatGhs, resolveMediaUrl } from "../../lib/media";

const cleanPhone = (phone) => String(phone || "").replace(/\D/g, "");
const placeholderImage = "https://via.placeholder.com/900x600?text=Property";

const formatEnum = (value) => {
  if (!value) return "Not specified";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function BrowseProperties() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selected, setSelected] = useState(null);

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

  const closeDetails = () => setSelected(null);

  const selectedImages = Array.isArray(selected?.images) ? selected.images : [];
  const selectedImageUrls = selectedImages
    .map((img) => resolveMediaUrl(typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const heroImage = selectedImageUrls[0] || placeholderImage;
  const selectedIsAdminListing = Boolean(selected?.listedByAdmin);
  const selectedAgentPhone = selected?.agent?.user?.phone || "";
  const selectedAgentEmail = selected?.agent?.user?.email || "";
  const selectedIsRealViewContact = selectedIsAdminListing;
  const selectedContactPhone = selectedIsRealViewContact ? REALVIEW_CONTACT.phone : selectedAgentPhone;
  const selectedContactEmail = selectedIsRealViewContact ? REALVIEW_CONTACT.email : selectedAgentEmail;
  const hasContactPhone = Boolean(cleanPhone(selectedContactPhone));

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
          const isRealViewContact = isAdminListing;
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
              onClick={() => setSelected(p)}
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
                    {isRealViewContact ? "Call " : "Call Agent"}
                  </Button>

                  <Button
                    size="sm"
                    disabled={!cleanPhone(contactPhone)}
                    onClick={() => openWhatsApp(contactPhone, p.title, isRealViewContact)}
                  >
                    {isRealViewContact ? "Chat " : "Chat on WhatsApp"}
                  </Button>
                </>
              }
            />
          );
        })}
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected?.title || "Property details"}
        onClose={closeDetails}
        actions={<Button onClick={closeDetails}>Close</Button>}
      >
        {!selected ? null : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <img
                  src={heroImage}
                  alt={selected.title}
                  className="w-full h-56 object-cover rounded-xl border"
                />
                {selectedImageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedImageUrls.slice(0, 6).map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`${selected.title} ${idx + 1}`}
                        className="h-16 w-20 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Badge tone="green">{selected.status}</Badge>
                  {selected.featured && <Badge tone="orange">Featured</Badge>}
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400 font-semibold">Price</div>
                  <div className="text-lg font-extrabold text-gray-900">{formatGhs(selected.price)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400 font-semibold">Location</div>
                  <div className="font-semibold">{selected.location}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Bedrooms</div>
                    <div className="font-semibold">{selected.bedrooms ?? "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Bathrooms</div>
                    <div className="font-semibold">{selected.bathrooms ?? "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Size (sqm)</div>
                    <div className="font-semibold">{selected.sizeSqm ?? "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Type</div>
                    <div className="font-semibold">{formatEnum(selected.type)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Transaction</div>
                    <div className="font-semibold">{formatEnum(selected.transactionType)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold">Furnishing</div>
                    <div className="font-semibold">
                      {selected.furnished
                        ? "Furnished"
                        : selected.semiFurnished
                        ? "Semi-furnished"
                        : selected.unfurnished
                        ? "Unfurnished"
                        : "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-700">Description</div>
              <p className="text-sm text-gray-600 mt-1">
                {selected.description || "No description provided yet."}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-bold text-gray-700">Contact</div>
              {hasContactPhone ? (
                <div className="mt-2 text-sm text-gray-700">
                  <div className="font-semibold">
                    {selectedIsRealViewContact ? "Real View Contact" : "Agent Contact"}
                  </div>
                  <div className="text-[#F37A2A] font-extrabold">{selectedContactPhone}</div>
                  {selectedContactEmail ? (
                    <div className="text-xs text-gray-500 mt-1">{selectedContactEmail}</div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  Agent phone not available yet. Please check back later.
                </p>
              )}
              {!selectedIsRealViewContact && !selectedAgentPhone ? (
                <p className="mt-2 text-xs text-gray-500">
                  Agents should add a phone number in their profile so buyers can reach them.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
