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

  export async function skinAnalysis(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      // drop ref early so if not used, then auto GC

      let buffer = req.file.buffer;
      req.file.buffer = null;
      // start skin condition analysis
      const analysisResult = await analyzeSkinOrchestrator(req.user.id, buffer);

      // after orchestrator, kill the buffer reference to release memory
      buffer = null;
      // recommendation and results description building
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
              analysisResult.payload.data.candidates,
            )
          : null;

      const recommendDescription =
        analysisResult.payload.result === "success"
          ? buildRecommendDescription(
              conditionData,
              recommendationResult?.scoredProducts ?? [], // put maybe-null value, to accept null recommendation so we can still recommend without any products
              recommendationResult?.skinData, // this too.
            )
          : null;
          
      // putting null in recommendation so it wouldnt go to 500, as it accepts no recommendation just in case.
      return res.status(analysisResult.statusCode).json({
        analysis: analysisResult.payload,
        recommendation: recommendationResult?.scoredProducts ?? null,
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
