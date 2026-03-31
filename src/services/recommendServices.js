import { productRecommendations } from "../drizzle/schema.js";
import { db } from "../config/db.js";

export async function insertRecommendations(analysisId, productIds) {
  const values = productIds.map((productId) => ({ analysisId, productId }));
  await db.insert(productRecommendations).values(values);
}
