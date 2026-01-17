import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = process.argv[2] || process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@admin.com";
  const newPassword = process.argv[3] || process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@1234";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ Admin user not found for:", email);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      mustChangePassword: true, // force change on next login if you want
    },
  });

  // Ensure ADMIN role is connected
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  await prisma.user.update({
    where: { email },
    data: {
      roles: { connect: [{ id: adminRole.id }] },
    },
  });

  console.log("✅ Admin password reset successfully");
  console.log("Username:", email);
  console.log("New password:", newPassword);
  console.log("mustChangePassword set to true");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
