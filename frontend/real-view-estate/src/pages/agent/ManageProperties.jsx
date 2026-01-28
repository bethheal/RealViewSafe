import React, { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Modal from "../../components/ui/Modal";
import { agentService } from "../../services/agent.service";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";

export default function ManageProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: null }); // delete | sold
  const [actionLoading, setActionLoading] = useState(false);

  const [info, setInfo] = useState({ open: false, title: "", message: "" });

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      // must match your backend "agentMyProperties" in property.controller.js :contentReference[oaicite:1]{index=1}
      const res = await agentService.myProperties();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (p) => {
    // send property data to AddProperty for editing
    navigate("/agent/add-property", { state: { property: p } });
  };

  const openDelete = (p) => {
    setSelected(p);
    setConfirm({ open: true, type: "delete" });
  };

  const openSold = (p) => {
    setSelected(p);
    setConfirm({ open: true, type: "sold" });
  };

  const doDelete = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      // backend agentDelete exists :contentReference[oaicite:2]{index=2}
      await agentService.deleteProperty(selected.id);
      setConfirm({ open: false, type: null });
      setSelected(null);
      setInfo({ open: true, title: "Deleted", message: "Property has been deleted." });
      await fetchData();
    } catch (e) {
      setInfo({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Failed to delete property.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const doMarkSold = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      // backend agentMarkSold exists :contentReference[oaicite:3]{index=3}
      await agentService.markSold(selected.id);
      setConfirm({ open: false, type: null });
      setSelected(null);
      setInfo({ open: true, title: "Marked Sold", message: "Property status changed to SOLD." });
      await fetchData();
    } catch (e) {
      setInfo({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Failed to mark as sold.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-extrabold inline-flex items-center";
    if (s === "APPROVED") return <span className={`${base} bg-green-100 text-green-700`}>APPROVED</span>;
    if (s === "PENDING") return <span className={`${base} bg-yellow-100 text-yellow-700`}>PENDING</span>;
    if (s === "REJECTED") return <span className={`${base} bg-red-100 text-red-700`}>REJECTED</span>;
    if (s === "DRAFT") return <span className={`${base} bg-gray-100 text-gray-700`}>DRAFT</span>;
    if (s === "SOLD") return <span className={`${base} bg-gray-900 text-white`}>SOLD</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
  };

  const list = useMemo(() => items || [], [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Manage Properties</h1>
          <p className="text-gray-600 mt-1">Edit, delete or mark sold (real API).</p>
        </div>
        <Button onClick={() => navigate("/agent/add-property")}>Add Property</Button>
      </div>

      <Card title="My Listings" subtitle="Real data, clean actions, mobile friendly">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : list.length === 0 ? (
          <EmptyState title="No properties yet" desc="Create your first listing." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((p) => {
              const rejectionNote =
                p.status === "REJECTED" && p.rejectionReason ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    Rejection reason: {p.rejectionReason}
                  </div>
                ) : null;

              return (
                <PropertyCard
                  key={p.id}
                  property={p}
                  footer={rejectionNote}
                  actions={
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="mr-2">{statusBadge(p.status)}</div>

                      <Button variant="outline" size="sm" onClick={() => openEdit(p)} disabled={p.status === "SOLD"}>
                        Edit
                      </Button>

                      <Button variant="danger" size="sm" onClick={() => openDelete(p)}>
                        Delete
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openSold(p)}
                        disabled={p.status !== "APPROVED"} // only allow sold when approved
                        title={p.status !== "APPROVED" ? "Only approved properties can be sold" : ""}
                      >
                        Mark Sold
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* Confirm actions */}
      <ConfirmModal
        open={confirm.open && confirm.type === "delete"}
        title="Delete Property?"
        desc={`This will permanently delete "${selected?.title || ""}".`}
        confirmText="Delete"
        tone="danger"
        loading={actionLoading}
        onClose={() => setConfirm({ open: false, type: null })}
        onConfirm={doDelete}
      />

      <ConfirmModal
        open={confirm.open && confirm.type === "sold"}
        title="Mark as Sold?"
        desc={`This will set "${selected?.title || ""}" to SOLD and buyers will see it as sold.`}
        confirmText="Mark Sold"
        tone="primary"
        loading={actionLoading}
        onClose={() => setConfirm({ open: false, type: null })}
        onConfirm={doMarkSold}
      />

      {/* Info modal */}
      <Modal
        open={info.open}
        title={info.title}
        onClose={() => setInfo({ open: false, title: "", message: "" })}
        actions={<Button onClick={() => setInfo({ open: false, title: "", message: "" })}>OK</Button>}
      >
        <p className="text-gray-700 font-semibold">{info.message}</p>
      </Modal>
    </div>
  );
}
