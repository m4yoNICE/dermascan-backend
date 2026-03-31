import { fetchRoutineSchedule } from "../services/routineServices.js";
import {
  updateUser,
  deleteUser,
  getUserWithSkinData,
  createSkinData,
  deleteSkinData,
} from "../services/userServices.js";

export async function getuserid(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUserWithSkinData(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const routine = await fetchRoutineSchedule(userId);

    return res.status(200).json({ user, routine });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function edituser(req, res) {
  try {
    const userId = req.user.id;
    const { firstname, lastname, birthdate, currentPassword, newPassword } =
      req.body;

    const result = await updateUser(
      userId,
      firstname,
      lastname,
      birthdate,
      currentPassword,
      newPassword,
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    const updatedUser = await getUserWithSkinData(userId);
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteuser(req, res) {
  try {
    const userId = req.user.id;
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
export async function deleteskindata(req, res) {
  try {
    const userId = req.user.id;
    await deleteSkinData(userId);

    res.status(200).json({ message: "Skin data cleared successfully" });
  } catch (err) {
    console.error("Error deleting skin data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createskindata(req, res) {
  try {
    const { skin_type, skin_sensitivity } = req.body;
    const userId = req.user.id;
    console.log("hehe: ", skin_sensitivity, skin_type);

    if (!skin_type || !skin_sensitivity) {
      console.log("Missing Required Fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await createSkinData(userId, skin_type, skin_sensitivity);
    res
      .status(200)
      .json({ message: "Skin data added successfully", data: result });
  } catch (err) {
    console.error("Create skin data error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
