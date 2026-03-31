import { users, role } from "../../drizzle/schema.js";
import { db } from "../../config/db.js";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Get admin data by user ID
 */
export async function getAdminDataProcess(userId) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

/**
 * Get all users (with role fetched separately)
 */
export async function getAllUsersProcess() {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      password: users.password,
      roleId: users.roleId,
      roleName: role.roleName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(role, eq(users.roleId, role.id));

  return result.map((row) => ({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    password: row.password,
    roleId: row.roleId,
    role: row.roleName
      ? {
          id: row.roleId,
          roleName: row.roleName,
        }
      : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get user by ID
 */
export async function getUserByIdProcess(id) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

/**
 * Create new user
 */
export async function createUsersProcess(
  email,
  first_name,
  last_name,
  password,
  role_id,
  birthdate,
) {
  if (!email || !first_name || !last_name || !password || !role_id) {
    throw new Error("INCOMPLETE_FIELDS");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingUser) throw new Error("EMAIL_FOUND");

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db
    .insert(users)
    .values({
      email,
      firstName: first_name,
      lastName: last_name,
      password: hashedPassword,
      roleId: role_id,
      birthdate: birthdate || null,
    })
    .$returningId();

  return await db.query.users.findFirst({ where: eq(users.id, result.id) });
}

/**
 * Delete user
 */
export async function deleteUserProcess(id) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(id)),
  });
  if (!user) throw new Error("ACCOUNT_NOT_FOUND");

  await db.delete(users).where(eq(users.id, Number(id)));
  return user;
}

/**
 * Update user
 */
export async function updateUserProcess(
  id,
  first_name,
  last_name,
  email,
  password,
  role_id,
  birthdate,
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(id)),
  });
  if (!user) throw new Error("USER_NOT_FOUND");

  const hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : user.password;

  await db
    .update(users)
    .set({
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword,
      roleId: role_id,
      birthdate: birthdate || null,
    })
    .where(eq(users.id, Number(id)));

  return await db.query.users.findFirst({ where: eq(users.id, Number(id)) });
}

/**
 * Find admin by email
 */
export async function findAdminByEmail(email) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) return null;

  const roleData = await db.query.role.findFirst({
    where: eq(role.id, user.roleId),
  });
  return {
    ...user,
    role: roleData || null,
  };
}
/**
 * Get user count
 */
export async function countUsersProcess() {
  const result = await db
    .select({ count: count() })
    .from(users);

  return result[0].count;
}