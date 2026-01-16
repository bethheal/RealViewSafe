import prisma from "../prisma/client.js";

/**
 * GET /admin/dashboard
 */
export const dashboard = async (req, res) => {
  const [
    agents,
    buyers,
    pending,
    approved,
    rejected,
    sold,
    activeSubs,
    recentPending,
  ] = await Promise.all([
    prisma.agentProfile.count(),
    prisma.buyerProfile.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "APPROVED" } }),
    prisma.property.count({ where: { status: "REJECTED" } }),
    prisma.property.count({ where: { status: "SOLD" } }),
    prisma.subscription.count({
      where: {
        expiresAt: { gt: new Date() },
        plan: { not: "FREE" },
      },
    }),
    prisma.property.findMany({
      where: { status: "PENDING" },
      include: {
        agent: { include: { user: { select: { fullName: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  res.json({
    stats: { agents, buyers, pending, approved, rejected, sold, activeSubs },
    recentPending,
  });
};

/**
 * GET /admin/agents
 */
export const listAgents = async (req, res) => {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
      subscription: true,
      _count: { select: { properties: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(agents);
};

/**
 * PATCH /admin/agents/:id/suspend
 * body: { suspended: boolean }
 */
export const suspendAgent = async (req, res) => {
  const { suspended } = req.body;

  const updated = await prisma.agentProfile.update({
    where: { id: req.params.id },
    data: { suspended: Boolean(suspended) },
    include: {
      user: { select: { fullName: true, email: true } },
      subscription: true,
    },
  });

  res.json(updated);
};

/**
 * GET /admin/buyers
 * returns buyers + purchases + property + agent
 */
export const listBuyersWithPurchases = async (req, res) => {
  const buyers = await prisma.buyerProfile.findMany({
    include: {
      user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
      purchases: {
        include: {
          property: {
            include: {
              agent: { include: { user: { select: { fullName: true, email: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(buyers);
};

/**
 * GET /admin/properties
 * pending queue
 */
export const listPendingProperties = async (req, res) => {
  const props = await prisma.property.findMany({
    where: { status: "PENDING" },
    include: {
      agent: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(props);
};

/**
 * PATCH /admin/properties/:id/review
 * body: { action: "APPROVED"|"REJECTED", reason?: string }
 */
export const reviewProperty = async (req, res) => {
  const { action, reason } = req.body;

  if (!["APPROVED", "REJECTED"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const updated = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      status: action,
      rejectionReason: action === "REJECTED" ? (reason || "Rejected by admin") : null,
    },
  });

  res.json(updated);
};

/**
 * GET /admin/subscriptions
 * list agents + subscription
 */
export const listSubscriptions = async (req, res) => {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(agents);
};

/**
 * POST /admin/subscriptions
 * body: { agentId, plan, days }
 */
export const assignSubscription = async (req, res) => {
  const { agentId, plan, days } = req.body;

  const allowed = ["FREE", "BASIC", "PRO", "PREMIUM"];
  if (!allowed.includes(plan)) return res.status(400).json({ message: "Invalid plan" });

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

  // optional: if plan is FREE or expiresAt null/past, suspend agent immediately
  const shouldSuspend =
    plan === "FREE" || (expiresAt && expiresAt <= new Date());

  if (shouldSuspend) {
    await prisma.agentProfile.update({
      where: { id: agentId },
      data: { suspended: true },
    });
  } else {
    await prisma.agentProfile.update({
      where: { id: agentId },
      data: { suspended: false },
    });
  }

  res.json(sub);
};
