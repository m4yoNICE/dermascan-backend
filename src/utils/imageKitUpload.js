import ImageKit from "@imagekit/nodejs";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadToImageKit(buffer, fileName, folder = "/general") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
  const start = Date.now();
  console.log(`[ImageKit] Starting upload...`);
  const result = await imagekit.files.upload(
    {
      file: buffer,
      fileName,
      folder,
    },
    { signal: controller.signal },
  );
  console.log(`[ImageKit] Upload done in ${Date.now() - start}ms`);
  return result.url;
  } finally {
    clearTimeout(timeout);
  }
}