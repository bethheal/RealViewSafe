import express from "express";
import {signup} from "../controllers/signupController.js";
import {login} from "../controllers/loginController.js";
import {googleAuth} from "../controllers/googleAuth.js";
import  requestReset  from '../controllers/requestResetController.js';
import  {resetPasswordWithToken} from "../controllers/resetPass.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";
import { addProperty, updateProperty } from "../controllers/agent.controller.js";
import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";


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
router.post("/reset-password/:token", resetPasswordWithToken);



// backend/routes/auth.routes.js (example)
router.post("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.sendStatus(204);
});

export default router;
