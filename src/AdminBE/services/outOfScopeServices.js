import { db } from "../../config/db.js";
import { eq, sql } from "drizzle-orm";
import 
{ 
    skinAnalysis,
    skinConditions,
    users
} from "../../drizzle/schema.js";

export async function getScanPerDay(req, res) {
  try {
    const scansPerDay = await db
      .select({
        date: sql`DATE(${skinAnalysis.createdAt})`,
        count: sql`COUNT(*)`,
      })
      .from(skinAnalysis)
      .groupBy(sql`DATE(${skinAnalysis.createdAt})`)
      .orderBy(sql`DATE(${skinAnalysis.createdAt})`);

    return res.status(200).json(scansPerDay);
  } catch (err) {
    console.error("Get scans per day error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getOutOfScopeStatistics(req, res) {  
    try {
        const result = await db
        .select({
        skinAnalysisId: skinAnalysis.id,
        skinConditionsId: skinConditions.id,
        email: users.email,
        conditionName: skinConditions.condition,
        canRecommend: skinConditions.canRecommend,
        status: skinAnalysis.status,
        confidenceScores: skinAnalysis.confidenceScores,
        createdAt: skinAnalysis.createdAt,
        updatedAt: skinAnalysis.updatedAt,
        })
        .from(skinAnalysis)
        .leftJoin(
        skinConditions,
          eq(skinAnalysis.conditionId, skinConditions.id)
        )
        .leftJoin(
          users, 
          eq(skinAnalysis.userId, users.id))
        .where(eq(skinConditions.canRecommend, "no"));

        return res.status(200).json(result);
    }catch (err) {
        console.error("Get out of scope statistics error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function deleteOutOfScope(req, res) {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(skinConditions)
      .where(eq(skinConditions.id, Number(id)));

    return res.status(200).json({
      message: "Condition deleted successfully",
    });
  } catch (err) {
    console.error("Delete out of scope error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function fetchOutOfScopeNoRecommendation(){
  try {
    const result = await db
  .select({
    count: sql`COUNT(*)`,
  })
  .from(skinConditions)
  .where(eq(skinConditions.canRecommend, "no"));
    return result;
  } catch (err) {
    console.error("Fetch out of scope no recommendation error:", err);
    throw new Error("Server error");
  }
}