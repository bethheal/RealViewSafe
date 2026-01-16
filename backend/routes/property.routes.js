import express from "express";
import { allowRoles } from "../middleware/role.middleware.js";

import {
  publicBrowse,
  publicGetById,
  agentCreate,
  agentMyProperties,
  agentDrafts,
  agentUpdate,
  agentDelete,
  agentMarkSold,
  adminPending,
  adminReview,
} from "../controllers/property.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/** PUBLIC */
router.get("/", publicBrowse);
router.get("/:id", publicGetById);

/** AGENT */
router.post("/agent", protect, allowRoles("AGENT"), agentCreate);
router.get("/agent/mine", protect, allowRoles("AGENT"), agentMyProperties);
router.get("/agent/drafts", protect, allowRoles("AGENT"), agentDrafts);
router.patch("/agent/:id", protect, allowRoles("AGENT"), agentUpdate);
router.delete("/agent/:id", protect, allowRoles("AGENT"), agentDelete);
router.patch("/agent/:id/sold", protect, allowRoles("AGENT"), agentMarkSold);

/** ADMIN */
router.get("/admin/pending", protect, allowRoles("ADMIN"), adminPending);
router.patch("/admin/:id/review", protect, allowRoles("ADMIN"), adminReview);

export default router;
