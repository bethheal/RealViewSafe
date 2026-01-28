import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  initializePaystackSubscription,
  verifyPaystackTransaction,
  handlePaystackWebhook,
} from "../controllers/payments.controller.js";

const router = express.Router();

// Agent initiates Paystack subscription checkout
router.post("/paystack/initialize", protect, allowRoles("AGENT"), initializePaystackSubscription);

// Agent verifies Paystack transaction after redirect
router.get("/paystack/verify/:reference", protect, allowRoles("AGENT"), verifyPaystackTransaction);

// Paystack webhook (public)
router.post("/paystack/webhook", handlePaystackWebhook);

export default router;
