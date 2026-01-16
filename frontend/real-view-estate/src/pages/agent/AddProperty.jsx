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
  category: "HOUSE",
  bedrooms: "",
  bathrooms: "",
  sizeSqm: "",
  furnished: false,
  parking: false,
  media: [], // File[]
  imageUrls: [], // optional if you still allow URL mode
};

export default function AddProperty() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, status: "idle", message: "" });
  const navigate = useNavigate();
  const locationState = useLocation()?.state;
  const params = useParams();
  const editingId = params?.id || locationState?.property?.id || null;

  // Prefill when editing (from Manage → navigate with state)
  useEffect(() => {
    if (locationState?.property) {
      const p = locationState.property;
      setForm((prev) => ({
        ...prev,
        title: p.title || "",
        location: p.location || "",
        description: p.description || "",
        price: p.price ?? "",
        category: p.category || "HOUSE",
        bedrooms: p.bedrooms ?? "",
        bathrooms: p.bathrooms ?? "",
        sizeSqm: p.sizeSqm ?? "",
        furnished: !!p.furnished,
        parking: !!p.parking,
        imageUrls: p.images || (p.image ? [p.image] : []),
      }));
    }
  }, [locationState]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onPickMedia = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((p) => ({ ...p, media: [...p.media, ...files] }));
  };

  const removeMedia = (idx) => {
    setForm((p) => ({ ...p, media: p.media.filter((_, i) => i !== idx) }));
  };

const buildFormData = (mode) => {
  const fd = new FormData();

  fd.append("title", form.title);
  fd.append("location", form.location);
  fd.append("description", form.description || "");
  fd.append("price", String(form.price || ""));
  fd.append("status", mode);

  fd.append("category", form.category || "");
  fd.append("bedrooms", String(form.bedrooms || ""));
  fd.append("bathrooms", String(form.bathrooms || ""));
  fd.append("sizeSqm", String(form.sizeSqm || ""));
  fd.append("furnished", String(!!form.furnished));
  fd.append("parking", String(!!form.parking));

  // optional url images (keep if you want both URL + uploads)
  fd.append("images", JSON.stringify(form.imageUrls || []));

  // ✅ MUST MATCH multer: upload.array("media", ...)
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
            <Input label="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
            <Input label="Size (sqm)" type="number" value={form.sizeSqm} onChange={(e) => set("sizeSqm", e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
            <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 font-bold text-sm text-gray-700">
              <input type="checkbox" checked={form.furnished} onChange={(e) => set("furnished", e.target.checked)} />
              Furnished
            </label>
            <label className="inline-flex items-center gap-2 font-bold text-sm text-gray-700">
              <input type="checkbox" checked={form.parking} onChange={(e) => set("parking", e.target.checked)} />
              Parking
            </label>
          </div>

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
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={onPickMedia}
              className="mt-2 block w-full text-sm"
            />
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
                <p className="text-xs text-gray-500">
                  Note: backend must support uploads (multipart/FormData). UI is ready.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Pricing & Actions" subtitle="Save draft or submit for review" className="h-fit">
          <Input
            label="Price (GH₵)"
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
            After submitting, admin will <span className="font-extrabold">approve</span> or{" "}
            <span className="font-extrabold">reject</span>. Rejected items return to Drafts.
          </div>
        </Card>
      </form>

      <Modal
        open={modal.open}
        title={modal.status === "loading" ? "Submitting" : modal.status === "success" ? "Done" : "Error"}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
        actions={
          <>
            {modal.status === "success" && (
              <Button onClick={() => navigate("/agent/drafts")}>Check Drafts</Button>
            )}
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
