import ImageKit from "@imagekit/nodejs";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
  timeout: 15 * 1000,
});

export async function uploadToImageKit(buffer, fileName, folder = "/general") {
  console.log(
    `  → [ImageKit] Compressing image... (original: ${(buffer.length / 1024).toFixed(1)}KB)`,
  );
  const result = await imagekit.files.upload({
    file: buffer,
    fileName,
    folder,
  });

  console.log(`  → [ImageKit] Upload done. URL: ${result.url}`);
  return result.url;
}