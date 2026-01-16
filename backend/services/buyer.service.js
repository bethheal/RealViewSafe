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

export async function getBuyerDashboard(userId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const [savedCount, purchaseCount] = await Promise.all([
    prisma.savedProperty.count({ where: { buyerId: buyer.id } }),
    prisma.propertyPurchase.count({ where: { buyerId: buyer.id } }),
  ]);

  return { saved: savedCount, purchases: purchaseCount };
}

export async function browseApprovedProperties() {
  const properties = await prisma.property.findMany({
    where: { status: "APPROVED" },
    include: {
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
  properties.sort((a, b) => {
    const aSub = a.agent?.subscription;
    const bSub = b.agent?.subscription;

    const aActive = aSub?.expiresAt && new Date(aSub.expiresAt) > now;
    const bActive = bSub?.expiresAt && new Date(bSub.expiresAt) > now;

    const aScore = aActive ? planPriority(aSub.plan) : 1;
    const bScore = bActive ? planPriority(bSub.plan) : 1;

    if (bScore !== aScore) return bScore - aScore;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Normalize output for your cards
  return properties.map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    status: p.status,
    featured: (() => {
      const sub = p.agent?.subscription;
      const active = sub?.expiresAt && new Date(sub.expiresAt) > now;
      return active && sub.plan === "PREMIUM";
    })(),
    agentName: p.agent?.user?.fullName,
    agentPhone: p.agent?.user?.phone,
  }));
}

export async function saveProperty(userId, propertyId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  // Ensure property exists and is approved
  const prop = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!prop || prop.status !== "APPROVED") throw new Error("Property unavailable");

  await prisma.savedProperty.upsert({
    where: { buyerId_propertyId: { buyerId: buyer.id, propertyId } },
    update: {},
    create: { buyerId: buyer.id, propertyId },
  });

  return { ok: true };
}

export async function getSavedProperties(userId) {
  const buyer = await getBuyerProfileByUserId(userId);
  if (!buyer) throw new Error("Buyer profile not found");

  const saved = await prisma.savedProperty.findMany({
    where: { buyerId: buyer.id },
    include: { property: true },
    orderBy: { id: "desc" },
  });

  return saved.map((s) => ({
    id: s.property.id,
    title: s.property.title,
    location: s.property.location,
    price: s.property.price,
    status: s.property.status,
  }));
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
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return purchases.map((p) => ({
    id: p.property.id,
    title: p.property.title,
    location: p.property.location,
    price: p.property.price,
    status: p.property.status,
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
