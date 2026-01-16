import prisma from "../prisma/client.js";

/**
 * Prevent duplicate lead spam.
 * We treat "same buyer contacting same property within 1 hour" as duplicate.
 */
export async function createLeadOnce({ buyerProfileId, propertyId }) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const existing = await prisma.propertyLead.findFirst({
    where: {
      buyerId: buyerProfileId,
      propertyId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (existing) return existing;

  return prisma.propertyLead.create({
    data: { buyerId: buyerProfileId, propertyId },
  });
}

export async function getAgentLeads(agentProfileId) {
  const leads = await prisma.propertyLead.findMany({
    where: {
      property: { agentId: agentProfileId },
    },
    include: {
      buyer: { include: { user: true } },
      property: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Normalize for UI
  return leads.map((l) => ({
    id: l.id,
    buyerName: l.buyer?.user?.fullName || "Buyer",
    buyerEmail: l.buyer?.user?.email || null,
    propertyTitle: l.property?.title,
    propertyId: l.propertyId,
    createdAt: l.createdAt,
  }));
}
