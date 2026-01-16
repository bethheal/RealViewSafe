import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function ensureRole(roleName) {
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) role = await prisma.role.create({ data: { name: roleName } });
  return role;
}

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@admin.com";
  const fullName = process.env.BOOTSTRAP_ADMIN_NAME || "System Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Admin already exists:", email);
    return;
  }

  const tempPassword = crypto.randomBytes(10).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const adminRole = await ensureRole("ADMIN");

  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      mustChangePassword: true,
      roles: { connect: [{ id: adminRole.id }] },
    },
  });

  console.log("✅ Admin created");
  console.log("Login URL: /admin/login");
  console.log("Username:", email);
  console.log("Temp password:", tempPassword);
  console.log("⚠️ Send these credentials securely and change password immediately.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
