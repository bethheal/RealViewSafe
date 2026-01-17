import prisma from "../prisma/client.js";

export async function publicBrowse(req, res) {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "APPROVED" },
      include: {
        images: true,
        agent: {
          include: {
            user: { select: { fullName: true, phone: true } }, // ✅ buyer sees phone
            subscription: true, // ✅ if you want sorting by subscription
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // OPTIONAL: sort by subscription priority (active) then newest
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

    return res.json({ data: properties });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}


export async function publicGetById(req, res) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        agent: {
          include: {
            user: { select: { fullName: true, phone: true } },
            subscription: true, // ✅ add this here
          },
        },
      },
    });

    if (!property || property.status !== "APPROVED") {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json(property);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}


/** ADMIN: list pending properties */
export async function adminPending(req, res) {
  try {
    const items = await prisma.property.findMany({
      where: { status: "PENDING" },
      include: {
        images: true,
        agent: { include: { user: { select: { fullName: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(items);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
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
      include: { images: true },
    });

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}
