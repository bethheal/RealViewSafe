import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";

import {
  dashboard,
  listAgents,
  suspendAgent,
  listBuyersWithPurchases,
  listPendingProperties,
  reviewProperty,
  listSubscriptions,
  assignSubscription,
} from "../controllers/admin.controller.js";

const router = express.Router();

// everything admin-only
router.use(protect, allowRoles("ADMIN"));

router.get("/dashboard", dashboard);

// agents
router.get("/agents", listAgents);
router.patch("/agents/:id/suspend", suspendAgent);

// buyers + purchases
router.get("/buyers", listBuyersWithPurchases);

// properties queue
router.get("/properties", listPendingProperties);
router.patch("/properties/:id/review", reviewProperty);

// subscriptions
router.get("/subscriptions", listSubscriptions);
router.post("/subscriptions", assignSubscription);

export default router;
