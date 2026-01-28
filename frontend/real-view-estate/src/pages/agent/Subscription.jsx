import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import useSubscriptionStatus from "../../hooks/useSubscriptionStatus";
import { agentService } from "../../services/agent.service";

const plans = [
  {
    key: "BASIC",
    title: "Standard",
    price: "GHS 150 / month",
    description: "Perfect for agents starting to grow their presence.",
    features: [
      "Upload unlimited property listings",
      "Agent profile on the platform",
      "Direct inquiries from buyers & renters",
      "Basic agent dashboard",
      "Standard listing visibility",
      "Verified agent badge",
    ],
  },
  {
    key: "PREMIUM",
    title: "Premium Agent Plan",
    price: "GHS 250 / month",
    description: "Best for active agents who want more exposure.",
    highlight: true,
    features: [
      "Everything in Standard",
      "Priority listing placement",
      "Featured agent spotlight section",
      "Higher visibility in search results",
      "Monthly performance report",
      "Premium agent badge",
      "Faster support response",
    ],
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function Subscription() {
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const location = useLocation();
  const navigate = useNavigate();
  const processedRefs = useRef(new Set());
  const [actionMessage, setActionMessage] = useState("");
  const [actionTone, setActionTone] = useState("info");
  const [busyPlan, setBusyPlan] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const {
    loading,
    plan,
    subscriptionStatus,
    trialEndsAt,
    trialActive,
    trialDaysLeft,
  } = useSubscriptionStatus();

  const planLabel = useMemo(() => {
    if (plan === "BASIC") return "Standard";
    if (plan === "PREMIUM") return "Premium";
    return "Free";
  }, [plan]);

  const statusTone = useMemo(() => {
    if (subscriptionStatus === "ACTIVE") {
      if (plan === "PREMIUM") return "purple";
      if (plan === "BASIC") return "orange";
      return "green";
    }
    if (subscriptionStatus === "EXPIRED") return "red";
    if (trialActive) return "yellow";
    return "gray";
  }, [plan, subscriptionStatus, trialActive]);

  const statusLabel = useMemo(() => {
    if (subscriptionStatus === "ACTIVE") {
      return `${planLabel} (Active)`;
    }
    if (trialActive) {
      return `Trial • ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`;
    }
    return "Trial expired";
  }, [planLabel, subscriptionStatus, trialActive, trialDaysLeft]);

  const statusMessage = useMemo(() => {
    if (subscriptionStatus === "ACTIVE") {
      return `Your ${planLabel} plan is active. Billing renews monthly.`;
    }
    if (trialActive) {
      return `Your free month ends on ${formatDate(trialEndsAt)}. Subscribe to keep posting properties.`;
    }
    return `Your free month ended on ${formatDate(trialEndsAt)}. Subscribe to continue.`;
  }, [planLabel, subscriptionStatus, trialActive, trialEndsAt]);

  const bannerClass = useMemo(() => {
    if (actionTone === "success") return "border-green-200 bg-green-50 text-green-700";
    if (actionTone === "error") return "border-red-200 bg-red-50 text-red-700";
    return "border-blue-200 bg-blue-50 text-blue-700";
  }, [actionTone]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");
    if (!reference) return;
    if (processedRefs.current.has(reference)) return;
    processedRefs.current.add(reference);

    let alive = true;
    setVerifyLoading(true);
    setActionMessage("Verifying your Paystack payment...");
    setActionTone("info");

    agentService
      .verifySubscription(reference)
      .then(() => {
        if (!alive) return;
        setActionMessage("Payment verified. Your subscription is now active.");
        setActionTone("success");
      })
      .catch((err) => {
        if (!alive) return;
        setActionMessage(
          err?.response?.data?.message || "Payment verification failed. Please contact support."
        );
        setActionTone("error");
      })
      .finally(() => {
        if (!alive) return;
        setVerifyLoading(false);
        params.delete("reference");
        navigate(
          {
            pathname: location.pathname,
            search: params.toString() ? `?${params}` : "",
          },
          { replace: true }
        );
      });

    return () => {
      alive = false;
    };
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (subscriptionStatus === "ACTIVE" && !verifyLoading && actionTone !== "error") {
      setActionMessage("");
    }
  }, [subscriptionStatus, verifyLoading, actionTone]);

  const handleSubscribe = async (planKey) => {
    if (!paystackPublicKey) {
      window.alert("Missing Paystack public key. Set VITE_PAYSTACK_PUBLIC_KEY in the frontend .env.");
      return;
    }

    setBusyPlan(planKey);
    setActionMessage("");

    try {
      const res = await agentService.initializeSubscription(planKey);
      const url = res?.data?.authorization_url;
      if (!url) {
        setActionMessage("Unable to start Paystack checkout. Try again.");
        setActionTone("error");
        return;
      }
      window.location.href = url;
    } catch (err) {
      setActionMessage(
        err?.response?.data?.message || "Unable to start Paystack checkout."
      );
      setActionTone("error");
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">
            Choose a plan to keep posting and get more exposure.
          </p>
        </div>
        {!loading && <Badge tone={statusTone}>{statusLabel}</Badge>}
      </div>

      {actionMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${bannerClass}`}>
          {actionMessage}
        </div>
      )}

      <Card title="Billing Summary" subtitle="Trial status and renewal info">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Status</p>
            <p className="text-xl font-extrabold text-gray-900">{statusLabel}</p>
            <p className="text-sm text-gray-700 mt-2">{statusMessage}</p>
          </div>
          <Button onClick={() => handleSubscribe("BASIC")} disabled={verifyLoading || busyPlan}>
            {subscriptionStatus === "ACTIVE" ? "Manage billing" : "Subscribe now"}
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {plans.map((p) => {
          const isCurrent = subscriptionStatus === "ACTIVE" && plan === p.key;
          return (
            <div
              key={p.key}
              className={`rounded-2xl border p-6 shadow-sm bg-white/80 backdrop-blur-md transition
                ${p.highlight ? "border-[#F37A2A] ring-2 ring-orange-200" : "border-gray-200"}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-extrabold text-gray-900">{p.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                </div>
                {p.highlight && <Badge tone="orange">Popular</Badge>}
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-extrabold text-gray-900">{p.price}</p>
                </div>
                <Button
                  variant={isCurrent ? "outline" : "primary"}
                  onClick={() => handleSubscribe(p.key)}
                  disabled={isCurrent || busyPlan === p.key || verifyLoading}
                >
                  {isCurrent ? "Current plan" : "Subscribe"}
                </Button>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-gray-700 list-disc list-inside">
                {p.features.map((f) => (
                  <li key={f} className="font-semibold">{f}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Paystack billing starts the day you subscribe. Your free month is managed inside the app.
      </p>
    </div>
  );
}
