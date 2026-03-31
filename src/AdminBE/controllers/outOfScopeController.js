import {
    getScanPerDay,
    getOutOfScopeStatistics,
    deleteOutOfScope,
    fetchOutOfScopeNoRecommendation
} from "../services/outOfScopeServices.js";

export async function handleGetScanPerDay(req, res) {
    try {
        await getScanPerDay(req, res);
    } catch (err) {
        console.error("Get scans per day error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function handleGetOutOfScopeStatistics(req, res) {
    try {
        await getOutOfScopeStatistics(req, res);
    } catch (err) {
        console.error("Get out of scope statistics error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function handleDeleteOutOfScope(req, res) {
    try {
        await deleteOutOfScope(req, res);
    } catch (err) {
        console.error("Delete out of scope error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function handleFetchOutOfScopeNoRecommendation(req, res) {
  try {
    const result = await fetchOutOfScopeNoRecommendation(req, res);
    return res.status(200).json({ success: true, message: "Fetched no recommendation conditions successfully.", data: result });
  } catch (err) {
    console.error("Fetch out of scope no recommendation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}