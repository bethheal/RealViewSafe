import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import adminService from "../../services/admin.service";
import { extractImageUrls } from "../../lib/media";

const placeholderImage = "https://via.placeholder.com/120x80?text=Property";

export default function AdminProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllProperties();
      const arr = Array.isArray(res) ? res : res?.data || [];
      setItems(arr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setActionLoading(true);
    setError("");
    try {
      await adminService.reviewProperty(id, { action: "APPROVED" });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to approve property.");
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (property) => {
    setRejecting(property);
    setRejectReason("");
    setRejectOpen(true);
  };

  const closeReject = () => {
    if (actionLoading) return;
    setRejectOpen(false);
    setRejecting(null);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejecting?.id) return;
    const reason = rejectReason.trim();
    if (!reason) return;
    setActionLoading(true);
    setError("");
    try {
      await adminService.reviewProperty(rejecting.id, { action: "REJECTED", reason });
      await load();
      closeReject();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to reject property.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDelete = (property) => {
    setDeleting(property);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (actionLoading) return;
    setDeleteOpen(false);
    setDeleting(null);
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    setActionLoading(true);
    setError("");
    try {
      await adminService.deleteProperty(deleting.id);
      await load();
      closeDelete();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete property.");
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return <div className="p-4 text-red-700 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">All listings (admin and agent submissions).</p>
        </div>
        <Button onClick={() => navigate("/admin/add-property", { state: { asAdmin: true } })}>
          Add Property
        </Button>
      </div>

      <Card title="All Properties">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState title="No properties" desc="New submissions will show here." />
        ) : (
          <div className="space-y-3">
            {items.map((p) => {
              const imageUrls = extractImageUrls(p);
              return (
                <div
                  key={p.id}
                  className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      {imageUrls.length === 0 ? (
                        <div className="h-16 w-24 rounded-lg border bg-gray-50 text-[11px] text-gray-400 flex items-center justify-center">
                          No image
                        </div>
                      ) : (
                        imageUrls.slice(0, 3).map((src, idx) => (
                          <img
                            key={`${p.id}-img-${idx}`}
                            src={src || placeholderImage}
                            alt={`${p.title} ${idx + 1}`}
                            className="h-16 w-24 rounded-lg object-cover border"
                          />
                        ))
                      )}
                    </div>

                    <div>
                      <div className="font-extrabold text-gray-900">{p.title}</div>
                      <div className="text-sm text-gray-600">{p.location}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Agent: {p.agent?.user?.fullName} ({p.agent?.user?.email})
                      </div>
                      <div className="text-xs font-semibold text-gray-600 mt-1">
                        Status: {p.status}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.status === "PENDING" && (
                      <Button onClick={() => approve(p.id)} disabled={actionLoading}>
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate("/admin/add-property", { state: { property: p, asAdmin: true } })
                      }
                    >
                      Edit
                    </Button>
                    {p.status === "PENDING" && (
                      <Button variant="danger" onClick={() => openReject(p)} disabled={actionLoading}>
                        Reject
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => openDelete(p)} disabled={actionLoading}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={rejectOpen}
        title="Reject property"
        onClose={closeReject}
        actions={
          <>
            <Button variant="outline" onClick={closeReject}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm font-semibold text-gray-700">
          Add a reason for rejecting "{rejecting?.title || "this property"}".
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Reason for rejection..."
        />
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete property"
        onClose={closeDelete}
        actions={
          <>
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={actionLoading}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm font-semibold text-gray-700">
          This will permanently delete "{deleting?.title || "this property"}" and its images.
        </p>
      </Modal>
    </div>
  );
}
