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
  //first api call
  const results = await imagekit.files.list({
    searchQuery: `url = "${fileUrl}"`,
  });
  if (!results?.length) return false;
  //2nd api call
  await imagekit.files.delete(results[0].fileId);
  return true;
}