import prisma from "../prisma/client.js";

/**
 * Ensure Role records exist (BUYER, AGENT, ADMIN) in DB.
 * Safe to call many times.
 */
export async function ensureRolesExist() {
  const roleNames = ["BUYER", "AGENT", "ADMIN"];

  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

export async function getUserWithRoles(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
}

export async function getPrimaryRole(userId) {
  const user = await getUserWithRoles(userId);
  const role = user?.roles?.[0]?.name || null;
  return role;
}

/**
 * Ensures a profile exists for user depending on role.
 * - AGENT -> AgentProfile
 * - BUYER -> BuyerProfile
 */
export async function ensureProfileForUser(userId, role) {
  if (role === "AGENT") {
    return prisma.agentProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  if (role === "BUYER") {
    return prisma.buyerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  // ADMIN doesn't need a separate profile model
  return null;
}

export async function getAgentProfileByUserId(userId) {
  return prisma.agentProfile.findUnique({ where: { userId } });
}

export async function getBuyerProfileByUserId(userId) {
  return prisma.buyerProfile.findUnique({ where: { userId } });
}
