import express from "express";
import * as out from "../controllers/outOfScopeController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";

const router = express.Router();

router.get("/scans", verifyToken, checkAdmin, out.handleGetScanPerDay);
router.get("/out-of-scope", verifyToken, checkAdmin, out.handleGetOutOfScopeStatistics);
router.delete("/out-of-scope/:id", verifyToken, checkAdmin, out.handleDeleteOutOfScope);
router.get("/no-recommendation", verifyToken, checkAdmin, out.handleFetchOutOfScopeNoRecommendation);


export default router;