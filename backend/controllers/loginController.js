import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const cleanPassword = String(password || "");
    const requestedRole = role ? String(role).toUpperCase() : null; // BUYER | AGENT

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

    // Current roles
    let roles = (user.roles || []).map((r) => r.name);

    // ✅ If user selects a role on login and they don't have it,
    // ✅ automatically grant it (so buyer can log in as agent and vice versa)
    if (requestedRole && !roles.includes(requestedRole)) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connectOrCreate: {
              where: { name: requestedRole },
              create: { name: requestedRole },
            },
          },
        },
        include: { roles: true },
      });

      roles = updated.roles.map((r) => r.name);
    }

    // ✅ Decide primaryRole (use requestedRole if provided)
    const primaryRole =
      requestedRole || (roles.includes("ADMIN") ? "ADMIN" : roles[0] || "BUYER");

    // ✅ Ensure profiles exist for whichever role they chose
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

    const token = jwt.sign({ id: user.id, roles }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
