import express from "express";
import * as recommend from "../controllers/recommendController.js";
import * as history from "../controllers/historyController.js"
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, history.getHistory);
router.post("/", verifyToken, recommend.saveRecommendation);

export default router;
