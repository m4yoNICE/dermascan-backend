import express from "express";
import {
  login,
  register,
  forgetPassword,
  checkOtp,
  resetPassword,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgetpassword", forgetPassword);
router.post("/checkOTP", checkOtp);
router.put("/resetpassword", resetPassword);

export default router;
