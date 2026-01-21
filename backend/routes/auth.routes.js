import express from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";

import { signup } from "../controllers/signupController.js";
import { login } from "../controllers/loginController.js";
import { googleAuth } from "../controllers/googleAuth.js";
import requestReset from "../controllers/requestResetController.js";
import { resetPasswordWithToken } from "../controllers/resetPass.js";

import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ===========================
   AUTH
=========================== */
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", requestReset);
router.post("/reset-password/:token", resetPasswordWithToken);

/* ===========================
   ME (fixes /api/auth/me 404)
=========================== */
router.get("/me", protect, async (req, res) => {
  try {
    const fresh = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: { select: { name: true } },
        agentProfile: { select: { avatarUrl: true } },
        buyerProfile: { select: { avatarUrl: true } },
        createdAt: true,
      },
    });

    if (!fresh) return res.status(404).json({ message: "User not found" });

    const avatarUrl =
      fresh.agentProfile?.avatarUrl || fresh.buyerProfile?.avatarUrl || null;

    res.json({
      user: {
        id: fresh.id,
        fullName: fresh.fullName,
        email: fresh.email,
        roles: fresh.roles,
        avatarUrl,
        createdAt: fresh.createdAt,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===========================
   AVATAR UPLOAD (PATCH)
   fixes /api/auth/me/avatar 404
=========================== */
router.patch("/me/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarUrl = `/uploads/${req.file.filename}`;

    // load user + roles to know where to save
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, roles: { select: { name: true } } },
    });

    if (!me) return res.status(404).json({ message: "User not found" });

    const roleNames = (me.roles || []).map((r) => r.name);

    // Decide which profile to update
    if (roleNames.includes("AGENT")) {
      await prisma.agentProfile.upsert({
        where: { userId: me.id },
        update: { avatarUrl },
        create: { userId: me.id, avatarUrl },
      });
    } else {
      // default to buyer if not agent
      await prisma.buyerProfile.upsert({
        where: { userId: me.id },
        update: { avatarUrl },
        create: { userId: me.id, avatarUrl },
      });
    }

    // return updated "me" shape (include avatar from whichever profile)
    const fresh = await prisma.user.findUnique({
      where: { id: me.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: { select: { name: true } },
        agentProfile: { select: { avatarUrl: true } },
        buyerProfile: { select: { avatarUrl: true } },
      },
    });

    const resolvedAvatar =
      fresh?.agentProfile?.avatarUrl || fresh?.buyerProfile?.avatarUrl || null;

    res.json({
      user: {
        id: fresh.id,
        fullName: fresh.fullName,
        email: fresh.email,
        roles: fresh.roles,
        avatarUrl: resolvedAvatar,
      },
    });
  } catch (err) {
    console.error("PATCH /api/auth/me/avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===========================
   CHANGE PASSWORD
=========================== */
router.post("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.sendStatus(204);
  } catch (err) {
    console.error("POST /api/auth/change-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
