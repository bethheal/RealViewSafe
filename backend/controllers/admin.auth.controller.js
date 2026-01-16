import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { sendMail } from "../utils/mailer.js";

function randomPassword() {
  return crypto.randomBytes(9).toString("base64url"); // strong temp password
}

async function ensureRole(name) {
  let role = await prisma.role.findUnique({ where: { name } });
  if (!role) role = await prisma.role.create({ data: { name } });
  return role;
}

// POST /admin/admin-users  (ADMIN only)
export const createAdminUser = async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) return res.status(400).json({ message: "fullName and email are required" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "User already exists" });

  const adminRole = await ensureRole("ADMIN");

  const tempPass = randomPassword();
  const passwordHash = await bcrypt.hash(tempPass, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      mustChangePassword: true, // ✅ force change on first login
      roles: { connect: [{ id: adminRole.id }] },
    },
    select: { id: true, fullName: true, email: true },
  });

  const url = `${process.env.APP_URL}/admin/login`;

  await sendMail({
    to: email,
    subject: "Admin access created",
    html: `
      <p>Hello ${fullName},</p>
      <p>Your admin account has been created.</p>
      <p><b>Login email:</b> ${email}</p>
      <p><b>Temporary password:</b> ${tempPass}</p>
      <p>Login here: <a href="${url}">${url}</a></p>
      <p>You will be forced to change your password immediately after login.</p>
    `,
  });

  res.json({ message: "Admin created and email sent", user });
};

// POST /admin/admin-users/reset-password  (ADMIN only)
export const sendPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "email is required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  // one-time token stored in DB
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // clear old tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  const link = `${process.env.APP_URL}/admin/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset your admin password",
    html: `
      <p>We received a request to reset your password.</p>
      <p>Click to reset (expires in 1 hour):</p>
      <p><a href="${link}">${link}</a></p>
    `,
  });

  res.json({ message: "Reset email sent" });
};
