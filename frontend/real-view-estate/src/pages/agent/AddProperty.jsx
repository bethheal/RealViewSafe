import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { agentService } from "../../services/agent.service";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const empty = {
  title: "",
  location: "",
  description: "",
  price: "",

  type: "HOUSE",
  transactionType: "SALE",

  // optional (will be null/empty for LAND)
  category: "HOUSE",

  bedrooms: "",
  bathrooms: "",
  sizeSqm: "",

  // ✅ store ONE furnishing choice
  furnishing: "UNFURNISHED", // FURNISHED | SEMI_FURNISHED | UNFURNISHED

  media: [], // File[]
  imageUrls: [], // URL images (optional)
};

export default function AddProperty() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, status: "idle", message: "" });

  const navigate = useNavigate();
  const locationState = useLocation()?.state;
  const params = useParams();
  const editingId = params?.id || locationState?.property?.id || null;

  const isLand = form.type === "LAND";

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Prefill when editing
  useEffect(() => {
    if (locationState?.property) {
      const p = locationState.property;

      const furnishing =
        p?.furnished ? "FURNISHED" : p?.semiFurnished ? "SEMI_FURNISHED" : "UNFURNISHED";

      setForm((prev) => ({
        ...prev,
        title: p.title || "",
        location: p.location || "",
        description: p.description || "",
        price: p.price ?? "",

        type: p.type || "HOUSE",
        transactionType: p.transactionType || "SALE",
        category: p.category || (p.type === "LAND" ? "" : "HOUSE"),

        bedrooms: p.bedrooms ?? "",
        bathrooms: p.bathrooms ?? "",
        sizeSqm: p.sizeSqm ?? "",

        furnishing,

        imageUrls: Array.isArray(p.images)
          ? p.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
          : p.image
          ? [p.image]
          : [],
      }));
    }
  }, [locationState]);

  // When switching to LAND, clear building-only fields + category + furnishing
  useEffect(() => {
    if (form.type === "LAND") {
      setForm((p) => ({
        ...p,
        category: "",
        bedrooms: "",
        bathrooms: "",
        furnishing: "UNFURNISHED",
      }));
    } else {
      setForm((p) => ({
        ...p,
        category: p.category || "HOUSE",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  const onPickMedia = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((p) => ({ ...p, media: [...p.media, ...files] }));
  };

  const removeMedia = (idx) => {
    setForm((p) => ({ ...p, media: p.media.filter((_, i) => i !== idx) }));
  };

  // ✅ convert ONE furnishing to 3 booleans (backend expects booleans)
  const furnishingBooleans = useMemo(() => {
    if (isLand) {
      return { furnished: false, semiFurnished: false, unfurnished: false };
    }

    if (form.furnishing === "FURNISHED") {
      return { furnished: true, semiFurnished: false, unfurnished: false };
    }
    if (form.furnishing === "SEMI_FURNISHED") {
      return { furnished: false, semiFurnished: true, unfurnished: false };
    }
    return { furnished: false, semiFurnished: false, unfurnished: true };
  }, [form.furnishing, isLand]);

  const buildFormData = (mode) => {
    const fd = new FormData();

    fd.append("title", form.title);
    fd.append("location", form.location);
    fd.append("description", form.description || "");
    fd.append("price", String(form.price || ""));
    fd.append("status", mode);

    fd.append("type", form.type || "HOUSE");
    fd.append("transactionType", form.transactionType || "SALE");

    fd.append("category", form.type === "LAND" ? "" : (form.category || ""));

    fd.append("sizeSqm", String(form.sizeSqm || ""));

    // Building-only fields (do not send for LAND)
    if (form.type !== "LAND") {
      fd.append("bedrooms", String(form.bedrooms || ""));
      fd.append("bathrooms", String(form.bathrooms || ""));

      // ✅ consistent single-choice furnishing
      fd.append("furnished", String(furnishingBooleans.furnished));
      fd.append("semiFurnished", String(furnishingBooleans.semiFurnished));
      fd.append("unfurnished", String(furnishingBooleans.unfurnished));
    } else {
      fd.append("bedrooms", "");
      fd.append("bathrooms", "");
      fd.append("furnished", "false");
      fd.append("semiFurnished", "false");
      fd.append("unfurnished", "false");
    }

    fd.append("images", JSON.stringify(form.imageUrls || []));

    // MUST MATCH multer upload.array("media")
    (form.media || []).forEach((file) => fd.append("media", file));

    return fd;
  };

  const submit = async (e, mode = "PENDING") => {
    e.preventDefault();
    setLoading(true);
    setModal({ open: true, status: "loading", message: "Submitting your property..." });

    try {
      const fd = buildFormData(mode);

      if (editingId) {
        await agentService.updateProperty(editingId, fd);
      } else {
        await agentService.addProperty(fd);
      }

      setModal({
        open: true,
        status: "success",
        message:
          mode === "DRAFT"
            ? "Saved to Drafts. You can edit and submit anytime."
            : "Submitted! Admin will review and approve or reject.",
      });

      if (!editingId) setForm(empty);
    } catch (err) {
      setModal({
        open: true,
        status: "error",
        message: err?.response?.data?.message || "Failed to submit. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {editingId ? "Edit Property" : "Add Property"}
        </h1>
        <p className="text-gray-600 mt-1">
          {editingId ? "Update your listing details." : "Create a listing for admin approval."}
        </p>
      </div>

      <form className="grid lg:grid-cols-3 gap-6">
        <Card title="Property Details" subtitle="Make it clear and attractive" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-bold text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="HOUSE">HOUSE</option>
                <option value="APARTMENT">APARTMENT</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="LAND">LAND</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Transaction Type</label>
              <select
                value={form.transactionType}
                onChange={(e) => set("transactionType", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="SALE">SALE</option>
                <option value="RENT">RENT</option>
                <option value="LEASE">LEASE</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {!isLand ? (
              <div>
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="HOUSE">HOUSE</option>
                  <option value="APARTMENT">APARTMENT</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                </select>
              </div>
            ) : (
              <div className="text-sm font-bold text-gray-700 flex items-end">LAND (no category needed)</div>
            )}

            <Input
              label={isLand ? "Land Size (sqm)" : "Size (sqm)"}
              type="number"
              value={form.sizeSqm}
              onChange={(e) => set("sizeSqm", e.target.value)}
            />
          </div>

          {!isLand && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
              <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
            </div>
          )}

          {/* ✅ single-choice furnishing */}
          {!isLand && (
            <div className="mt-4">
              <label className="text-sm font-bold text-gray-700">Furnishing</label>
              <select
                value={form.furnishing}
                onChange={(e) => set("furnishing", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="UNFURNISHED">UNFURNISHED</option>
                <option value="SEMI_FURNISHED">SEMI-FURNISHED</option>
                <option value="FURNISHED">FURNISHED</option>
              </select>
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Describe the property, neighborhood, utilities, payment terms..."
              required
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-bold text-gray-700">Media Upload (Images / Videos)</label>
            <input type="file" multiple accept="image/*,video/*" onChange={onPickMedia} className="mt-2 block w-full text-sm" />

            {form.media.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.media.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{f.name}</p>
                    <button type="button" onClick={() => removeMedia(idx)} className="text-sm font-extrabold text-red-600">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Pricing & Actions" subtitle="Save draft or submit for review" className="h-fit">
          <Input
            label={form.transactionType === "SALE" ? "Price (GH₵)" : "Rent (GH₵)"}
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />

          <div className="mt-4 grid gap-2">
            <Button disabled={loading} onClick={(e) => submit(e, "PENDING")}>
              {loading ? "Submitting..." : editingId ? "Save Changes" : "Submit for Review"}
            </Button>

            {!editingId && (
              <Button variant="outline" disabled={loading} onClick={(e) => submit(e, "DRAFT")}>
                Save as Draft
              </Button>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-600">
            After submitting, admin will <span className="font-extrabold">approve</span> or <span className="font-extrabold">reject</span>.
            Rejected items return to Drafts.
          </div>
        </Card>
      </form>

      <Modal
        open={modal.open}
        title={modal.status === "loading" ? "Submitting" : modal.status === "success" ? "Done" : "Error"}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
        actions={
          <>
            {modal.status === "success" && <Button onClick={() => navigate("/agent/drafts")}>Check Drafts</Button>}
            <Button variant="outline" onClick={() => setModal((p) => ({ ...p, open: false }))}>
              OK
            </Button>
          </>
        }
      >
        <p className="text-gray-700 font-semibold">{modal.message}</p>
      </Modal>
    </div>
  );
}
