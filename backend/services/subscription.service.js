import prisma from "../prisma/client.js";

const TRIAL_DAYS = 30;
const DAY_MS = 1000 * 60 * 60 * 24;

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
};

export const getAgentPlan = (agentId) =>
  prisma.subscription.findUnique({ where: { agentId } });

export const isPremium = async (agentId) => {
  const sub = await getAgentPlan(agentId);
  return sub?.plan === "PREMIUM" && (!sub.expiresAt || sub.expiresAt > new Date());
};

export async function getSubscriptionSnapshot(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agentProfile: {
        include: { subscription: true },
      },
    },
  });

  if (!user) return null;

  const now = new Date();
  const trialStartedAt = user.trialStartedAt || user.createdAt;
  const trialEndsAt = user.trialEndsAt || addDays(trialStartedAt, TRIAL_DAYS);

  const subscription = user.agentProfile?.subscription || null;
  const plan = subscription?.plan || "FREE";
  const planExpiresAt = subscription?.expiresAt || null;
  const planActive =
    plan !== "FREE" && (!planExpiresAt || new Date(planExpiresAt) > now);

  let subscriptionStatus = user.subscriptionStatus || "TRIAL";

  if (planActive) {
    subscriptionStatus = "ACTIVE";
  } else if (now < trialEndsAt) {
    subscriptionStatus = "TRIAL";
  } else {
    subscriptionStatus = "EXPIRED";
  }

  const updates = {};
  if (!user.trialStartedAt) updates.trialStartedAt = trialStartedAt;
  if (!user.trialEndsAt) updates.trialEndsAt = trialEndsAt;
  if (user.subscriptionStatus !== subscriptionStatus) {
    updates.subscriptionStatus = subscriptionStatus;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: updates });
  }

  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / DAY_MS)
  );

  return {
    subscriptionStatus,
    trialStartedAt,
    trialEndsAt,
    trialActive: now < new Date(trialEndsAt),
    trialDaysLeft,
    plan,
    planExpiresAt,
    planActive,
    paystackCustomerCode: user.paystackCustomerCode || null,
    paystackSubscriptionCode: user.paystackSubscriptionCode || null,
  };
}
