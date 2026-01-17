import prisma from "../prisma/client.js";
import { getAgentProfileByUserId } from "../services/user.service.js";

const toIntOrNull = (v) => (v === "" || v == null ? null : Number(v));

function boolFromBody(v) {
  if (v === true || v === false) return v;
  if (typeof v === "string") return v === "true";
  return false;
}

function parseImagesBody(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);

  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
}

function upperOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.toUpperCase();
}

async function getAgentOr404(req, res) {
  // IMPORTANT: make sure getAgentProfileByUserId includes subscription if you want to check expiry
  const agent = await getAgentProfileByUserId(req.user.id);
  if (!agent) {
    res.status(404).json({ message: "Agent profile not found" });
    return null;
  }
  return agent;
}

function normalizePropertyPayload(body) {
  const type = upperOrNull(body.type) || "HOUSE";
  const transactionType = upperOrNull(body.transactionType) || "SALE";
  const isLand = type === "LAND";

  // category optional, but LAND doesn't need category
  const category = isLand ? null : (upperOrNull(body.category) || null);

  return {
    type,
    transactionType,
    category,
    isLand,
  };
}

/** ===============================
 *  AGENT: DASHBOARD
 *  GET /api/agent/dashboard
 * =============================== */
export async function dashboard(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const [total, drafts, pending, approved, rejected, sold, rented] = await Promise.all([
      prisma.property.count({ where: { agentId: agent.id } }),
      prisma.property.count({ where: { agentId: agent.id, status: "DRAFT" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "PENDING" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "APPROVED" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "REJECTED" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "SOLD" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "RENTED" } }),
    ]);

    const subscription = await prisma.subscription.findUnique({
      where: { agentId: agent.id },
    });

    return res.json({
      properties: total,
      drafts,
      pending,
      approved,
      rejected,
      sold,
      rented,
      subscription: subscription?.plan || "FREE",
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: ADD PROPERTY
 *  POST /api/agent/properties
 *  multipart/form-data (multer)
 * =============================== */
export async function addProperty(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    if (agent.suspended) {
      return res.status(403).json({ message: "Account suspended. Contact admin." });
    }

    const {
      title,
      location,
      description,
      price,
      status,
      bedrooms,
      bathrooms,
      sizeSqm,
      furnished,
      parking,
      images,
    } = req.body;

    if (!title || !location || price == null || price === "") {
      return res.status(400).json({ message: "title, location and price are required" });
    }

    const { type, transactionType, category, isLand } = normalizePropertyPayload(req.body);

    // images: combine URL images + uploaded media
    const uploadedUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const urlImages = parseImagesBody(images);
    const allImages = [...urlImages, ...uploadedUrls].filter(Boolean);

    const created = await prisma.property.create({
      data: {
        agentId: agent.id,
        title: String(title).trim(),
        location: String(location).trim(),
        description: description ? String(description) : null,
        price: Number(price),

        status: status === "DRAFT" ? "DRAFT" : "PENDING",

        type,
        transactionType,
        category,

        // LAND rules
        bedrooms: isLand ? null : toIntOrNull(bedrooms),
        bathrooms: isLand ? null : toIntOrNull(bathrooms),
        sizeSqm: toIntOrNull(sizeSqm),
        furnished: isLand ? false : boolFromBody(furnished),
        parking: boolFromBody(parking),

        images: {
          create: allImages.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("addProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: UPDATE PROPERTY
 *  PATCH /api/agent/properties/:id
 *  multipart/form-data (multer)
 * =============================== */
export async function updateProperty(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const id = req.params.id;

    const existing = await prisma.property.findFirst({
      where: { id, agentId: agent.id },
      include: { images: true },
    });

    if (!existing) return res.status(403).json({ message: "Not your property" });

    if (existing.status === "SOLD" || existing.status === "RENTED") {
      return res.status(400).json({ message: "Cannot edit a completed listing" });
    }

    const {
      title,
      location,
      description,
      price,
      status,
      bedrooms,
      bathrooms,
      sizeSqm,
      furnished,
      parking,
      images,
    } = req.body;

    // normalize enums
    const { type, transactionType, category, isLand } = normalizePropertyPayload({
      type: req.body.type ?? existing.type,
      transactionType: req.body.transactionType ?? existing.transactionType,
      category: req.body.category ?? existing.category,
    });

    // images handling: replace images only if new images are provided
    const uploadedUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const urlImages = parseImagesBody(images);
    const replaceImages = urlImages.length > 0 || uploadedUrls.length > 0;
    const allImages = [...urlImages, ...uploadedUrls].filter(Boolean);

    // allow agent to move DRAFT/REJECTED -> PENDING
    const nextStatus =
      status === "PENDING" && ["DRAFT", "REJECTED"].includes(existing.status)
        ? "PENDING"
        : existing.status;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: title != null ? String(title).trim() : existing.title,
        location: location != null ? String(location).trim() : existing.location,
        description: description != null ? String(description) : existing.description,
        price: price != null && price !== "" ? Number(price) : existing.price,

        type,
        transactionType,
        category,

        bedrooms: isLand ? null : (bedrooms != null ? toIntOrNull(bedrooms) : existing.bedrooms),
        bathrooms: isLand ? null : (bathrooms != null ? toIntOrNull(bathrooms) : existing.bathrooms),
        sizeSqm: sizeSqm != null ? toIntOrNull(sizeSqm) : existing.sizeSqm,
        furnished: isLand ? false : (furnished != null ? boolFromBody(furnished) : existing.furnished),
        parking: parking != null ? boolFromBody(parking) : existing.parking,

        status: nextStatus,

        ...(replaceImages
          ? {
              images: {
                deleteMany: {},
                create: allImages.map((url) => ({ url })),
              },
            }
          : {}),
      },
      include: { images: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error("updateProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: MY PROPERTIES
 *  GET /api/agent/properties
 * =============================== */
export async function myProperties(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const items = await prisma.property.findMany({
      where: { agentId: agent.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(items);
  } catch (err) {
    console.error("myProperties error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: DRAFTS/PENDING/REJECTED
 *  GET /api/agent/properties/drafts
 * =============================== */
export async function getDrafts(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const items = await prisma.property.findMany({
      where: { agentId: agent.id, status: { in: ["DRAFT", "PENDING", "REJECTED"] } },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(items);
  } catch (err) {
    console.error("getDrafts error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: DELETE
 *  DELETE /api/agent/properties/:id
 * =============================== */
export async function deleteProperty(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const id = req.params.id;

    const existing = await prisma.property.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!existing) return res.status(403).json({ message: "Not your property" });

    await prisma.property.delete({ where: { id } });
    return res.sendStatus(204);
  } catch (err) {
    console.error("deleteProperty error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

/** ===============================
 *  AGENT: MARK SOLD
 *  PATCH /api/agent/properties/:id/sold
 * =============================== */
export async function markSold(req, res) {
  try {
    const agent = await getAgentOr404(req, res);
    if (!agent) return;

    const id = req.params.id;

    const existing = await prisma.property.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!existing) return res.status(403).json({ message: "Not your property" });

    // only allow SOLD if transactionType is SALE
    if (existing.transactionType !== "SALE") {
      return res.status(400).json({ message: "Only SALE properties can be marked SOLD" });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status: "SOLD" },
    });

    return res.json(updated);
  } catch (err) {
    console.error("markSold error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}
