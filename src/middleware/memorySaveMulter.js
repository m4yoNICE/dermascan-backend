import multer from "multer";

export function memorySaveMulter() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
  });
}
