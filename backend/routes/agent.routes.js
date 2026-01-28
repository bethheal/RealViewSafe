import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { requireActiveSubscription } from "../middleware/subscription.middleware.js";
import {
  dashboard,
  addProperty,
  updateProperty,
  deleteProperty,
  markSold,
  myProperties,
  getDrafts,
  getProfile,
  updateProfile,
} from "../controllers/agent.controller.js";
import { upload } from "../middleware/upload.js";

const agentRouter = express.Router();

// dashboard
agentRouter.get("/dashboard", protect, allowRoles("AGENT"), dashboard);

// properties
agentRouter.get("/properties", protect, allowRoles("AGENT"), myProperties);
agentRouter.get("/properties/drafts", protect, allowRoles("AGENT"), getDrafts);

// profile
agentRouter.get("/profile", protect, allowRoles("AGENT"), getProfile);
agentRouter.patch("/profile", protect, allowRoles("AGENT"), updateProfile);

agentRouter.post(
  "/properties",
  protect,
  allowRoles("AGENT"),
  requireActiveSubscription,
  upload.array("media", 10), // ✅ MUST match frontend key: "media"
  addProperty
);

agentRouter.patch(
  "/properties/:id",
  protect,
  allowRoles("AGENT"),
  requireActiveSubscription,
  upload.array("media", 10),
  updateProperty
);

agentRouter.delete(
  "/properties/:id",
  protect,
  allowRoles("AGENT"),
  requireActiveSubscription,
  deleteProperty
);
agentRouter.patch(
  "/properties/:id/sold",
  protect,
  allowRoles("AGENT"),
  requireActiveSubscription,
  markSold
);

export default agentRouter;
