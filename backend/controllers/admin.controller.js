import prisma from "../prisma/client.js";

/**
 * Dashboard summary
 */
export const dashboard = async (req, res) => {
  const agents = await prisma.agentProfile.count();
  const buyers = await prisma.buyerProfile.count();

  const pending = await prisma.property.count({ where: { status: "PENDING" } });
  const approved = await prisma.property.count({ where: { status: "APPROVED" } });
  const rejected = await prisma.property.count({ where: { status: "REJECTED" } });

  const activeSubs = await prisma.subscription.count({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  res.json({ agents, buyers, pending, approved, rejected, activeSubs });
};

/**
 * List Agents (with User + Subscription)
 */
export const listAgents = async (req, res) => {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true } },
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(agents);
};

/**
 * Suspend / Unsuspend Agent
 */
export const setAgentSuspended = async (req, res) => {
  const { suspended } = req.body;

  const updated = await prisma.agentProfile.update({
    where: { id: req.params.id },
    data: { suspended: Boolean(suspended) },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      subscription: true,
    },
  });

  res.json(updated);
};

/**
 * List Buyers
 */
export const listBuyers = async (req, res) => {
  const buyers = await prisma.buyerProfile.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(buyers);
};

/**
 * Pending properties queue (admin review)
 */
export const listPendingProperties = async (req, res) => {
  const properties = await prisma.property.findMany({
    where: { status: "PENDING" },
    include: {
      agent: {
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(properties);
};

/**
 * Approve / Reject property
 * body: { action: "APPROVED" | "REJECTED", reason?: string }
 */
export const reviewProperty = async (req, res) => {
  const { action, reason } = req.body;

  if (!["APPROVED", "REJECTED"].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Use APPROVED or REJECTED." });
  }

  const property = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      status: action,
      rejectionReason: action === "REJECTED" ? (reason || "Rejected by admin") : null,
    },
  });

  res.json(property);
};

/**
 * List subscriptions (agent + user + subscription)
 */
export const listSubscriptions = async (req, res) => {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(agents);
};

/**
 * Assign / Update subscription
 * body: { agentId, plan, days? }
 */
export const assignSubscription = async (req, res) => {
  const { agentId, plan, days } = req.body;

  const validPlans = ["FREE", "BASIC", "PRO", "PREMIUM"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  let expiresAt = null;
  if (typeof days === "number" && days > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  const sub = await prisma.subscription.upsert({
    where: { agentId },
    update: { plan, expiresAt },
    create: { agentId, plan, expiresAt },
  });

  res.json(sub);
};
