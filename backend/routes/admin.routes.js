import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";

import {
  dashboard,
  listAgents,
  suspendAgent,
  verifyAgent,
  listBuyersWithPurchases,
  listProperties,
  reviewProperty,
  addAdminProperty,
  updateAdminProperty,
  listSubscriptions,
  assignSubscription,
} from "../controllers/admin.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// everything admin-only
router.use(protect, allowRoles("ADMIN"));

router.get("/dashboard", dashboard);

// agents
router.get("/agents", listAgents);
router.patch("/agents/:id/suspend", suspendAgent);
router.patch("/agents/:id/verify", verifyAgent);

// buyers + purchases
router.get("/buyers", listBuyersWithPurchases);

// properties (all statuses; optional ?status=)
router.get("/properties", listProperties);
router.patch("/properties/:id/review", reviewProperty);
router.post("/properties", upload.array("media", 10), addAdminProperty);
router.patch("/properties/:id", upload.array("media", 10), updateAdminProperty);

// subscriptions
router.get("/subscriptions", listSubscriptions);
router.post("/subscriptions", assignSubscription);

export default router;
