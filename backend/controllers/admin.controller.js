import prisma from "../prisma/client.js";

export const dashboard = async (req, res) => {
  const agents = await prisma.agentProfile.count();
  const pending = await prisma.property.count({
    where: { status: "PENDING" }
  });

  res.json({ agents, pending });
};

export const reviewProperty = async (req, res) => {
  const { action, reason } = req.body;

  const property = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      status: action,
      rejectionReason: action === "REJECTED" ? reason : null
    }
  });

  res.json(property);
};



//subscription
export const analyticsDashboard = async (req, res) => {
  res.json(await analytics());
};

export const assignSubscription = async (req, res) => {
  const { agentId, plan, days } = req.body;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const sub = await prisma.subscription.upsert({
    where: { agentId },
    update: { plan, expiresAt },
    create: { agentId, plan, expiresAt }
  });

  res.json(sub);
};
