
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { agentService } from "../../services/agent.service";

const plans = [
  {
    key: "FREE",
    title: "Free",
    tone: "gray",
    features: ["Basic listing visibility", "Standard support", "Manual follow-ups"],
  },
  {
    key: "BASIC",
    title: "Basic",
    tone: "blue",
    features: ["Better visibility", "Appears more in featured", "Priority support"],
  },
  {
    key: "PREMIUM",
    title: "Premium",
    tone: "purple",
    features: ["Top visibility", "Highest featured priority", "Fastest support"],
  },
];

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const d = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return d;
}

export default function Subscription() {
  const [sub, setSub] = useState(null);

  useEffect(() => {
    agentService.getSubscription().then((res) => setSub(res.data));
  }, []);

  const current = sub?.plan || "FREE";
  const left = useMemo(() => daysLeft(sub?.expiresAt), [sub?.expiresAt]);
  const active = !!sub?.expiresAt && left != null && left > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Subscription</h1>
          <p className="text-gray-600 mt-1">Plans control featured priority and visibility.</p>
        </div>
        <Badge tone={plans.find((p) => p.key === current)?.tone || "gray"}>{current}</Badge>
      </div>

      <Card title="Your Status" subtitle="Expiry and current plan">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Current plan</p>
            <p className="text-2xl font-extrabold text-gray-900">{current}</p>
            <p className="text-sm text-gray-700 mt-1">
              {current === "FREE"
                ? "You’re on Free. Upgrade for more visibility."
                : active
                ? `Active • ${left} day(s) left`
                : "Expired • Contact admin to renew"}
            </p>
          </div>

          <Button onClick={() => alert("Hook Paystack later / admin flow")}>
            Upgrade Plan
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = p.key === current;
          return (
            <div
              key={p.key}
              className={`rounded-2xl border shadow-sm p-4 bg-white/70 backdrop-blur-md
                ${isCurrent ? "border-orange-300 ring-2 ring-orange-200" : "border-white/40"}
              `}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold text-gray-900">{p.title}</p>
                <Badge tone={p.tone}>{p.key}</Badge>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f} className="font-semibold">• {f}</li>
                ))}
              </ul>

              <div className="mt-4">
                <Button
                  variant={isCurrent ? "outline" : "primary"}
                  onClick={() => alert("Upgrade flow later")}
                  className="w-full"
                >
                  {isCurrent ? "Current Plan" : "Choose Plan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
