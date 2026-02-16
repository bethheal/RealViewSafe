import prisma from "../prisma/client.js";
import { getSubscriptionSnapshot } from "../services/subscription.service.js";

/* ---------------- helpers ---------------- */
const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;
const toNumOrNull = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
const parsePrice = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const num = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return Math.round(num);
};
const ADMIN_ALLOWED_STATUSES = ["DRAFT", "APPROVED", "PENDING", "REJECTED", "SOLD", "RENTED"];

function normalizeFurnishing({ furnished, semiFurnished, unfurnished }) {
  const f = toBool(furnished);
  const sf = toBool(semiFurnished);
  const uf = toBool(unfurnished);

  if (!f && !sf && !uf) {
    return { furnished: false, semiFurnished: false, unfurnished: true };
  }
  if (f) return { furnished: true, semiFurnished: false, unfurnished: false };
  if (sf) return { furnished: false, semiFurnished: true, unfurnished: false };
  return { furnished: false, semiFurnished: false, unfurnished: true };
}

async function getAdminAgentProfileId(userId) {
  const existing = await prisma.agentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing?.id) return existing.id;

  const created = await prisma.agentProfile.create({ data: { userId } });
  return created.id;
}

async function logAdminAction({ adminId, action, entityType, entityId, details }) {
  try {
    if (!adminId || !action || !entityType) return;
    if (!prisma.auditLog?.create) return;
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: entityId || null,
        details: details || undefined,
      },
    });
  } catch (err) {
    console.error("audit log failed:", err);
  }
}

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
      recentAgents,
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
      prisma.agentProfile.findMany({
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          documents: { orderBy: { createdAt: "desc" }, take: 3 },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return res.json({
      data: {
        stats: { agents, buyers, pending, approved, rejected, sold, activeSubs },
        recentPending,
        recentAgents,
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

    await logAdminAction({
      adminId: req.user.id,
      action: "AGENT_SUSPEND",
      entityType: "AgentProfile",
      entityId: updated.id,
      details: { suspended: Boolean(suspended) },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("suspendAgent error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * PATCH /admin/agents/:id/verify
 * body: { verified: boolean }
 */
export const verifyAgent = async (req, res) => {
  try {
    const { verified } = req.body;

    const updated = await prisma.agentProfile.update({
      where: { id: req.params.id },
      data: { verified: Boolean(verified) },
      include: {
        user: { select: { fullName: true, email: true } },
        subscription: true,
        documents: true,
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: verified ? "AGENT_APPROVED" : "AGENT_REJECTED",
      entityType: "AgentProfile",
      entityId: updated.id,
      details: { verified: Boolean(verified) },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("verifyAgent error:", err);
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
    if (action === "REJECTED" && !reason) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        status: action,
        rejectionReason: action === "REJECTED" ? reason : null,
      },
      include: {
        images: true,
        agent: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: "PROPERTY_REVIEW",
      entityType: "Property",
      entityId: updated.id,
      details: { status: action, reason: action === "REJECTED" ? reason : null },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("reviewProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * POST /admin/properties
 * Admin can create property (defaults to APPROVED)
 */
export const addAdminProperty = async (req, res) => {
  try {
    const agentProfileId = await getAdminAgentProfileId(req.user.id);

    const {
      title,
      location,
      description,
      price,
      status,
      type,
      transactionType,
      category,
      bedrooms,
      bathrooms,
      sizeSqm,
      furnished,
      semiFurnished,
      unfurnished,
    } = req.body;

    if (!title || !location || price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "title, location, and price are required" });
    }
    const priceValue = parsePrice(price);
    if (priceValue === null) {
      return res.status(400).json({ message: "price must be a valid number" });
    }

    const requestedStatus = String(status || "APPROVED").toUpperCase();
    if (!ADMIN_ALLOWED_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({ message: "Invalid status for admin submission" });
    }
    if (requestedStatus === "REJECTED") {
      return res.status(400).json({ message: "Rejected status requires review flow" });
    }

    const furnishing = normalizeFurnishing({ furnished, semiFurnished, unfurnished });
    const files = Array.isArray(req.files) ? req.files : [];
    const imageCreates = files.map((file) => ({ url: `/uploads/${file.filename}` }));

    const created = await prisma.property.create({
      data: {
        agentId: agentProfileId,
        title,
        location,
        description: description || null,
        price: priceValue,

        status: requestedStatus,
        listedByAdmin: true,
        type: type || "HOUSE",
        transactionType: transactionType || "SALE",
        category: category ? category : null,

        bedrooms: toNumOrNull(bedrooms),
        bathrooms: toNumOrNull(bathrooms),
        sizeSqm: toNumOrNull(sizeSqm),

        furnished: furnishing.furnished,
        semiFurnished: furnishing.semiFurnished,
        unfurnished: furnishing.unfurnished,

        images: { create: imageCreates },
      },
      include: { images: true },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: "PROPERTY_CREATE_ADMIN",
      entityType: "Property",
      entityId: created.id,
      details: { status: created.status, listedByAdmin: true },
    });

    return res.json({ data: created });
  } catch (err) {
    console.error("addAdminProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * PATCH /admin/properties/:id
 * Admin can edit any property
 */
export const updateAdminProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ message: "Property not found" });

    const {
      title,
      location,
      description,
      price,
      status,
      reason,
      type,
      transactionType,
      category,
      bedrooms,
      bathrooms,
      sizeSqm,
      furnished,
      semiFurnished,
      unfurnished,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (location !== undefined) data.location = location;
    if (description !== undefined) data.description = description || null;
    if (price !== undefined) {
      const priceValue = parsePrice(price);
      if (priceValue === null) {
        return res.status(400).json({ message: "price must be a valid number" });
      }
      data.price = priceValue;
    }

    if (type !== undefined) data.type = type;
    if (transactionType !== undefined) data.transactionType = transactionType;
    if (category !== undefined) data.category = category ? category : null;

    if (bedrooms !== undefined) data.bedrooms = bedrooms === "" ? null : Number(bedrooms);
    if (bathrooms !== undefined) data.bathrooms = bathrooms === "" ? null : Number(bathrooms);
    if (sizeSqm !== undefined) data.sizeSqm = sizeSqm === "" ? null : Number(sizeSqm);

    const anyFurnishingProvided =
      furnished !== undefined || semiFurnished !== undefined || unfurnished !== undefined;
    if (anyFurnishingProvided) {
      const furnishing = normalizeFurnishing({ furnished, semiFurnished, unfurnished });
      data.furnished = furnishing.furnished;
      data.semiFurnished = furnishing.semiFurnished;
      data.unfurnished = furnishing.unfurnished;
    }

    if (status !== undefined) {
      const requestedStatus = String(status || "").toUpperCase();
      if (!ADMIN_ALLOWED_STATUSES.includes(requestedStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (requestedStatus === "REJECTED") {
        if (!reason) return res.status(400).json({ message: "Rejection reason required" });
        data.rejectionReason = reason;
      } else {
        data.rejectionReason = null;
      }
      data.status = requestedStatus;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length > 0) {
      data.images = {
        create: files.map((file) => ({ url: `/uploads/${file.filename}` })),
      };
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data,
      include: { images: true },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: "PROPERTY_UPDATE_ADMIN",
      entityType: "Property",
      entityId: updated.id,
      details: { status: updated.status },
    });

    return res.json({ data: updated });
  } catch (err) {
    console.error("updateAdminProperty error:", err);
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

    const agent = await prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { userId: true },
    });
    if (agent?.userId) {
      await getSubscriptionSnapshot(agent.userId);
    }

    const shouldSuspend = plan === "FREE" || (expiresAt && expiresAt <= new Date());

    await prisma.agentProfile.update({
      where: { id: agentId },
      data: { suspended: Boolean(shouldSuspend) },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: "SUBSCRIPTION_ASSIGN",
      entityType: "Subscription",
      entityId: sub.id,
      details: { agentId, plan, days, expiresAt },
    });

    return res.json({ data: sub });
  } catch (err) {
    console.error("assignSubscription error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
