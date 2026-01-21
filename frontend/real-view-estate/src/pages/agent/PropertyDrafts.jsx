import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";

import { agentService } from "../../services/agent.service";

export default function PropertyDrafts() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [info, setInfo] = useState({ open: false, title: "", message: "" });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await agentService.getDrafts();

      // ✅ YOUR backend: res.json({ data: drafts })
      // so res.data.data is the array
      const list = res?.data?.data;

      setDrafts(Array.isArray(list) ? list : []);
    } catch (err) {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onEdit = (p) => navigate("/agent/add-property", { state: { property: p } });

  const onDelete = (p) => {
    setSelected(p);
    setConfirm({ open: true, type: "delete" });
  };

  const onMarkSold = (p) => {
    setSelected(p);
    setConfirm({ open: true, type: "sold" });
  };

  const onSubmitForReview = (p) => {
    setSelected(p);
    setConfirm({ open: true, type: "submit" });
  };

  const closeConfirm = () => {
    if (actionLoading) return;
    setConfirm({ open: false, type: null });
    setSelected(null);
  };

  const doDelete = async () => {
    if (!selected?.id) return;
    try {
      setActionLoading(true);
      await agentService.deleteProperty(selected.id);
      setInfo({ open: true, title: "Deleted", message: "Draft deleted successfully." });
      await fetchData();
    } catch (e) {
      setInfo({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Delete failed.",
      });
    } finally {
      setConfirm({ open: false, type: null });
      setSelected(null);
      setActionLoading(false);
    }
  };

  const doSold = async () => {
    if (!selected?.id) return;
    try {
      setActionLoading(true);
      await agentService.markSold(selected.id);
      setInfo({ open: true, title: "Sold", message: "Property marked as SOLD." });
      await fetchData();
    } catch (e) {
      setInfo({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Mark sold failed.",
      });
    } finally {
      setConfirm({ open: false, type: null });
      setSelected(null);
      setActionLoading(false);
    }
  };

  const doSubmit = async () => {
    if (!selected?.id) return;
    try {
      setActionLoading(true);

      // ✅ IMPORTANT:
      // updateProperty expects multipart (FormData), not a plain object
      const fd = new FormData();
      fd.append("status", "PENDING");

      await agentService.updateProperty(selected.id, fd);

      setInfo({
        open: true,
        title: "Submitted",
        message: "Submitted! Admin will review your listing.",
      });
      await fetchData();
    } catch (e) {
      setInfo({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Submit failed.",
      });
    } finally {
      setConfirm({ open: false, type: null });
      setSelected(null);
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Drafts & Pending Properties
        </h1>
        <p className="text-gray-600 mt-1">Edit, submit, or manage your unpublished listings.</p>
      </div>

      {loading ? (
        <div className="text-gray-600 font-semibold">Loading...</div>
      ) : drafts.length === 0 ? (
        <EmptyState title="No drafts found" description="Create a property to see drafts here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
                    Edit
                  </Button>

                  <Button size="sm" variant="danger" onClick={() => onDelete(p)}>
                    Delete
                  </Button>

                  <Button size="sm" onClick={() => onSubmitForReview(p)} disabled={p.status !== "DRAFT"}>
                    Submit
                  </Button>

                  <Button size="sm" onClick={() => onMarkSold(p)} disabled={p.status !== "APPROVED"}>
                    Mark Sold
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirm.open && confirm.type === "delete"}
        title="Delete Draft?"
        desc={`Delete "${selected?.title || ""}" permanently?`}
        confirmText="Yes, delete"
        cancelText="No, don’t delete"
        tone="danger"
        loading={actionLoading}
        onClose={closeConfirm}
        onConfirm={doDelete}
      />

      <ConfirmModal
        open={confirm.open && confirm.type === "sold"}
        title="Mark as Sold?"
        desc={`Mark "${selected?.title || ""}" as SOLD?`}
        confirmText="Yes, mark sold"
        cancelText="No, cancel"
        tone="primary"
        loading={actionLoading}
        onClose={closeConfirm}
        onConfirm={doSold}
      />

      <ConfirmModal
        open={confirm.open && confirm.type === "submit"}
        title="Submit for Review?"
        desc={`Submit "${selected?.title || ""}" for admin approval?`}
        confirmText="Yes, submit"
        cancelText="No, cancel"
        tone="primary"
        loading={actionLoading}
        onClose={closeConfirm}
        onConfirm={doSubmit}
      />

      <Modal
        open={info.open}
        title={info.title}
        onClose={() => setInfo({ open: false, title: "", message: "" })}
        actions={
          <>
            <Button variant="outline" onClick={() => setInfo({ open: false, title: "", message: "" })}>
              OK
            </Button>
          </>
        }
      >
        <p className="text-gray-700 font-semibold">{info.message}</p>
      </Modal>
    </div>
  );
}
