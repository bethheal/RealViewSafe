import express from "express";
import protect from "../middleware/protect.js";
import allowRoles from "../middleware/allowRoles.js";

import { dashboard, reviewProperty, assignSubscription, analyticsDashboard } from "../controllers/admin.controller.js";
import { createAdminUser, sendPasswordReset } from "../controllers/admin.auth.controller.js";

const router = express.Router();

router.get("/dashboard", protect, allowRoles("ADMIN"), dashboard);
router.patch("/properties/:id/review", protect, allowRoles("ADMIN"), reviewProperty);
router.get("/analytics", protect, allowRoles("ADMIN"), analyticsDashboard);
router.post("/subscriptions", protect, allowRoles("ADMIN"), assignSubscription);

// ✅ create admin + send temp credentials
router.post("/admin-users", protect, allowRoles("ADMIN"), createAdminUser);

// ✅ admin-triggered reset email (when they “contact admin”)
router.post("/admin-users/reset-password", protect, allowRoles("ADMIN"), sendPasswordReset);

export default router;
