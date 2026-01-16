import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { roles: true },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const roles = user.roles.map((r) => r.name);

    // ✅ If client provides role (AGENT/BUYER), validate it
    // ✅ If not provided (admin login), infer it
    let primaryRole = role;

    if (!primaryRole) {
      // infer: choose ADMIN first if present, else first role
      primaryRole = roles.includes("ADMIN") ? "ADMIN" : (roles[0] || null);
    }

    // ✅ Optional: allow creating agent/buyer profile ONLY if role is valid
    if (primaryRole === "AGENT") {
      await prisma.agentProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    if (primaryRole === "BUYER") {
      await prisma.buyerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    // ✅ security: ensure user actually has the role they claim (except when inferred)
    if (role && !roles.includes(role)) {
      return res.status(403).json({ message: "You are not authorized for this role" });
    }

    const token = jwt.sign(
      { id: user.id, roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles,
        primaryRole,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// POST /auth/change-password  (logged-in user)
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: "newPassword is required" });

  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) return res.status(400).json({ message: "No password set for this user" });

  // optional: only require currentPassword if they already had one and not first-time
  if (!user.mustChangePassword) {
    const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Current password is wrong" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, mustChangePassword: false },
  });

  res.json({ message: "Password changed successfully" });
};
