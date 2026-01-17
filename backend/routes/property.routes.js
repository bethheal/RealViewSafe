import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";

// PUBLIC + ADMIN live here
import {
  publicBrowse,
  publicGetById,
  adminPending,
  adminReview,
} from "../controllers/property.controller.js";

// AGENT CRUD lives here (uploads + type/transactionType + images)
import {
  dashboard,
  addProperty,
  updateProperty,
  deleteProperty,
  markSold,
  myProperties,
  getDrafts,
} from "../controllers/agent.controller.js";

const router = express.Router();

/** PUBLIC */
router.get("/", publicBrowse);

/** AGENT (place BEFORE /:id) */
router.get("/agent/dashboard", protect, allowRoles("AGENT"), dashboard);

router.get("/agent/properties", protect, allowRoles("AGENT"), myProperties);
router.get("/agent/properties/drafts", protect, allowRoles("AGENT"), getDrafts);

router.post(
  "/agent/properties",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10),
  addProperty
);

router.patch(
  "/agent/properties/:id",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10),
  updateProperty
);

router.delete("/agent/properties/:id", protect, allowRoles("AGENT"), deleteProperty);
router.patch("/agent/properties/:id/sold", protect, allowRoles("AGENT"), markSold);

/** ADMIN (place BEFORE /:id) */
router.get("/admin/pending", protect, allowRoles("ADMIN"), adminPending);
router.patch("/admin/:id/review", protect, allowRoles("ADMIN"), adminReview);

/** PUBLIC: get by id MUST be LAST */
router.get("/:id", publicGetById);

export default router;
