import express from "express";
import * as report from "../controllers/generateReportController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";

const router = express.Router();

router.get("/generate/product", verifyToken, checkAdmin, report.generateProductReport);
router.get("/generate/user", verifyToken, checkAdmin, report.generateUserReport);
router.get("/generate/analysis", verifyToken, checkAdmin, report.generateAnalysisReport);

export default router;