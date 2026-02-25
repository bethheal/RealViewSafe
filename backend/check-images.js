import { PrismaClient } from "@prisma/client";

// Production database connection
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL,
    },
  },
});

// Local database
import prisma from "./prisma/client.js";

async function cleanDatabase(client, name) {
  try {
    console.log(`\n🔍 [${name}] Finding all properties...`);
    const count = await client.property.count();
    console.log(`Found ${count} properties`);

    console.log(`⚠️  [${name}] Deleting all properties (cascades to images)...`);
    const deleted = await client.property.deleteMany({});
    console.log(`✅ [${name}] Deleted ${deleted.count} properties and their images`);

    console.log(`📊 [${name}] Verifying cleanup:`);
    const remaining = await client.property.count();
    const images = await client.propertyImage.count();
    console.log(`Remaining properties: ${remaining}`);
    console.log(`Remaining images: ${images}`);
  } catch (e) {
    console.error(`❌ [${name}] Error:`, e.message);
  }
}

async function cleanup() {
  try {
    console.log("🗑️  Starting database cleanup...\n");

    // Clean LOCAL database
    await cleanDatabase(prisma, "LOCAL");

    // Clean PRODUCTION database (only if URL is set)
    if (process.env.PRODUCTION_DATABASE_URL) {
      await cleanDatabase(prodPrisma, "PRODUCTION");
    } else {
      console.log("\n⚠️  PRODUCTION_DATABASE_URL not set, skipping production cleanup");
    }

    console.log("\n✅ Database cleanup complete! Properties are now clean.");
    console.log("You can now upload new properties with correct images.\n");
  } catch (e) {
    console.error("Fatal error:", e);
  } finally {
    await prisma.$disconnect();
    if (process.env.PRODUCTION_DATABASE_URL) {
      await prodPrisma.$disconnect();
    }
  }
}

cleanup();
