import prisma from "../prisma/client.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const resetPassword = async (req, res) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: req.params.token }
  });

  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ message: "Token expired" });

  const hash = await bcrypt.hash(req.body.password, 12);

  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash: hash }
  });

  await prisma.passwordResetToken.delete({ where: { token: record.token } });

  res.json({ message: "Password updated" });
};
export default resetPassword;