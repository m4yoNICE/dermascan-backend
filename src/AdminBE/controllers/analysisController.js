import {
  getAllAnalysis,
  getAllConditions,
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
