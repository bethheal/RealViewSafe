import prisma from "./prisma/client.js";
import fs from "fs";
import path from "path";
import {
  isCloudinaryEnabled,
  resolveCloudinaryFolder,
  uploadFileToCloudinary,
} from "./services/cloudinary.service.js";

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

function extractUploadFilename(url) {
  if (!url) return null;
  const cleaned = String(url).split("?")[0].replace(/\\/g, "/");

  if (cleaned.startsWith("uploads/")) {
    return path.basename(cleaned.slice("uploads/".length));
  }

  const marker = "/uploads/";
  const idx = cleaned.indexOf(marker);
  if (idx === -1) return null;

  const filename = cleaned.slice(idx + marker.length);
  return filename ? path.basename(filename) : null;
}

function resolveLocalPath(url) {
  const filename = extractUploadFilename(url);
  if (!filename) return null;
  return path.join(uploadDir, filename);
}

async function getOrUpload(filePath, folder, cache) {
  if (cache.has(filePath)) return cache.get(filePath);

  const uploaded = await uploadFileToCloudinary(
    { path: filePath },
    { folder, cleanup: false },
  );
  cache.set(filePath, uploaded.url);
  return uploaded.url;
}

async function migratePropertyImages(cache) {
  const records = await prisma.propertyImage.findMany({
    where: { url: { contains: "/uploads/" } },
    select: { id: true, url: true },
  });

  let migrated = 0;
  let missing = 0;
  let skipped = 0;

  for (const record of records) {
    const filePath = resolveLocalPath(record.url);
    if (!filePath) {
      skipped += 1;
      continue;
    }
    if (!fs.existsSync(filePath)) {
      missing += 1;
      continue;
    }

    const newUrl = await getOrUpload(
      filePath,
      resolveCloudinaryFolder("properties"),
      cache,
    );

    await prisma.propertyImage.update({
      where: { id: record.id },
      data: { url: newUrl },
    });
    migrated += 1;
  }

  return { total: records.length, migrated, missing, skipped };
}

async function migrateAgentAvatars(cache) {
  const records = await prisma.agentProfile.findMany({
    where: { avatarUrl: { contains: "/uploads/" } },
    select: { id: true, avatarUrl: true },
  });

  let migrated = 0;
  let missing = 0;
  let skipped = 0;

  for (const record of records) {
    const filePath = resolveLocalPath(record.avatarUrl);
    if (!filePath) {
      skipped += 1;
      continue;
    }
    if (!fs.existsSync(filePath)) {
      missing += 1;
      continue;
    }

    const newUrl = await getOrUpload(
      filePath,
      resolveCloudinaryFolder("avatars"),
      cache,
    );

    await prisma.agentProfile.update({
      where: { id: record.id },
      data: { avatarUrl: newUrl },
    });
    migrated += 1;
  }

  return { total: records.length, migrated, missing, skipped };
}

async function migrateBuyerAvatars(cache) {
  const records = await prisma.buyerProfile.findMany({
    where: { avatarUrl: { contains: "/uploads/" } },
    select: { id: true, avatarUrl: true },
  });

  let migrated = 0;
  let missing = 0;
  let skipped = 0;

  for (const record of records) {
    const filePath = resolveLocalPath(record.avatarUrl);
    if (!filePath) {
      skipped += 1;
      continue;
    }
    if (!fs.existsSync(filePath)) {
      missing += 1;
      continue;
    }

    const newUrl = await getOrUpload(
      filePath,
      resolveCloudinaryFolder("avatars"),
      cache,
    );

    await prisma.buyerProfile.update({
      where: { id: record.id },
      data: { avatarUrl: newUrl },
    });
    migrated += 1;
  }

  return { total: records.length, migrated, missing, skipped };
}

async function migrateUploads() {
  console.log("Starting Cloudinary migration...");

  if (!isCloudinaryEnabled()) {
    console.error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(uploadDir)) {
    console.error(`Upload directory not found: ${uploadDir}`);
    process.exit(1);
  }

  const cache = new Map();

  const propertyStats = await migratePropertyImages(cache);
  const agentStats = await migrateAgentAvatars(cache);
  const buyerStats = await migrateBuyerAvatars(cache);

  console.log("\nMigration summary");
  console.log(`Property images: ${propertyStats.migrated}/${propertyStats.total}`);
  console.log(`Agent avatars: ${agentStats.migrated}/${agentStats.total}`);
  console.log(`Buyer avatars: ${buyerStats.migrated}/${buyerStats.total}`);

  const missing =
    propertyStats.missing + agentStats.missing + buyerStats.missing;
  const skipped =
    propertyStats.skipped + agentStats.skipped + buyerStats.skipped;

  if (missing > 0) {
    console.log(`Missing local files: ${missing}`);
  }
  if (skipped > 0) {
    console.log(`Skipped records (non-uploads URLs): ${skipped}`);
  }

  console.log("Cloudinary migration complete.");
}

migrateUploads()
  .catch((err) => {
    console.error("Migration failed:", err?.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
