import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

// POST /auth/change-password (protected)
// body: { currentPassword, newPassword }
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "newPassword is required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.passwordHash) {
    return res.status(400).json({ message: "User has no password set" });
  }

 const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
if (!ok) {
  return res.status(401).json({
    message: user.mustChangePassword
      ? "Temporary password is wrong"
      : "Current password is wrong",
  });
}


  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      mustChangePassword: false, // ✅ clears the forced flag
    },
  });

  res.json({ message: "Password changed successfully" });
};
