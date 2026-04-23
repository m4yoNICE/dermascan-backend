import {
  productRecommendations,
  skinAnalysis,
  skinConditions,
  storedImages,
  skinCareProducts,
} from "../drizzle/schema.js";
import { deleteFromImageKit } from "../utils/imageKitUpload.js";
import { db } from "../config/db.js";
import { eq, desc, and } from "drizzle-orm";

export async function fetchHistory(userId) {
  const rows = await db
    .select({
      analysisId: skinAnalysis.id,
      createdAt: skinAnalysis.createdAt,
      status: skinAnalysis.status,
      confidenceScores: skinAnalysis.confidenceScores,
      condition: skinConditions.condition,
      canRecommend: skinConditions.canRecommend,
      photoUrl: storedImages.photoUrl,
      productId: productRecommendations.productId,
      productName: skinCareProducts.productName,
      productType: skinCareProducts.productType,
      productImage: skinCareProducts.productImage,
      timeRoutine: skinCareProducts.timeRoutine,
    })
    .from(skinAnalysis)
    .leftJoin(skinConditions, eq(skinAnalysis.conditionId, skinConditions.id))
    .leftJoin(storedImages, eq(skinAnalysis.imageId, storedImages.id))
    .leftJoin(
      productRecommendations,
      eq(productRecommendations.analysisId, skinAnalysis.id),
    )
    .leftJoin(
      skinCareProducts,
      eq(productRecommendations.productId, skinCareProducts.id),
    )
    .where(eq(skinAnalysis.userId, userId))
    .orderBy(desc(skinAnalysis.createdAt));

  return groupHistoryRows(rows);
}

export async function deleteHistory(userId, analysisId) {
  //find the specific analysis first for reference and delete
  const [analysis] = await db
    .select({ imageId: skinAnalysis.imageId })
    .from(skinAnalysis)
    .where(
      and(eq(skinAnalysis.id, analysisId), eq(skinAnalysis.userId, userId)),
    )
    .limit(1);

  if (!analysis) return null;

  //delete skin analysis table row first
  await db
    .delete(skinAnalysis)
    .where(
      and(eq(skinAnalysis.id, analysisId), eq(skinAnalysis.userId, userId)),
    );

  //then delete image row (there is an if cos there are some analysis that arent saved as intended)
  if (analysis.imageId) {
    //fetch image url first
    const [image] = await db
      .select({ photoUrl: storedImages.photoUrl })
      .from(storedImages)
      .where(eq(storedImages.id, analysis.imageId))
      .limit(1);

    // then ddelete stored_images row
    await db.delete(storedImages).where(eq(storedImages.id, analysis.imageId));

    // then delete imageurl
    if (image?.photoUrl) await deleteFromImageKit(image.photoUrl);
  }

  return true;
}

//============= helper function ===============

function groupHistoryRows(rows) {
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.analysisId]) {
      grouped[row.analysisId] = {
        id: row.analysisId,
        rawDate: row.createdAt.slice(0, 10),
        createdAt: new Date(row.createdAt).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: row.status,
        confidenceScores: row.confidenceScores,
        condition:
          row.status === "success"
            ? row.condition
            : row.status === "normal"
              ? row.condition
              : row.status === "flagged"
                ? null
                : "Out of Scope",
        canRecommend: row.canRecommend,
        photoUrl: row.photoUrl,
        products: [],
      };
    }
    if (row.productId) {
      grouped[row.analysisId].products.push({
        productId: row.productId,
        productName: row.productName,
        productType: row.productType,
        productImage: row.productImage,
        timeRoutine: row.timeRoutine,
      });
    }
  }
  return rows
    .map((r) => r.analysisId)
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map((id) => grouped[id]);
}
