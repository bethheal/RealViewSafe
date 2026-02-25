import prisma from "../prisma/client.js";
import fs from "fs";
import path from "path";

/* ---------- file verification helper ---------- */
function verifyUploadedFiles(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  
  const uploadDir = path.join(process.cwd(), "uploads");
  const verified = [];
  
  for (const file of files) {
    const filePath = path.join(uploadDir, file.filename);
    // Verify file actually exists on disk
    if (fs.existsSync(filePath)) {
      verified.push(file);
    } else {
      console.warn(`⚠️  Uploaded file not found on disk: ${file.filename}`);
    }
  }
  
  return verified;
}

/* ---------------- helpers ---------------- */
const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;
const toNumOrNull = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
const parsePrice = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const num = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return Math.round(num);
};
const AGENT_ALLOWED_STATUSES = ["DRAFT", "PENDING"];

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
    const priceValue = parsePrice(price);
    if (priceValue === null) {
      return res.status(400).json({ message: "price must be a valid number" });
    }

    const furnishing = normalizeFurnishing({ furnished, semiFurnished, unfurnished });

    const requestedStatus = String(status || "PENDING").toUpperCase();
    if (!AGENT_ALLOWED_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({ message: "Invalid status for agent submission" });
    }

    // ✅ Verify files actually exist on disk before saving to DB
    const files = Array.isArray(req.files) ? req.files : [];
    const verifiedFiles = verifyUploadedFiles(files);
    
    if (verifiedFiles.length === 0 && files.length > 0) {
      return res.status(500).json({ message: "File upload failed - files were not persisted on server" });
    }
    
    const imageCreates = verifiedFiles.map((file) => ({ url: `/uploads/${file.filename}` }));

    const created = await prisma.property.create({
      data: {
        agentId: agentProfileId,
        title,
        location,
        description: description || null,
        price: priceValue,

        status: requestedStatus,
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
      select: { agentId: true, status: true },
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

    if (existing.status === "SOLD") {
      return res.status(400).json({ message: "Sold properties cannot be edited" });
    }

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

    if (status !== undefined) {
      const requestedStatus = String(status || "").toUpperCase();
      if (!AGENT_ALLOWED_STATUSES.includes(requestedStatus)) {
        return res.status(400).json({ message: "Invalid status for agent update" });
      }
      data.status = requestedStatus;
      data.rejectionReason = null;
    }
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
      select: { agentId: true, status: true },
    });

    if (!existing) return res.status(404).json({ message: "Property not found" });
    if (existing.agentId !== agentProfileId) return res.status(403).json({ message: "Forbidden" });
    if (existing.status !== "APPROVED") {
      return res.status(400).json({ message: "Only approved properties can be sold" });
    }

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

/* ---------------- profile ---------------- */
export async function getProfile(req, res) {
  try {
    const agent = await prisma.agentProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!agent) return res.status(404).json({ message: "Agent profile not found" });

    return res.json({
      fullName: agent.user.fullName,
      email: agent.user.email,
      phone: agent.user.phone,
      company: agent.company || "",
      bio: agent.bio || "",
      verified: agent.verified,
      avatarUrl: agent.avatarUrl || "",
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { phone, company, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone: phone === null ? null : phone ?? undefined },
    });

    const updatedAgent = await prisma.agentProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, company: company || "", bio: bio || "" },
      update: {
        company: company === null ? "" : company ?? undefined,
        bio: bio === null ? "" : bio ?? undefined,
      },
    });

    return res.json({
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      company: updatedAgent.company || "",
      bio: updatedAgent.bio || "",
      verified: updatedAgent.verified,
      avatarUrl: updatedAgent.avatarUrl || "",
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(400).json({ message: err.message || "Failed to update profile" });
  }
}
