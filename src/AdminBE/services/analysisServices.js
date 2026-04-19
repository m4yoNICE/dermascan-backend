import { db } from "../../config/db.js";
import { sql, desc, eq } from "drizzle-orm";
import {
  skinAnalysis,
  skinConditions,
  users,
  storedImages,
} from "../../drizzle/schema.js";

export async function getAllAnalysis() {
  try {
    const result = await db
      .select({
        id: skinAnalysis.id,
        email: users.email,
        conditionName: skinConditions.condition,
        canRecommend: skinConditions.canRecommend,
        status: skinAnalysis.status,
        confidenceScores: skinAnalysis.confidenceScores,
        photoUrl: storedImages.photoUrl,
        createdAt: skinAnalysis.createdAt,
        updatedAt: skinAnalysis.updatedAt,
      })
      .from(skinAnalysis)
      .leftJoin(skinConditions, eq(skinAnalysis.conditionId, skinConditions.id))
      .leftJoin(users, eq(skinAnalysis.userId, users.id))
      .leftJoin(storedImages, eq(skinAnalysis.imageId, storedImages.id));

    return result;
  } catch (err) {
    console.error("Get all analysis error:", err);
    throw err;
  }
}

export const getAllConditions = async () => {
  return await db
    .select({
      condition: skinConditions.condition,
      count: sql`COUNT(${skinAnalysis.id})`.as("count"),
    })
    .from(skinAnalysis)
    .leftJoin(skinConditions, eq(skinAnalysis.conditionId, skinConditions.id))
    .where(eq(skinAnalysis.status, "success"))
    .groupBy(skinConditions.condition)
    .orderBy(desc(sql`COUNT(${skinAnalysis.id})`));
};
