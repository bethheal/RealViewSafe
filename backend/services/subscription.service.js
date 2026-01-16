import prisma from "../prisma/client.js";

export const getAgentPlan = agentId =>
  prisma.subscription.findUnique({ where: { agentId } });

export const isPremium = async agentId => {
  const sub = await getAgentPlan(agentId);
  return sub?.plan === "PREMIUM" && sub.expiresAt > new Date();
};
