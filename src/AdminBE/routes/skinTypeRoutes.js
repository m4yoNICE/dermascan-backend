import express from "express";
import { handleSkinTypes,handleSkinConditions } from "../controllers/skinTypeController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";
import { handleGetScanPerDay } from "../controllers/outOfScopeController.js";

const router = express.Router();

router.get("/getSkinTypes", verifyToken, checkAdmin, handleSkinTypes);
router.get("/scans", verifyToken, checkAdmin, handleGetScanPerDay);
router.get("/skinConditions", verifyToken, checkAdmin, handleSkinConditions);

export default router;