import prisma from "../prisma/client.js";

/* ---------------- helpers ---------------- */
const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;
const toNumOrNull = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

function normalizeFurnishing({ furnished, semiFurnished, unfurnished }) {
  const f = toBool(furnished);
  const sf = toBool(semiFurnished);
  const uf = toBool(unfurnished);

  // none selected -> unfurnished true
  if (!f && !sf && !uf) {
    return { furnished: false, semiFurnished: false, unfurnished: true };
  }

  // enforce only one true (priority furnished > semiFurnished > unfurnished)
  if (f) return { furnished: true, semiFurnished: false, unfurnished: false };
  if (sf) return { furnished: false, semiFurnished: true, unfurnished: false };
  return { furnished: false, semiFurnished: false, unfurnished: true };
}

async function getAgentProfileId(userId) {
  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return agentProfile?.id || null;
}

/* ---------------- dashboard ---------------- */
export async function dashboard(req, res) {
  try {
    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) return res.status(400).json({ message: "Agent profile not found" });

    const [total, pending, approved, rejected, drafts] = await Promise.all([
      prisma.property.count({ where: { agentId: agentProfileId } }),
      prisma.property.count({ where: { agentId: agentProfileId, status: "PENDING" } }),
      prisma.property.count({ where: { agentId: agentProfileId, status: "APPROVED" } }),
      prisma.property.count({ where: { agentId: agentProfileId, status: "REJECTED" } }),
      prisma.property.count({ where: { agentId: agentProfileId, status: "DRAFT" } }),
    ]);

    res.json({ data: { total, pending, approved, rejected, drafts } });
  } catch (err) {
    console.error("dashboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/* ---------------- add property ---------------- */
export async function addProperty(req, res) {
  try {
    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) {
      return res.status(400).json({ message: "Agent profile not found for this user" });
    }

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

    const furnishing = normalizeFurnishing({ furnished, semiFurnished, unfurnished });

    const files = Array.isArray(req.files) ? req.files : [];
    const imageCreates = files.map((file) => ({ url: `/uploads/${file.filename}` }));

    const created = await prisma.property.create({
      data: {
        agentId: agentProfileId,
        title,
        location,
        description: description || null,
        price: Number(price),

        status: status || "PENDING",
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

    res.json({ data: created });
  } catch (err) {
    console.error("addProperty error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/* ---------------- update property ---------------- */
export async function updateProperty(req, res) {
  try {
    const propertyId = req.params.id;

    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) {
      return res.status(400).json({ message: "Agent profile not found for this user" });
    }

    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agentId: true },
    });

    if (!existing) return res.status(404).json({ message: "Property not found" });
    if (existing.agentId !== agentProfileId) return res.status(403).json({ message: "Forbidden" });

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

    const data = {};
    if (title !== undefined) data.title = title;
    if (location !== undefined) data.location = location;
    if (description !== undefined) data.description = description || null;
    if (price !== undefined) data.price = Number(price);

    if (status !== undefined) data.status = status;
    if (type !== undefined) data.type = type;
    if (transactionType !== undefined) data.transactionType = transactionType;
    if (category !== undefined) data.category = category ? category : null;

    if (bedrooms !== undefined) data.bedrooms = bedrooms === "" ? null : Number(bedrooms);
    if (bathrooms !== undefined) data.bathrooms = bathrooms === "" ? null : Number(bathrooms);
    if (sizeSqm !== undefined) data.sizeSqm = sizeSqm === "" ? null : Number(sizeSqm);

    // if any furnishing field is provided, normalize them
    const anyFurnishingProvided =
      furnished !== undefined || semiFurnished !== undefined || unfurnished !== undefined;

    if (anyFurnishingProvided) {
      const furnishing = normalizeFurnishing({ furnished, semiFurnished, unfurnished });
      data.furnished = furnishing.furnished;
      data.semiFurnished = furnishing.semiFurnished;
      data.unfurnished = furnishing.unfurnished;
    }

    // add new uploaded images (optional)
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

    res.json({ data: updated });
  } catch (err) {
    console.error("updateProperty error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/* ---------------- my properties ---------------- */
export async function myProperties(req, res) {
  try {
    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) {
      return res.status(400).json({ message: "Agent profile not found for this user" });
    }

    const items = await prisma.property.findMany({
      where: { agentId: agentProfileId },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: items });
  } catch (err) {
    console.error("myProperties error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/* ---------------- drafts ---------------- */
export async function getDrafts(req, res) {
  try {
    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) {
      return res.status(400).json({ message: "Agent profile not found" });
    }

    const drafts = await prisma.property.findMany({
      where: {
        agentId: agentProfileId,
        status: {
          in: ["DRAFT", "PENDING"], // ✅ correct
        },
      },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    

    res.json({ data: drafts });
  } catch (err) {
    console.error("getDrafts error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}


/* ---------------- delete ---------------- */
export async function deleteProperty(req, res) {
  try {
    const propertyId = req.params.id;

    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) return res.status(400).json({ message: "Agent profile not found" });

    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agentId: true },
    });

    if (!existing) return res.status(404).json({ message: "Property not found" });
    if (existing.agentId !== agentProfileId) return res.status(403).json({ message: "Forbidden" });

    await prisma.property.delete({ where: { id: propertyId } });
    res.sendStatus(204);
  } catch (err) {
    console.error("deleteProperty error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/* ---------------- mark sold ---------------- */
export async function markSold(req, res) {
  try {
    const propertyId = req.params.id;

    const agentProfileId = await getAgentProfileId(req.user.id);
    if (!agentProfileId) return res.status(400).json({ message: "Agent profile not found" });

    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agentId: true },
    });

    if (!existing) return res.status(404).json({ message: "Property not found" });
    if (existing.agentId !== agentProfileId) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status: "SOLD" },
      include: { images: true },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error("markSold error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}
