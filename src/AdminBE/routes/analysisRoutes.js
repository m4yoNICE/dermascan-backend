import express from "express";
import {
  handleGetAllAnalysis,
  handleGetAllConditions,
  handleGetAnalysisByUserId
} from "../controllers/analysisController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, handleGetAllAnalysis);
router.get("/condition/", verifyToken, checkAdmin, handleGetAllConditions);
router.get("/user/:userId", verifyToken, checkAdmin, handleGetAnalysisByUserId);

export default router;
