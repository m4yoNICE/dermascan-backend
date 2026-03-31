import multer from "multer";
import path from "path";
import fs from "fs";

export function diskSaveMulter() {
  const uploadDir = path.join(process.cwd(), "productUploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const unique = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
  });
}
