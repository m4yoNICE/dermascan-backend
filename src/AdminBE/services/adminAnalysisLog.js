import { users, role } from "../../drizzle/schema.js";
import { db } from "../../config/db.js";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import 
{ 
    skinAnalysisTransactions,
    skinConditions
} from "../../drizzle/schema.js";

export async function getScanPerDay(req, res) {
  try {
    const scansPerDay = await db
      .select({
        date: sql`DATE(${skinAnalysisTransactions.createdAt})`,
        count: sql`COUNT(*)`,
      })
      .from(skinAnalysisTransactions)
      .groupBy(sql`DATE(${skinAnalysisTransactions.createdAt})`)
      .orderBy(sql`DATE(${skinAnalysisTransactions.createdAt})`);

    return res.status(200).json(scansPerDay);
  } catch (err) {
    console.error("Get scans per day error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getOutOfScopeStatistics(req, res) {  
    try {
        const conditionCounts = await db
        .select({
        id: skinConditions.id,
        conditionName: skinConditions.condition,
        canRecommend: skinConditions.canRecommend,
        })
        .from(skinConditions)
        .where(eq(skinConditions.canRecommend, "no"));

        return res.status(200).json(conditionCounts);
    }catch (err) {
        console.error("Get out of scope statistics error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}