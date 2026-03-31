import { storedImages } from "../drizzle/schema.js";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm";

export async function createStoredImage(userId, imageUrl) {
  const [inserted] = await db
    .insert(storedImages)
    .values({
      photoUrl: imageUrl,
      userId: userId,
    })
    .$returningId();

  const image = await db
    .select()
    .from(storedImages)
    .where(eq(storedImages.id, inserted.id));

  return image[0];
}

export async function getImageById(image_id, user_id) {
  return await db.query.storedImages.findFirst({
    where: (eq(storedImages.id, image_id), eq(storedImages.userId, user_id)),
  });
}

export async function getStoredImageById(imageId) {
  return await db.query.storedImages.findFirst({
    where: eq(storedImages.id, imageId),
  });
}
