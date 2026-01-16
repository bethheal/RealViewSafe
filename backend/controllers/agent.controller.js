import prisma from "../prisma/client.js";
import { getAgentProfileByUserId } from "../services/user.service.js";

const toIntOrNull = (v) => (v === "" || v == null ? null : Number(v));

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

function boolFromBody(v) {
  if (v === true || v === false) return v;
  if (typeof v === "string") return v === "true";
  return false;
}

/** ===============================
 *  AGENT: DASHBOARD
 *  GET /api/agent/dashboard
 * =============================== */
export async function dashboard(req, res) {
  try {
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const [total, drafts, pending, approved, rejected, sold] = await Promise.all([
      prisma.property.count({ where: { agentId: agent.id } }),
      prisma.property.count({ where: { agentId: agent.id, status: "DRAFT" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "PENDING" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "APPROVED" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "REJECTED" } }),
      prisma.property.count({ where: { agentId: agent.id, status: "SOLD" } }),
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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const {
      title,
      location,
      description,
      price,
      status,
      category,
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

        category: category ? String(category) : null,
        bedrooms: toIntOrNull(bedrooms),
        bathrooms: toIntOrNull(bathrooms),
        sizeSqm: toIntOrNull(sizeSqm),
        furnished: boolFromBody(furnished),
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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const id = req.params.id;

    const existing = await prisma.property.findFirst({
      where: { id, agentId: agent.id },
      include: { images: true },
    });

    if (!existing) return res.status(403).json({ message: "Not your property" });

    if (existing.status === "SOLD") {
      return res.status(400).json({ message: "Cannot edit a sold property" });
    }

    const {
      title,
      location,
      description,
      price,
      status,
      category,
      bedrooms,
      bathrooms,
      sizeSqm,
      furnished,
      parking,
      images,
    } = req.body;

    const uploadedUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const urlImages = parseImagesBody(images);
    const replaceImages = urlImages.length > 0 || uploadedUrls.length > 0;
    const allImages = [...urlImages, ...uploadedUrls].filter(Boolean);

    // ✅ only allow these status changes from agent side
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

        category: category != null ? String(category) : existing.category,
        bedrooms: bedrooms != null ? toIntOrNull(bedrooms) : existing.bedrooms,
        bathrooms: bathrooms != null ? toIntOrNull(bathrooms) : existing.bathrooms,
        sizeSqm: sizeSqm != null ? toIntOrNull(sizeSqm) : existing.sizeSqm,
        furnished: furnished != null ? boolFromBody(furnished) : existing.furnished,
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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

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
    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    const id = req.params.id;

    const existing = await prisma.property.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!existing) return res.status(403).json({ message: "Not your property" });

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
