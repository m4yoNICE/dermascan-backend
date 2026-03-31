import fs from "node:fs";
import path from "node:path";

export async function saveBufferImage(buffer) {
  const uploadsDir = path.join(process.cwd(), "skinUploads");
  try {
    await fs.mkdirSync(uploadsDir, { recursive: true });
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `image-${uniqueSuffix}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFileSync(filepath, buffer);
    return filename;
  } catch (err) {
    console.error("Error creating uploads directory:", err);
    throw err;
  }
}
