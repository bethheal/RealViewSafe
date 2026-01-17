import prisma from "../prisma/client.js";
import { whatsappLink } from "../utils/whatsapp.js";

import prisma from "../prisma/client.js";
import { whatsappLink } from "../utils/whatsapp.js";

export const contactAgent = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: { include: { user: true } } },
    });
    if (!property) return res.status(404).json({ message: "Property not found" });

    const phone = property?.agent?.user?.phone;
    if (!phone) return res.status(400).json({ message: "Agent phone number is not available" });

    // ✅ avoid unique-crash
    await prisma.propertyLead.upsert({
      where: { buyerId_propertyId: { buyerId: buyer.id, propertyId: property.id } },
      create: { buyerId: buyer.id, propertyId: property.id },
      update: {},
    });

    res.json({
      whatsappUrl: whatsappLink(phone, `Hello, I'm interested in ${property.title}`),
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};


//save and buy

export const saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });

    await prisma.savedProperty.upsert({
      where: { buyerId_propertyId: { buyerId: buyer.id, propertyId } },
      create: { buyerId: buyer.id, propertyId },
      update: {},
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to save property" });
  }
};

export const unsaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });

    await prisma.savedProperty.deleteMany({
      where: { buyerId: buyer.id, propertyId },
    });

    return res.sendStatus(204);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to unsave property" });
  }
};

export const buyProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.status !== "APPROVED") {
      return res.status(400).json({ message: "Only approved properties can be purchased" });
    }

    await prisma.$transaction(async (tx) => {
      // prevent duplicate purchase by same buyer (optional but recommended)
      const existing = await tx.propertyPurchase.findFirst({
        where: { buyerId: buyer.id, propertyId },
      });
      if (existing) throw new Error("You already purchased this property");

      await tx.propertyPurchase.create({
        data: { buyerId: buyer.id, propertyId },
      });

      await tx.property.update({
        where: { id: propertyId },
        data: { status: "SOLD" },
      });
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to buy property" });
  }
};

