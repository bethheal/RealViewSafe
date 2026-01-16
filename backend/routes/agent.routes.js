import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  dashboard,
  addProperty,
  updateProperty,
  deleteProperty,
  markSold,
  myProperties,
  getDrafts,
} from "../controllers/agent.controller.js";

import { upload } from "../middleware/upload.js";

const agentRouter = express.Router();

agentRouter.get("/dashboard", protect, allowRoles("AGENT"), dashboard);

agentRouter.get("/properties", protect, allowRoles("AGENT"), myProperties);
agentRouter.get("/properties/drafts", protect, allowRoles("AGENT"), getDrafts);

agentRouter.post(
  "/properties",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10), // ✅ MUST match frontend key: "media"
  addProperty
);

agentRouter.patch(
  "/properties/:id",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10),
  updateProperty
);

agentRouter.delete("/properties/:id", protect, allowRoles("AGENT"), deleteProperty);
agentRouter.patch("/properties/:id/sold", protect, allowRoles("AGENT"), markSold);

export default agentRouter;
