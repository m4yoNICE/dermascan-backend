import { analyzeSkinOrchestrator } from "../application/skinAnalysisOrchestrator.js";
import { recommendOrchestrator } from "../application/productRecommendationOrchestrator.js";
import {
  fetchAnalysisLogsByUser,
  getConditionById,
} from "../services/skinAnalysisDBMapping.js";
import {
  buildAnalysisDescription,
  buildRecommendDescription,
} from "../utils/resultDescription.js";
// === MAIN IMAGE PROCESSING LOGIC ===
// Handles the full lifecycle of a skin analysis request

export async function skinAnalysis(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const analysisResult = await analyzeSkinOrchestrator(
      req.user.id,
      req.file.buffer,
    );
    let recommendationResult = null;
    let conditionData = null;

    if (analysisResult.payload.result === "success") {
      console.log("begin recommendations");
      recommendationResult = await recommendOrchestrator(
        analysisResult.payload.data.id,
        req.user.id,
        analysisResult.payload.data.conditionId,
      );
      conditionData = await getConditionById(
        analysisResult.payload.data.conditionId,
      );
    }

    console.log("analysis Result: ", analysisResult);
    console.log("Recommendation Result: ", recommendationResult);

    const analysisDescription =
      analysisResult.payload.result === "success"
        ? buildAnalysisDescription(
            analysisResult.payload.data,
            analysisResult.payload.data.top3,
          )
        : null;

    const recommendDescription =
      analysisResult.payload.result === "success"
        ? buildRecommendDescription(conditionData, recommendationResult)
        : null;


    return res.status(analysisResult.statusCode).json({
      analysis: analysisResult.payload,
      recommendation: recommendationResult,
      analysisDescription,
      recommendDescription,
    });
  } catch (err) {
    console.error("Error in skinAnalysisController:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAnalysisLogsByUser(req, res) {
  try {
    const userId = req.user.id;
    const logs = await fetchAnalysisLogsByUser(userId);
    return res.status(200).json(logs);
  } catch (err) {
    console.error("Error fetching all journal:", err);
    res.status(500).json({ error: "Server error" });
  }
}
