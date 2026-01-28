import prisma from "../prisma/client.js";
import { getAgentProfileByUserId } from "../services/user.service.js";
import { getSubscriptionSnapshot } from "../services/subscription.service.js";

export async function agentGetSubscription(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const snapshot = await getSubscriptionSnapshot(req.user.id);
    if (!snapshot) return res.status(404).json({ message: "Subscription not found" });

    return res.json({
      plan: snapshot.plan,
      expiresAt: snapshot.planExpiresAt,
      planActive: snapshot.planActive,
      subscriptionStatus: snapshot.subscriptionStatus,
      trialStartedAt: snapshot.trialStartedAt,
      trialEndsAt: snapshot.trialEndsAt,
      trialActive: snapshot.trialActive,
      trialDaysLeft: snapshot.trialDaysLeft,
      paystackCustomerCode: snapshot.paystackCustomerCode,
      paystackSubscriptionCode: snapshot.paystackSubscriptionCode,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function adminListSubscriptions(req, res) {
  try {
    const subs = await prisma.subscription.findMany({
      include: { agent: { include: { user: { select: { fullName: true, email: true } } } } },
      orderBy: { expiresAt: "desc" },
    });

    // normalize for your UI (agentName etc)
    const out = subs.map((s) => ({
      id: s.id,
      agentId: s.agentId,
      agentName: s.agent?.user?.fullName || "Agent",
      plan: s.plan,
      expiresAt: s.expiresAt,
    }));

    res.json(out);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function adminAssignSubscription(req, res) {
  try {
    const { agentId, plan, days } = req.body;

    if (!agentId || !plan || !days) {
      return res.status(400).json({ message: "agentId, plan, days are required" });
    }
    if (!["FREE", "BASIC", "PREMIUM"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(days));

    const sub = await prisma.subscription.upsert({
      where: { agentId },
      update: { plan, expiresAt },
      create: { agentId, plan, expiresAt },
    });

    const agent = await prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { userId: true },
    });
    if (agent?.userId) {
      await getSubscriptionSnapshot(agent.userId);
    }

    res.json(sub);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}
