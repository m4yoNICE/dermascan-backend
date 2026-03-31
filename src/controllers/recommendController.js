import * as recommendationService from "../services/recommendServices.js";

export async function saveRecommendation(req, res) {
  try {
    const { analysisId, productIds } = req.body;
    console.log("saveRecommendation hit:", { analysisId, productIds });

    if (!analysisId || !productIds?.length) {
      return res
        .status(400)
        .json({ error: "Analysis records and selected products are required" });
    }

    await recommendationService.insertRecommendations(analysisId, productIds);
    res.status(201).json({ success: true, message: "Recommendations saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}


