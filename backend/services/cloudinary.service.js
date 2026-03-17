import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

let configured = false;
let cloudinaryEnabled = false;

function ensureCloudinaryConfig() {
  if (configured) return;
  configured = true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

  if (cloudinaryEnabled) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
}

export function isCloudinaryEnabled() {
  ensureCloudinaryConfig();
  return cloudinaryEnabled;
}

export function resolveCloudinaryFolder(suffix = "") {
  const defaultFolder = process.env.CLOUDINARY_FOLDER || "realview";
  const base = String(defaultFolder || "").replace(/\/+$/, "");
  const tail = String(suffix || "").replace(/^\/+/, "");
  if (!base && !tail) return "";
  if (!base) return tail;
  if (!tail) return base;
  return `${base}/${tail}`;
}

async function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      console.warn(`Failed to remove local upload ${filePath}:`, err?.message || err);
    }
  }
}

export async function uploadFileToCloudinary(file, options = {}) {
  ensureCloudinaryConfig();
  if (!cloudinaryEnabled) {
    const err = new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
    err.status = 500;
    throw err;
  }
  if (!file?.path) {
    const err = new Error("Upload file is missing a local path.");
    err.status = 400;
    throw err;
  }

  const folder = options.folder || resolveCloudinaryFolder();
  const shouldCleanup = options.cleanup !== false;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  } finally {
    if (shouldCleanup) {
      await safeUnlink(file.path);
    }
  }
}

export async function uploadFilesToCloudinary(files, options = {}) {
  if (!Array.isArray(files) || files.length === 0) return [];

  const results = [];
  for (const file of files) {
    results.push(await uploadFileToCloudinary(file, options));
  }
  return results;
}

export function parseCloudinaryAsset(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.lastIndexOf("upload");
    if (uploadIndex === -1) return null;

    const resourceType = uploadIndex > 0 ? segments[uploadIndex - 1] : "image";
    let after = segments.slice(uploadIndex + 1);
    if (after.length === 0) return null;

    const versionIndex = after.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex !== -1) {
      after = after.slice(versionIndex + 1);
    }
    if (after.length === 0) return null;

    const last = after[after.length - 1];
    after[after.length - 1] = last.replace(/\.[^/.]+$/, "");

    const publicId = after.join("/");
    if (!publicId) return null;

    return { publicId, resourceType };
  } catch {
    return null;
  }
}

export async function deleteCloudinaryAssetByUrl(url) {
  ensureCloudinaryConfig();
  if (!cloudinaryEnabled) return false;
  const asset = parseCloudinaryAsset(url);
  if (!asset) return false;

  try {
    await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType || "image",
    });
    return true;
  } catch (err) {
    console.warn("Failed to delete Cloudinary asset:", err?.message || err);
    return false;
  }
}
