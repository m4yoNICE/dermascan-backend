import express from "express";
import {
  setUserRoutine,
  editUserRoutine,
  getRoutineProducts,
  completeSchedule,
  getReminderLogs,
  activateLoadout,
  getRoutineSchedule
} from "../controllers/routineController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

//routine schedule
router.get("/schedule", verifyToken, getRoutineSchedule);
router.post("/schedule", verifyToken, setUserRoutine);
router.put("/schedule", verifyToken, editUserRoutine);

//reminders
router.get("/products", verifyToken, getRoutineProducts);
router.post("/complete", verifyToken, completeSchedule);
router.get("/logs", verifyToken, getReminderLogs);

//activate loadout
router.patch("/activate", verifyToken, activateLoadout);

export default router;
