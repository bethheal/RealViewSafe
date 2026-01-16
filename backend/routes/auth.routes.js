import express from "express";
import {signup} from "../controllers/signupController.js";
import {login} from "../controllers/loginController.js";
import {googleAuth} from "../controllers/googleAuth.js";
import  requestReset  from '../controllers/requestResetController.js';
import resetPass from "../controllers/resetPass.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";
import { addProperty, updateProperty } from "../controllers/agent.controller.js";

const router = express.Router();

router.post(
  "/properties",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10),
  addProperty
);

router.patch(
  "/properties/:id",
  protect,
  allowRoles("AGENT"),
  upload.array("media", 10),
  updateProperty
);



router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", requestReset);
router.post("/reset-password/:token", resetPass);

export default router;
