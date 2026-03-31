import {
  getAdminDataProcess,
  getAllUsersProcess,
  getUserByIdProcess,
  createUsersProcess,
  deleteUserProcess,
  updateUserProcess,
  countUsersProcess,
} from "../services/adminUserServices.js";

// Get admin data
export async function getAdminData(req, res) {
  try {
    const admin = await getAdminDataProcess(req.user.id); // ← Added await

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    return res.status(200).json({
      id: admin.id,
      email: admin.email,
      role: admin.role_id === 1 ? "admin" : "user",
    });
  } catch (err) {
    console.error("Get admin data error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Get user by ID
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserByIdProcess(Number(id)); // ← Use service

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Get all users
export async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersProcess();

    return res.status(200).json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Server error fetching users" });
  }
}

// Create user
export async function createUsers(req, res) {
  try {
    const { email, first_name, last_name, password, role_id, birthdate } =
      req.body;

    const newUser = await createUsersProcess(
      // ← Added const
      email,
      first_name,
      last_name,
      password,
      role_id,
      birthdate,
    );

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Create user error:", err);

    if (err.message === "INCOMPLETE_FIELDS") {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (err.message === "EMAIL_FOUND") {
      return res.status(409).json({ error: "User already exists" });
    }

    return res.status(500).json({ error: "Server error" });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await deleteUserProcess(id);

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    if (err.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ error: "Account did not exist" });
    }

    return res.status(500).json({ error: "Server error" });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password, role_id, birthdate } =
      req.body;

    const updatedUser = await updateUserProcess(
      id,
      first_name,
      last_name,
      email,
      password,
      role_id,
      birthdate,
    );

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update user error:", err);

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(500).json({ error: "Server error while updating user" });
  }
}

export async function getCountUsers(req, res) {
  try {
    const count = await countUsersProcess();
    return res.status(200).json({ count });
  } catch (err) {
    console.error("Get user count error:", err);
    return res.status(500).json({ error: "Server error fetching user count" });
  }
}