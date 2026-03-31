import { getSkinTypes, getSkinConditions } from "../services/skinTypeFetchServices.js";

export async function handleSkinTypes(req, res) {
    try {
        await getSkinTypes(req, res);
    } catch (err) {
        console.error("Fetch skin types error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
export async function handleSkinConditions(req, res) {
    try {   
        await getSkinConditions(req, res);
    } catch (err) {
        console.error("Fetch skin conditions error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}