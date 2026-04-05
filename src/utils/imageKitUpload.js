import ImageKit from "@imagekit/nodejs";
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
  const compressed = await sharp(buffer).jpeg({ quality: 70 }).toBuffer();
  console.log(
    `  → [ImageKit] Compressed to: ${(compressed.length / 1024).toFixed(1)}KB. Uploading...`,
  );
  if (!compressed || compressed.length === 0) {
    throw new Error("Sharp compression returned empty buffer");
  }

  const result = await imagekit.files.upload({
    file: compressed,
    fileName,
    folder,
  });

  console.log(`  → [ImageKit] Upload done. URL: ${result.url}`);
  return result.url;
}