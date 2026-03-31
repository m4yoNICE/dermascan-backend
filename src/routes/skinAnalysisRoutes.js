import express from "express";
import { skinAnalysis, getAnalysisLogsByUser } from "../controllers/skinAnalysisController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { memorySaveMulter } from "../middleware/memorySaveMulter.js";

const router = express.Router();

router.post(
  "/skin",
  verifyToken,
  memorySaveMulter().single("image"),
  skinAnalysis,
);
router.get("/", verifyToken, getAnalysisLogsByUser);
export default router;
