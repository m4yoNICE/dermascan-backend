import { getImageById } from "../services/imagesServices.js";
import path from "path";

export async function getImage(req, res) {
  try {
    const userId = req.user.id;
    const imageId = req.params.id;
    const image = await getImageById(imageId, userId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const filename = path.basename(image.photoUrl);
    return res.status(200).json(filename);
  } catch (err) {
    console.error("Error fetching image by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
}
