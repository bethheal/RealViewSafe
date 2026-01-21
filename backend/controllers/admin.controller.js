import prisma from "../prisma/client.js";

/**
 * GET /admin/dashboard
 */
export const dashboard = async (req, res) => {
  try {
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
          agent: {
            include: { user: { select: { fullName: true, email: true } } },
          },
          images: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return res.json({
      data: {
        stats: { agents, buyers, pending, approved, rejected, sold, activeSubs },
        recentPending,
      },
    });
  } catch (err) {
    console.error("admin dashboard error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /admin/agents
 */
export const listAgents = async (req, res) => {
  try {
    const agents = await prisma.agentProfile.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, phone: true, createdAt: true },
        },
        subscription: true,
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: agents });
  } catch (err) {
    console.error("listAgents error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * PATCH /admin/agents/:id/suspend
 * body: { suspended: boolean }
 */
export const suspendAgent = async (req, res) => {
  try {
    const { suspended } = req.body;

    const updated = await prisma.agentProfile.update({
      where: { id: req.params.id },
      data: { suspended: Boolean(suspended) },
      include: {
        user: { select: { fullName: true, email: true } },
        subscription: true,
      },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("suspendAgent error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /admin/buyers
 * returns buyers + purchases + property + agent
 */
export const listBuyersWithPurchases = async (req, res) => {
  try {
    const buyers = await prisma.buyerProfile.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, phone: true, createdAt: true },
        },
        purchases: {
          include: {
            property: {
              include: {
                images: true,
                agent: {
                  include: {
                    user: { select: { fullName: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: buyers });
  } catch (err) {
    console.error("listBuyersWithPurchases error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * ✅ NEW
 * GET /admin/properties
 * Optional filter: /admin/properties?status=PENDING|APPROVED|REJECTED|SOLD|DRAFT
 * - If status not provided: returns all statuses
 */
export const listProperties = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const props = await prisma.property.findMany({
      where,
      include: {
        agent: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: props });
  } catch (err) {
    console.error("listProperties error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /admin/properties/pending
 * pending queue
 */
export const listPendingProperties = async (req, res) => {
  try {
    const props = await prisma.property.findMany({
      where: { status: "PENDING" },
      include: {
        agent: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: props });
  } catch (err) {
    console.error("listPendingProperties error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * PATCH /admin/properties/:id/review
 * body: { action: "APPROVED"|"REJECTED", reason?: string }
 */
export const reviewProperty = async (req, res) => {
  try {
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
      include: {
        images: true,
        agent: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
      },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("reviewProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /admin/subscriptions
 * list agents + subscription
 */
export const listSubscriptions = async (req, res) => {
  try {
    const agents = await prisma.agentProfile.findMany({
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: agents });
  } catch (err) {
    console.error("listSubscriptions error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * POST /admin/subscriptions
 * body: { agentId, plan, days }
 */
export const assignSubscription = async (req, res) => {
  try {
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

    const shouldSuspend = plan === "FREE" || (expiresAt && expiresAt <= new Date());

    await prisma.agentProfile.update({
      where: { id: agentId },
      data: { suspended: Boolean(shouldSuspend) },
    });

    return res.json({ data: sub });
  } catch (err) {
    console.error("assignSubscription error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
