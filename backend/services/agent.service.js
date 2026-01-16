import prisma from "../prisma/client.js";

const ALL_STATUSES = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SOLD"];

export const getAgentStats = async (agentId) => {
  const rows = await prisma.property.groupBy({
    by: ["status"],
    where: { agentId },
    _count: { _all: true },
  });

  // Turn groupBy array into stable counts object with zeros
  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
  for (const r of rows) {
    counts[r.status] = r._count._all;
  }

  return {
    total: ALL_STATUSES.reduce((sum, s) => sum + counts[s], 0),
    counts,
  };
};
