import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";
import { agentService } from "../../services/agent.service";
import { useNavigate } from "react-router-dom";
import useSubscriptionStatus from "../../hooks/useSubscriptionStatus";

export default function AgentDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    loading: subscriptionLoading,
    plan,
    subscriptionStatus,
    trialEndsAt,
    trialDaysLeft,
    trialActive,
    needsSubscription,
  } = useSubscriptionStatus();

  useEffect(() => {
    Promise.all([
      agentService.dashboard(),          // uses your backend stats :contentReference[oaicite:12]{index=12}
      agentService.getMyProperties?.(),  // if exists
      agentService.myProperties?.(),     // fallback naming
    ])
      .then(([a, b, c]) => {
        setStats(a?.data?.data || null);
        const list = (b?.data?.data || c?.data?.data || b?.data || c?.data || []).slice(0, 6);
        setRecent(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const planTone = useMemo(() => {
    if (subscriptionStatus === "ACTIVE") {
      if (plan === "PREMIUM") return "purple";
      if (plan === "BASIC") return "orange";
      return "green";
    }
    if (subscriptionStatus === "EXPIRED") return "red";
    if (trialActive) return "yellow";
    return "gray";
  }, [plan, subscriptionStatus, trialActive]);

  const badgeLabel = useMemo(() => {
    if (subscriptionStatus === "ACTIVE") {
      return plan === "BASIC" ? "STANDARD" : plan;
    }
    return subscriptionStatus || "TRIAL";
  }, [plan, subscriptionStatus]);

  const trialEndLabel = useMemo(() => {
    if (!trialEndsAt) return null;
    return trialEndsAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [trialEndsAt]);

  const showBanner = !subscriptionLoading && (trialActive || needsSubscription);
  const trialEndDisplay = trialEndLabel || "your trial end date";
  const warningTone =
    needsSubscription
      ? "border-red-200 bg-red-50"
      : trialDaysLeft <= 7
      ? "border-yellow-200 bg-yellow-50"
      : "border-orange-200 bg-orange-50";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your listings, approvals, leads and subscription.
          </p>
        </div>
        {!subscriptionLoading && badgeLabel && <Badge tone={planTone}>{badgeLabel}</Badge>}
      </div>

      {showBanner && (
        <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${warningTone}`}>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {needsSubscription
                ? `Your free month ended on ${trialEndDisplay}. Subscribe to continue posting properties.`
                : `Your free month ends on ${trialEndDisplay} (${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left). Subscribe to keep posting properties.`}
            </p>
          </div>
          <Button onClick={() => navigate("/agent/billing")}>
            {needsSubscription ? "Subscribe to continue" : "Subscribe now"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 font-semibold">Loading...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="Total Listings" subtitle="All properties you created">
              <p className="text-4xl font-extrabold text-gray-900">{stats?.total ?? 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                Tip: keep drafts updated and submit for approval.
              </p>
            </Card>

            <Card title="Quick Actions" subtitle="Move faster">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate("/agent/add-property")}
                  disabled={needsSubscription}
                  title={needsSubscription ? "Subscription required" : undefined}
                >
                  Add New Property
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/agent/drafts")}
                  disabled={needsSubscription}
                  title={needsSubscription ? "Subscription required" : undefined}
                >
                  View Drafts / Pending
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/agent/manage-properties")}
                  disabled={needsSubscription}
                  title={needsSubscription ? "Subscription required" : undefined}
                >
                  Manage Listings
                </Button>
              </div>
              {needsSubscription && (
                <p className="mt-3 text-xs font-semibold text-red-700">
                  Subscription required to post or update listings.
                </p>
              )}
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
