// backend/routes/subscription.routes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  agentGetSubscription,
  adminListSubscriptions,
  adminAssignSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

/**
 * AGENT
 * GET /subscriptions/agent
 * Agent views their subscription
 */
router.get("/agent", protect, allowRoles("AGENT"), agentGetSubscription);

/**
 * ADMIN
 * GET /subscriptions/admin
 * Admin lists all subscriptions
 */
router.get("/admin", protect, allowRoles("ADMIN"), adminListSubscriptions);

/**
 * ADMIN
 * POST /subscriptions/admin
 * Admin assigns/updates agent subscription
 * body: { agentId, plan: "FREE"|"BASIC"|"PREMIUM", days: number }
 */
router.post("/admin", protect, allowRoles("ADMIN"), adminAssignSubscription);

export default router;
