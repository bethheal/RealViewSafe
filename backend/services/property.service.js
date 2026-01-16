import prisma from "../prisma/client.js";

export const createProperty = (agentId, data) =>
  prisma.property.create({
    data: {
      ...data,
      agentId
    }
  });

export const getApprovedProperties = () =>
  prisma.property.findMany({
    where: { status: "APPROVED" },
    include: { images: true, agent: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });

export const reviewProperty = (id, status, reason) =>
  prisma.property.update({
    where: { id },
    data: { status, rejectionReason: reason || null }
  });
