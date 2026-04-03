import ImageKit from "@imagekit/nodejs";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  publicKey: ENV.IMAGEKIT_PUBLIC_KEY,
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT,
});
export async function uploadToImageKit(buffer, fileName, folder = "/general") {
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
  });
  return result.url;
}
