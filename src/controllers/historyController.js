import { fetchHistory } from "../services/historyServices.js";

export async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = await fetchHistory(userId);

    if (!history) return res.status(404).json({ error: "No history found" });

    return res.status(200).json(
      history.map((entry) => ({
        id: entry.id,
        rawDate: entry.rawDate,
        createdAt: entry.createdAt,
        status: entry.status,
        confidenceScores: entry.confidenceScores,
        condition: entry.condition,
        canRecommend: entry.canRecommend,
        photoUrl: entry.photoUrl,
        products: entry.products.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          productType: p.productType,
          productImage: p.productImage,
          timeRoutine: p.timeRoutine,
        })),
      })),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
