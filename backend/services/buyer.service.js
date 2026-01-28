import prisma from "../prisma/client.js";
import { getBuyerProfileByUserId } from "./user.service.js";
import { createLeadOnce } from "./lead.service.js";

function planPriority(plan) {
  // PREMIUM > BASIC > FREE
  if (plan === "PREMIUM") return 3;
  if (plan === "BASIC") return 2;
  return 1;
}

function buildWhatsAppUrl(phone, message) {
  // phone must be in international format without "+"
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}


export const getBuyerDashboard = async (userId) => {
  const buyer = await prisma.buyerProfile.findUnique({ where: { userId } });
  if (!buyer) throw new Error("Buyer profile not found");

  const [savedCount, purchaseCount, leadCount, recentSaved, recentPurchases] =
    await Promise.all([
      prisma.savedProperty.count({ where: { buyerId: buyer.id } }),
      prisma.propertyPurchase.count({ where: { buyerId: buyer.id } }),
      prisma.propertyLead.count({ where: { buyerId: buyer.id } }),
      prisma.savedProperty.findMany({
        where: { buyerId: buyer.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { property: { include: { images: true } } },
      }),
      prisma.propertyPurchase.findMany({
        where: { buyerId: buyer.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { property: { include: { images: true } } },
      }),
    ]);

  return {
    stats: { savedCount, purchaseCount, leadCount },
    recentSaved: recentSaved.map((x) => x.property),
    recentPurchases: recentPurchases.map((x) => x.property),
  };
};

export async function browseApprovedProperties() {
  const properties = await prisma.property.findMany({
    where: { status: "APPROVED" },
    include: {
      images: true,
      agent: {
        include: {
          user: { select: { fullName: true, phone: true, email: true } },
          subscription: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  // Priority sort (active subs first)
  const now = new Date();
  const score = (sub) => {
    const active = sub?.expiresAt && new Date(sub.expiresAt) > now;
    if (!active) return 1;
    return planPriority(sub.plan);
  };

  const enriched = properties.map((p) => {
    const sub = p.agent?.subscription;
    const active = sub?.expiresAt && new Date(sub.expiresAt) > now;
    return {
      ...p,
      featured: Boolean(active && sub?.plan === "PREMIUM"),
    };
  });

  enriched.sort((a, b) => {
    const aScore = score(a.agent?.subscription);
    const bScore = score(b.agent?.subscription);
    if (bScore !== aScore) return bScore - aScore;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return enriched;
}

export async function saveProperty(userId, propertyId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  // Ensure property exists and is approved
  const prop = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!prop || prop.status !== "APPROVED") throw new Error("Property unavailable");

// in BuyerService.saveProperty or route handler logic
  await prisma.savedProperty.upsert({
    where: { buyer_saved_unique: { buyerId: buyer.id, propertyId } },
    create: { buyerId: buyer.id, propertyId },
    update: {},
  });


  return { ok: true };
}

export async function getSavedProperties(userId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const saved = await prisma.savedProperty.findMany({
    where: { buyerId: buyer.id },
    include: { property: { include: { images: true } } },
    orderBy: { id: "desc" },
  });

  return saved.map((s) => s.property);
}

export async function buyProperty(userId, propertyId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const prop = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!prop || prop.status !== "APPROVED") throw new Error("Property unavailable");

  // Record purchase
  await prisma.propertyPurchase.create({
    data: { buyerId: buyer.id, propertyId },
  });

  // Mark sold (simple version)
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "SOLD" },
  });

  return { ok: true };
}

export async function getPurchases(userId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const purchases = await prisma.propertyPurchase.findMany({
    where: { buyerId: buyer.id },
    include: { property: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return purchases.map((p) => ({
    ...p.property,
    purchasedAt: p.createdAt,
  }));
}

export async function contactAgentWhatsApp(userId, propertyId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { agent: { include: { user: true } } },
  });

  if (!property || property.status !== "APPROVED") throw new Error("Property unavailable");

  // Log lead (dedupe)
  await createLeadOnce({ buyerProfileId: buyer.id, propertyId: property.id });

  const phone = property.agent?.user?.phone;
  if (!phone) throw new Error("Agent phone number not available");

  const msg = `Hello ${property.agent.user.fullName}, I'm interested in "${property.title}" at ${property.location}.`;
  return { whatsappUrl: buildWhatsAppUrl(phone, msg) };
}
