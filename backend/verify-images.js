import prisma from "./prisma/client.js";
import fs from "fs";
import path from "path";

/**
 * Verify that all image URLs in database match actual files on disk
 * Run this periodically or after bulk uploads
 */
async function verifyImageIntegrity() {
  console.log("🔍 Starting image integrity check...\n");

  try {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Get all actual files on disk
    const actualFiles = fs.readdirSync(uploadDir);
    console.log(`📁 Found ${actualFiles.length} files on disk\n`);

    // Get all image URLs from database
    const dbImages = await prisma.propertyImage.findMany({
      select: { id: true, url: true, propertyId: true }
    });
    console.log(`📊 Found ${dbImages.length} image records in database\n`);

    // Check each DB record against disk
    const broken = [];
    const valid = [];

    for (const img of dbImages) {
      // Extract filename from URL (e.g., "/uploads/1234-file.jpg" -> "1234-file.jpg")
      const filename = img.url.split("/").pop();
      const exists = actualFiles.includes(filename);

      if (exists) {
        valid.push(img.url);
      } else {
        broken.push({ id: img.id, url: img.url, propertyId: img.propertyId });
      }
    }

    console.log(`✅ Valid images: ${valid.length}`);
    console.log(`❌ Broken images: ${broken.length}\n`);

    if (broken.length > 0) {
      console.log("⚠️  Broken image records:");
      broken.forEach(b => {
        console.log(`   - ${b.url} (Property: ${b.propertyId})`);
      });

      console.log("\n🔧 Attempting to fix by deleting broken records...");
      
      for (const b of broken) {
        await prisma.propertyImage.delete({ where: { id: b.id } });
      }
      
      console.log(`✅ Deleted ${broken.length} broken records`);
    }

    console.log("\n✅ Image integrity check complete!");
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyImageIntegrity();
