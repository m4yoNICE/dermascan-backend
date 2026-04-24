import {
  getAllAnalysis,
  getAllConditions,
  getAnalysisByUserId,
} from "../services/analysisServices.js";

export async function handleGetAllAnalysis(req, res) {
  try {
    const result = await getAllAnalysis();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Get all analysis error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export const handleGetAllConditions = async (req, res) => {
  try {
    const result = await getAllConditions();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Get all conditions error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const handleGetAnalysisByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const result = await getAnalysisByUserId(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Get analysis by user ID error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
