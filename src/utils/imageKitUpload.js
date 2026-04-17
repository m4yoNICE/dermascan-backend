import ImageKit, { toFile } from "@imagekit/nodejs";
import sharp from "sharp";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
  timeout: 15 * 1000,
});

export async function uploadToImageKit(buffer, fileName, folder = "/general") {
  console.log(
    `  → [ImageKit] Compressing image... (original: ${(buffer.length / 1024).toFixed(1)}KB)`,
  );
  //compress image after analysis not before
  const compressed = await sharp(buffer).jpeg({ quality: 70 }).toBuffer();
  console.log(
    `  → [ImageKit] Compressed to: ${(compressed.length / 1024).toFixed(1)}KB. Uploading...`,
  );
  if (!compressed || compressed.length === 0) {
    throw new Error("Sharp compression returned empty buffer");
  }

  const result = await imagekit.files.upload({
    file: await toFile(compressed, fileName),
    fileName,
    folder,
  });

  console.log(`  → [ImageKit] Upload done. URL: ${result.url}`);
  return result.url;
}

export async function deleteFromImageKit(fileUrl) {
  // extract fileId from URL - ImageKit URLs contain the fileId in the path
  // URL format: https://ik.imagekit.io/your_id/folder/filename
  // Use the search API via fetch directly since new SDK doesn't expose listFiles
  
  const searchUrl = `https://api.imagekit.io/v1/files?searchQuery=url="${encodeURIComponent(fileUrl)}"`;
  
  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(ENV.IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`,
    },
  });

  const results = await response.json();
  if (!results?.length) return false;

  await fetch(`https://api.imagekit.io/v1/files/${results[0].fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${Buffer.from(ENV.IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`,
    },
  });

  return true;
}
