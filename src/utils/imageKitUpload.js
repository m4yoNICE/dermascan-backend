import ImageKit from "@imagekit/nodejs";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
});
export async function uploadToImageKit(buffer, fileName, folder = "/general") {
  const result = await imagekit.files.upload({
    file: buffer,
    fileName,
    folder,
  });
  return result.url;
}
