import express from "express";
import {
  edituser,
  deleteuser,
  getuserid,
  createskindata,
  deleteskindata,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/skin", verifyToken, createskindata);
router.delete("/skinreset", verifyToken, deleteskindata);
router.get("/", verifyToken, getuserid);
router.put("/", verifyToken, edituser);
router.delete("/", verifyToken, deleteuser);

export default router;
