import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import { agentService } from "../../services/agent.service";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      agentService.dashboard(),          // uses your backend stats :contentReference[oaicite:12]{index=12}
      agentService.getMyProperties?.(),  // if exists
      agentService.myProperties?.(),     // fallback naming
    ])
      .then(([a, b, c]) => {
        setStats(a?.data || null);
        const list = (b?.data || c?.data || []).slice(0, 6);
        setRecent(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const planTone = useMemo(() => {
    const p = stats?.subscription || "FREE";
    if (p === "PREMIUM") return "purple";
    if (p === "BASIC") return "blue";
    return "gray";
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your listings, approvals, leads and subscription.
          </p>
        </div>
        {stats?.subscription && <Badge tone={planTone}>{stats.subscription}</Badge>}
      </div>

      {loading ? (
        <div className="text-gray-600 font-semibold">Loading...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="Total Listings" subtitle="All properties you created">
              <p className="text-4xl font-extrabold text-gray-900">{stats?.properties ?? 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                Tip: keep drafts updated and submit for approval.
              </p>
            </Card>

            <Card title="Quick Actions" subtitle="Move faster">
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/agent/add-property")}>Add New Property</Button>
                <Button variant="outline" onClick={() => navigate("/agent/drafts")}>
                  View Drafts / Pending
                </Button>
                <Button variant="outline" onClick={() => navigate("/agent/manage-properties")}>
                  Manage Listings
                </Button>
              </div>
            </Card>

            <Card title="Approval Flow" subtitle="How it works">
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-extrabold">Draft</span> → you can edit anytime</p>
                <p><span className="font-extrabold">Pending</span> → admin reviewing</p>
                <p><span className="font-extrabold">Approved</span> → visible to buyers</p>
                <p><span className="font-extrabold">Rejected</span> → fix & resubmit</p>
              </div>
            </Card>
          </div>

          <Card title="Recent Listings" subtitle="Your latest properties">
            {recent.length === 0 ? (
              <EmptyState
                title="No properties yet"
                desc="Create your first listing to start getting leads."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    actions={
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate("/agent/manage-properties")}>
                          Manage
                        </Button>
                        <Button size="sm" onClick={() => navigate("/agent/drafts")}>
                          Drafts
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
