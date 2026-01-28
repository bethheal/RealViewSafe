import { useEffect, useMemo, useState } from "react";
import { agentService } from "../services/agent.service";

const DAY_MS = 1000 * 60 * 60 * 24;

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function useSubscriptionStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    agentService
      .getSubscription()
      .then((res) => {
        if (!alive) return;
        setData(res?.data || null);
        setError(false);
      })
      .catch(() => {
        if (!alive) return;
        setData(null);
        setError(true);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const trialStartedAt = useMemo(() => toDate(data?.trialStartedAt), [data?.trialStartedAt]);
  const trialEndsAt = useMemo(() => toDate(data?.trialEndsAt), [data?.trialEndsAt]);
  const planExpiresAt = useMemo(
    () => toDate(data?.expiresAt || data?.planExpiresAt),
    [data?.expiresAt, data?.planExpiresAt]
  );

  const trialDaysLeft = useMemo(() => {
    if (!trialEndsAt) return null;
    const diff = trialEndsAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / DAY_MS));
  }, [trialEndsAt]);

  const trialActive = useMemo(() => {
    if (!trialEndsAt) return false;
    return Date.now() < trialEndsAt.getTime();
  }, [trialEndsAt]);

  const subscriptionStatus = data?.subscriptionStatus || null;
  const plan = data?.plan || "FREE";
  const planActive = Boolean(data?.planActive);
  const isActive = subscriptionStatus === "ACTIVE" || planActive;
  const needsSubscription = !loading && !error && !isActive && !trialActive;

  return {
    data,
    loading,
    error,
    plan,
    planExpiresAt,
    subscriptionStatus,
    trialStartedAt,
    trialEndsAt,
    trialDaysLeft,
    trialActive,
    needsSubscription,
  };
}
