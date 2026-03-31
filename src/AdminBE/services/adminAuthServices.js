import { db } from "../../config/db.js";
import { users, role } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
/**
 * Processes admin login authentication
 *
 * @async
 * @function loginProcess
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} User data and JWT token
 * @throws {Error} INVALID_CREDENTIALS - Wrong email/password
 * @throws {Error} NOT_ADMIN - User is not an admin
 */
export async function loginProcess(email, password) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });


  if (!user) throw new Error("INVALID_CREDENTIALS");
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new Error("INVALID_CREDENTIALS");

  const roleInfo = await db.query.role.findFirst({
    where: eq(role.id, user.roleId),
  });

  if (!roleInfo || roleInfo.id !== 1) throw new Error("NOT_ADMIN");
  const payload = {
    id: user.id,
    email: user.email,
    role: {
      id: roleInfo.id,
      role_name: roleInfo.roleName,
    },
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "6h" });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: payload.role,
    },
    token,
  };
}
