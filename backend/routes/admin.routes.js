import express from "express";
import protect from "../middleware/protect.js";
import allowRoles from "../middleware/allowRoles.js";

import {
  dashboard,
  reviewProperty,
  assignSubscription,
  listAgents,
  setAgentSuspended,
  listBuyers,
  listPendingProperties,
  listSubscriptions,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, allowRoles("ADMIN"));

router.get("/dashboard", dashboard);

router.get("/agents", listAgents);
router.patch("/agents/:id/suspend", setAgentSuspended);

router.get("/buyers", listBuyers);

router.get("/properties", listPendingProperties);
router.patch("/properties/:id/review", reviewProperty);

router.get("/subscriptions", listSubscriptions);
router.post("/subscriptions", assignSubscription);

export default router;
