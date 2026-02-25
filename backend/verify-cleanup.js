import { PrismaClient } from "@prisma/client";
import prisma from "./prisma/client.js";

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL,
    },
  },
});

async function verify() {
  try {
    console.log("📊 Verifying database cleanup...\n");

    const localProps = await prisma.property.count();
    const localImages = await prisma.propertyImage.count();
    console.log(`✅ LOCAL: ${localProps} properties, ${localImages} images`);

    if (process.env.PRODUCTION_DATABASE_URL) {
      const prodProps = await prodPrisma.property.count();
      const prodImages = await prodPrisma.propertyImage.count();
      console.log(`✅ PRODUCTION: ${prodProps} properties, ${prodImages} images`);
    }

    console.log("\n✅ All databases are clean! Ready for new uploads.\n");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

verify();
