import { db } from "../config/db.js";
import { users, skinProfile } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

//update User
export async function updateUser(
  userId,
  firstname,
  lastname,
  birthdate,
  currentPassword,
  newPassword,
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return { success: false, message: "User not found" };

  const data = {};
  if (firstname) data.firstName = firstname;
  if (lastname) data.lastName = lastname;
  if (birthdate) data.birthdate = birthdate;
  if (newPassword) {
    if (!currentPassword)
      return { success: false, message: "Current password required" };
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return { success: false, message: "Incorrect current password" };
    data.password = await bcrypt.hash(newPassword, 10);
  }

  await db.update(users).set(data).where(eq(users.id, userId));
  return { success: true };
}

export async function deleteUser(userId) {
  const [result] = await db.delete(users).where(eq(users.id, userId));
  return (result?.affectedRows ?? 0) > 0;
}

export async function getUserWithSkinData(userId) {
  const result = await db
    .select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      birthdate: users.birthdate,
      skinType: skinProfile.skinType,
      skinSensitivity: skinProfile.skinSensitivity,
    })
    .from(users)
    .leftJoin(skinProfile, eq(skinProfile.userId, users.id))
    .where(eq(users.id, userId));

  return result[0] || null;
}

export async function createSkinData(userId, skin_type, skin_sensitivity) {
  console.log("User Came Here! ", userId, skin_sensitivity, skin_type);
  const [inserted] = await db
    .insert(skinProfile)
    .values({ userId, skinType: skin_type, skinSensitivity: skin_sensitivity })
    .onDuplicateKeyUpdate({
      set: {
        skinType: skin_type,
        skinSensitivity: skin_sensitivity,
      },
    });

  return await db.query.skinProfile.findFirst({
    where: eq(skinProfile.id, inserted.id),
  });
}

export async function deleteSkinData(userId) {
  const [result] = await db
    .delete(skinProfile)
    .where(eq(skinProfile.userId, userId));
  return (result?.affectedRows ?? 0) > 0;
}
