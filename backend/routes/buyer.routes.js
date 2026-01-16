// backend/routes/buyer.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
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
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to load dashboard" });
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
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * PATCH /buyer/profile
 * body: { phone? }
 */
router.patch("/profile", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const { phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone: phone ?? undefined },
    });

    res.json({
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
    });
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to update profile" });
  }
});

/**
 * GET /buyer/browse-properties
 * Returns APPROVED properties sorted by subscription priority
 */
router.get("/browse-properties", async (req, res) => {
  try {
    const data = await BuyerService.browseApprovedProperties();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to browse properties" });
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

    const out = await BuyerService.saveProperty(req.user.id, propertyId);
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to save property" });
  }
});

/**
 * GET /buyer/saved
 */
router.get("/saved", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const out = await BuyerService.getSavedProperties(req.user.id);
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to load saved" });
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

    const out = await BuyerService.buyProperty(req.user.id, propertyId);
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to buy property" });
  }
});

/**
 * GET /buyer/purchases
 */
router.get("/purchases", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const out = await BuyerService.getPurchases(req.user.id);
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to load purchases" });
  }
});

/**
 * POST /buyer/contact-agent
 * body: { propertyId }
 * Logs lead & returns whatsapp url
 */
router.post("/contact-agent", protect, allowRoles("BUYER"), async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const out = await BuyerService.contactAgentWhatsApp(req.user.id, propertyId);
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to contact agent" });
  }
});

export default router;
