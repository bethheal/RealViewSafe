import React, { useEffect, useState } from "react";
import adminService from "../../services/admin.service";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { resolveMediaUrl } from "../../lib/media";

const placeholderImage = "https://via.placeholder.com/800x500?text=Property";
const isImageFile = (url) => /\.(png|jpe?g|gif|webp)$/i.test(url || "");
const formatDocLabel = (doc) => {
  if (!doc) return "Document";
  if (doc.label) return doc.label;
  if (!doc.type) return "Document";
  return String(doc.type)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5">
      <div className="text-sm text-gray-500 font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [recentAgents, setRecentAgents] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getDashboard();
      const data = payload?.data || payload || {};
      setStats(data.stats);
      setRecentPending(data.recentPending || []);
      setRecentAgents(data.recentAgents || []);
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

  if (loading) return <div className="p-4">Loading...</div>;
  // Show error if present
  if (error) {
    return <div className="p-4 text-red-700 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Agents" value={stats?.agents ?? 0} />
        <Stat label="Buyers" value={stats?.buyers ?? 0} />
        <Stat label="Pending approvals" value={stats?.pending ?? 0} />
        <Stat label="Active subscriptions" value={stats?.activeSubs ?? 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">Recent pending submissions</h2>
            <span className="text-sm text-gray-500">Last 6</span>
          </div>

          <div className="mt-4 space-y-3">
            {recentPending.length === 0 ? (
              <div className="text-gray-500 text-sm">No pending properties.</div>
            ) : (
              recentPending.map((p) => {
                const images = Array.isArray(p.images) ? p.images : [];
                const imageUrls = images
                  .map((img) => resolveMediaUrl(typeof img === "string" ? img : img?.url))
                  .filter(Boolean);
                const heroImage = imageUrls[0] || placeholderImage;

                return (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex gap-3">
                        <img
                          src={heroImage}
                          alt={p.title}
                          className="w-24 h-20 rounded-lg object-cover border"
                        />
                        <div>
                          <div className="font-extrabold text-gray-900">{p.title}</div>
                          <div className="text-sm text-gray-600">{p.location}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Agent: {p.agent?.user?.fullName} ({p.agent?.user?.email})
                          </div>
                          {p.description ? (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <div className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                        {p.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button onClick={() => approve(p.id)} disabled={actionLoading}>
                              Approve
                            </Button>
                            <Button variant="danger" onClick={() => openReject(p)} disabled={actionLoading}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {imageUrls.length === 0 ? (
                        <span className="text-xs text-gray-500">No images uploaded.</span>
                      ) : (
                        imageUrls.slice(0, 4).map((src, idx) => (
                          <img
                            key={`${p.id}-${idx}`}
                            src={src}
                            alt={`${p.title} ${idx + 1}`}
                            className="h-14 w-20 rounded-lg object-cover border"
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm p-5">
            <h2 className="font-extrabold text-gray-900">Property status</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Approved</span><b>{stats?.approved ?? 0}</b></div>
              <div className="flex justify-between"><span>Rejected</span><b>{stats?.rejected ?? 0}</b></div>
              <div className="flex justify-between"><span>Sold</span><b>{stats?.sold ?? 0}</b></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-gray-900">Agent verification</h2>
              <span className="text-sm text-gray-500">Recent 6</span>
            </div>

            <div className="mt-4 space-y-3">
              {recentAgents.length === 0 ? (
                <div className="text-gray-500 text-sm">No agents found.</div>
              ) : (
                recentAgents.map((agent) => {
                  const docs = Array.isArray(agent.documents) ? agent.documents : [];
                  const verifiedCount = docs.filter((d) => d.verified).length;

                  return (
                    <div key={agent.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {agent.user?.fullName || "Unnamed Agent"}
                          </div>
                          <div className="text-xs text-gray-500">{agent.user?.email || "No email"}</div>
                        </div>
                        <Badge tone={agent.verified ? "green" : "yellow"}>
                          {agent.verified ? "VERIFIED" : "PENDING"}
                        </Badge>
                      </div>

                      {docs.length === 0 ? (
                        <div className="text-xs text-gray-500">No documents uploaded.</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {docs.slice(0, 3).map((doc) => {
                            const docUrl = resolveMediaUrl(doc.url);
                            if (!docUrl) return null;
                            return isImageFile(doc.url) ? (
                              <a
                                key={doc.id}
                                href={docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <img
                                  src={docUrl}
                                  alt={formatDocLabel(doc)}
                                  className="h-14 w-20 rounded-lg object-cover border"
                                />
                              </a>
                            ) : (
                              <a
                                key={doc.id}
                                href={docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-orange-600 underline"
                              >
                                {formatDocLabel(doc)}
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {docs.length > 0 && (
                        <div className="text-[11px] text-gray-500">
                          {verifiedCount} verified of {docs.length}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={rejectOpen}
        title="Reject property"
        onClose={closeReject}
        actions={
          <>
            <Button variant="outline" onClick={closeReject}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} disabled={actionLoading || !rejectReason.trim()}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm font-semibold text-gray-700">
          Add a reason for rejecting "{rejecting?.title || 'this property'}".
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Reason for rejection..."
        />
      </Modal>
    </div>
  );
}
