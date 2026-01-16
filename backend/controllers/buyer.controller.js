import prisma from "../prisma/client.js";
import { whatsappLink } from "../utils/whatsapp.js";

export const contactAgent = async (req, res) => {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: req.user.id }
  });

  const property = await prisma.property.findUnique({
    where: { id: req.body.propertyId },
    include: { agent: { include: { user: true } } }
  });

  await prisma.propertyLead.create({
    data: { buyerId: buyer.id, propertyId: property.id }
  });

  res.json({
    whatsappUrl: whatsappLink(
      property.agent.user.phone,
      `Hello, I'm interested in ${property.title}`
    )
  });
};

//save and buy

export const saveProperty = async (req, res) => {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: req.user.id }
  });

  await prisma.savedProperty.create({
    data: { buyerId: buyer.id, propertyId: req.body.propertyId }
  });

  res.sendStatus(201);
};

export const buyProperty = async (req, res) => {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: req.user.id }
  });

  await prisma.propertyPurchase.create({
    data: { buyerId: buyer.id, propertyId: req.body.propertyId }
  });

  await prisma.property.update({
    where: { id: req.body.propertyId },
    data: { status: "SOLD" }
  });

  res.sendStatus(201);
};
