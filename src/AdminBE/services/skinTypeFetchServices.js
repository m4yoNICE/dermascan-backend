import {db} from '../../config/db.js';
import { skinProfile, skinConditions } from '../../drizzle/schema.js';
import { eq } from "drizzle-orm"

export async function getSkinTypes(req, res) {
    try {

        
    const skinTypes = await db
      .select({
        skinType: skinProfile.skinType,
      })
      .from(skinProfile);

    return res.status(200).json(skinTypes);

    } catch (err) {
        console.error("Get skin types error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function getSkinConditions(req, res) {
  try {
    const skinConditionsData = await db
      .select({
        id : skinConditions.id,
        condition: skinConditions.condition,
      })
      .from(skinConditions);
    return res.status(200).json(skinConditionsData);
  } catch (error) {
    console.error("Get skin conditions error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}