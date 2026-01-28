// backend/routes/buyer.routes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import * as BuyerService from "../services/buyer.service.js";
import prisma from "../prisma/client.js";

const router = express.Router();

/**
 * GET /buyer/dashboard
 */
router.get("/dashboard", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const data = await BuyerService.getBuyerDashboard(req.user.id);
    return res.json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to load dashboard" });
  }
});

/**
 * GET /buyer/browse-properties
 */
router.get("/browse-properties", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const list = await BuyerService.browseApprovedProperties();
    return res.json({ data: list });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to load properties" });
  }
});

/**
 * GET /buyer/profile
 */
router.get("/profile", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });

    res.json({
      fullName: buyer.user.fullName,
      email: buyer.user.email,
      phone: buyer.user.phone,
      location: buyer.location || "",
      avatarUrl: buyer.avatarUrl || "",
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * PATCH /buyer/profile
 * body: { phone?, location?, avatarUrl? }
 */
router.patch("/profile", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const { phone, location, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone: phone === null ? null : phone ?? undefined,
      },
    });

    const updatedBuyer = await prisma.buyerProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, location: location || "", avatarUrl: avatarUrl || "" },
      update: {
        location: location === null ? "" : location ?? undefined,
        avatarUrl: avatarUrl === null ? "" : avatarUrl ?? undefined,
      },
    });

    res.json({
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      location: updatedBuyer.location || "",
      avatarUrl: updatedBuyer.avatarUrl || "",
    });
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to update profile" });
  }
});

/**
 * POST /buyer/save
 * body: { propertyId }
 */
router.post("/save", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    await BuyerService.saveProperty(req.user.id, propertyId);
    return res.sendStatus(201);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to save property" });
  }
});

/**
 * DELETE /buyer/save/:propertyId  (UNDO SAVE)
 */
router.delete("/save/:propertyId", protect, allowRoles("BUYER"), async (req, res) => {
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
  } catch (err) {
    console.error("unsave error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * GET /buyer/saved
 */
router.get("/saved", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const list = await BuyerService.getSavedProperties(req.user.id);
    return res.json(list);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to load saved properties" });
  }
});

/**
 * POST /buyer/buy
 * body: { propertyId }
 */
router.post("/buy", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    await BuyerService.buyProperty(req.user.id, propertyId);
    return res.sendStatus(201);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to buy property" });
  }
});

/**
 * GET /buyer/purchases
 */
router.get("/purchases", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const list = await BuyerService.getPurchases(req.user.id);
    return res.json(list);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to load purchases" });
  }
});


export default router;
