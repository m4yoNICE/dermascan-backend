import express from "express";
import * as skinCareController from "../controllers/skinCareProductController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";
import { memorySaveMulter } from "../../middleware/memorySaveMulter.js";

const router = express.Router();
const upload = memorySaveMulter();

router.get(
  "/getSkinProducts",
  verifyToken,
  checkAdmin,
  skinCareController.getAllProducts,
);
router.get(
  "/getSkinProductsById/:id",
  verifyToken,
  checkAdmin,
  skinCareController.getProductById,
);
router.post(
  "/createSkinProduct",
  verifyToken,
  checkAdmin,
  upload.single("productImage"),
  skinCareController.createProduct,
);
router.put(
  "/updateSkinProduct/:id",
  verifyToken,
  checkAdmin,
  upload.single("productImage"),
  skinCareController.updateProduct,
);
router.delete(
  "/deleteSkinProduct/:id",
  verifyToken,
  checkAdmin,
  skinCareController.deleteProduct,
);
router.get(
  "/getConditionCounts",
  verifyToken,
  checkAdmin,
  skinCareController.getConditionCounts,
);
router.get(
  "/getConditionCountsByProduct",
  verifyToken,
  checkAdmin,
  skinCareController.handleFetchConditionProducts,
);
router.get(
  "/getAllProductImages",
  verifyToken,
  checkAdmin,
  skinCareController.handleGetAllProductImages,
);

export default router;
