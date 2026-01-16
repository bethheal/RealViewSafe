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

// ---------------- SIGNUP ----------------
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // ✅ Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    const normalizedRole = String(role || "").toUpperCase(); // "BUYER" | "AGENT" | "ADMIN"

    // ✅ Validate role
    if (!["BUYER", "AGENT", "ADMIN"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // ✅ Check password strength
    if (!isStrongPassword(cleanPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ characters with uppercase, lowercase, number & symbol",
      });
    }

    // ✅ Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // ✅ Create user with role
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

    // ✅ Create profile automatically (INSIDE signup function)
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
