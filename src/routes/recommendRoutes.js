import express from "express";
import * as recommend from "../controllers/recommendController.js";
import * as history from "../controllers/historyController.js"
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
/*
    I didnt make a new route file for history since get history is basically a fetch recommendation
*/

//recommendation
router.post("/", verifyToken, recommend.saveRecommendation);
//history
router.get("/", verifyToken, history.getHistory);
router.delete("/:id", verifyToken, history.deleteHistory)

export default router;
