import prisma from "../prisma/client.js";
import { getAgentProfileByUserId } from "../services/user.service.js";

export async function publicBrowse(req, res) {
  try {
    // Buyer browse uses priority; keep route here for general /properties public listing
    const properties = await prisma.property.findMany({
      where: { status: "APPROVED" },
      include: {
        agent: { include: { user: { select: { fullName: true, phone: true } }, subscription: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // sort by subscription priority (active) then newest
    const now = new Date();
    const score = (sub) => {
      const active = sub?.expiresAt && new Date(sub.expiresAt) > now;
      if (!active) return 1;
      if (sub.plan === "PREMIUM") return 3;
      if (sub.plan === "BASIC") return 2;
      return 1;
    };

    properties.sort((a, b) => {
      const aScore = score(a.agent?.subscription);
      const bScore = score(b.agent?.subscription);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ data: properties });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function publicGetById(req, res) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { agent: { include: { user: { select: { fullName: true, phone: true } } } } },
    });

    if (!property || property.status !== "APPROVED") {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: create property -> default PENDING (or DRAFT if sent) */
export async function agentCreate(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const { title, description, location, price, status } = req.body;

    const created = await prisma.property.create({
      data: {
        agentId: agent.id,
        title,
        description,
        location,
        price: Number(price),
        status: status === "DRAFT" ? "DRAFT" : "PENDING",
      },
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: list all my properties */
export async function agentMyProperties(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const items = await prisma.property.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: drafts */
export async function agentDrafts(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const items = await prisma.property.findMany({
      where: { agentId: agent.id, status: { in: ["DRAFT", "PENDING", "REJECTED"] } },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: update property (ownership enforced) */
export async function agentUpdate(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const property = await prisma.property.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!property) return res.status(403).json({ message: "Not your property" });

    // Block editing if SOLD (recommended)
    if (property.status === "SOLD") {
      return res.status(400).json({ message: "Cannot edit a sold property" });
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        title: req.body.title ?? property.title,
        description: req.body.description ?? property.description,
        location: req.body.location ?? property.location,
        price: req.body.price != null ? Number(req.body.price) : property.price,
        // allow agent to move DRAFT -> PENDING by setting status
        status: req.body.status === "PENDING" ? "PENDING" : property.status,
      },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: delete property (ownership enforced) */
export async function agentDelete(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const property = await prisma.property.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!property) return res.status(403).json({ message: "Not your property" });

    await prisma.property.delete({ where: { id: property.id } });
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** AGENT: mark sold (ownership enforced) */
export async function agentMarkSold(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const property = await prisma.property.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!property) return res.status(403).json({ message: "Not your property" });

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: { status: "SOLD" },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** ADMIN: list pending properties */
export async function adminPending(req, res) {
  try {
    const items = await prisma.property.findMany({
      where: { status: "PENDING" },
      include: { agent: { include: { user: { select: { fullName: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

/** ADMIN: approve/reject */
export async function adminReview(req, res) {
  try {
    const { action, reason } = req.body; // action: APPROVED | REJECTED
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
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}
