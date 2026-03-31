import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";
import {
  getAdminData,
  createUsers,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUser,
  getCountUsers,
} from "../controllers/adminUsersController.js";
const router = express.Router();

router.get("/admin", verifyToken, checkAdmin, getAdminData);
router.get("/getData", verifyToken, checkAdmin, getAllUsers);
router.get("/getById/:id", verifyToken, checkAdmin, getUserById);
router.post("/", verifyToken, checkAdmin, createUsers);
router.put("/:id", verifyToken, checkAdmin, updateUser);
router.delete("/delete/:id", verifyToken, checkAdmin, deleteUser);
router.get("/count", verifyToken, checkAdmin, getCountUsers);

export default router;