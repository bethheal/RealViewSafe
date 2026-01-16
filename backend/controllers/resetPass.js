import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

// POST /auth/reset-password
// body: { token, newPassword }
export const resetPasswordWithToken = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "token and newPassword are required" });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return res.status(400).json({ message: "Invalid token" });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: "Token expired" });

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email: record.email },
    data: {
      passwordHash: hash,
      mustChangePassword: false, // ✅ IMPORTANT
    },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  res.json({ message: "Password reset successful" });
};
