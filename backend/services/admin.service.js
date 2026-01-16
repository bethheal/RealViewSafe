import prisma from "../prisma/client.js";

export const analytics = async () => ({
  users: await prisma.user.count(),
  agents: await prisma.agentProfile.count(),
  buyers: await prisma.buyerProfile.count(),
  properties: await prisma.property.count()
});
