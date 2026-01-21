import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPassword = (password || "").trim();
    const normalizedRole = String(role || "").toUpperCase();

    if (!["BUYER", "AGENT", "ADMIN"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Find existing user (if any)
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { roles: true },
    });

    // If user exists → just attach role (and profile) and return
    if (existing) {
      const existingRoles = existing.roles.map((r) => r.name);

      // If already has role, just return
      if (existingRoles.includes(normalizedRole)) {
        return res.status(200).json({
          user: {
            id: existing.id,
            fullName: existing.fullName,
            email: existing.email,
            roles: existingRoles,
            primaryRole: normalizedRole,
          },
          message: "Account already exists; role already assigned",
        });
      }

      // Add the new role
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          roles: {
            connectOrCreate: {
              where: { name: normalizedRole },
              create: { name: normalizedRole },
            },
          },
        },
        include: { roles: true },
      });

      // Ensure profile exists for that role
      if (normalizedRole === "AGENT") {
        await prisma.agentProfile.upsert({
          where: { userId: updated.id },
          update: {},
          create: { userId: updated.id },
        });
      } else if (normalizedRole === "BUYER") {
        await prisma.buyerProfile.upsert({
          where: { userId: updated.id },
          update: {},
          create: { userId: updated.id },
        });
      }

      return res.status(200).json({
        user: {
          id: updated.id,
          fullName: updated.fullName,
          email: updated.email,
          roles: updated.roles.map((r) => r.name),
          primaryRole: normalizedRole,
        },
        message: "Role added to existing account",
      });
    }

    // New user flow
    if (!isStrongPassword(cleanPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ characters with uppercase, lowercase, number & symbol",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        roles: {
          connectOrCreate: {
            where: { name: normalizedRole },
            create: { name: normalizedRole },
          },
        },
      },
      include: { roles: true },
    });

    if (normalizedRole === "AGENT") {
      await prisma.agentProfile.create({ data: { userId: user.id } });
    } else if (normalizedRole === "BUYER") {
      await prisma.buyerProfile.create({ data: { userId: user.id } });
    }

    return res.status(201).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((r) => r.name),
        primaryRole: normalizedRole,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};
