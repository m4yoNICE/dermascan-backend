import { db } from "../config/db.js";
import { eq, and, desc } from "drizzle-orm";
import { users } from "../drizzle/schema.js";
import { otp } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";

import { createAccessToken } from "../utils/createAccessToken.js";
import { sendEmail } from "../utils/sendOTP.js";

//Processes user login business logic.
export async function processLogin(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const payload = { id: user.id, email: user.email };
  const token = await createAccessToken(payload);

  return { user, token };
}

//Processes user registration business logic
export async function processRegister(
  email,
  firstname,
  dob,
  lastname,
  password,
) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }
  //id 2 is for users; id 1 is for admin
  const role = 2;
  const newUser = await createUser(
    email,
    firstname,
    dob,
    lastname,
    password,
    role,
  );
  if (!newUser) throw new Error("REGISTER_FAILED");

  const payload = { id: newUser.id, email: newUser.email };
  const token = await createAccessToken(payload);

  return { token, newUser };
}

//Handles forgot-password business logic
export async function forgetPasswordProcess(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  console.log("user id: ", user.id);
  await usedOTP(user.id, otp);
  await saveOTP(user.id, otp, expiresAt);

  const sent = await sendEmail(email, otp);
  if (!sent) {
    throw new Error("EMAIL_SEND_FAILED");
  }
}

// Verifies OTP business logic
export async function checkOtpProcess(email, otp_code) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("OTP_INVALID");

  const storedOTP = await findOTP(user.id, otp_code);
  if (!storedOTP) throw new Error("OTP_INVALID");

  if (Date.now() > new Date(storedOTP.expiresAt).getTime()) {
    throw new Error("OTP_EXPIRED");
  }

  await db.update(otp).set({ isUsed: true }).where(eq(otp.id, storedOTP.id));

  return user.id;
}

// Resets user password busines logic
export async function resetPasswordProcess(email, newPassword) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("USER_NOT_FOUND");

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new Error("PASSWORD_REUSED");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, email));

  return true;
}

/**---------------------------------------------------------------------------------------------------------
 * Helper Functions
 *
 */
export async function findUserByEmail(email) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function createUser(
  email,
  first_name,
  birthdate,
  last_name,
  password,
  role,
) {
  console.log("role value:", role);

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    firstName: first_name,
    lastName: last_name,
    birthdate,
    password: passwordHash,
    roleId: role,
  });

  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function saveOTP(user_id, otp_code, expiresAt) {
  await db.insert(otp).values({
    userId: user_id,
    otpCode: otp_code,
    isUsed: false,
    expiresAt,
  });

  return await db.query.otp.findFirst({
    where: and(
      eq(otp.userId, user_id),
      eq(otp.otpCode, otp_code),
      eq(otp.isUsed, false),
    ),
    orderBy: desc(otp.createdAt),
  });
}

export async function usedOTP(userId) {
  return await db
    .update(otp)
    .set({ isUsed: true })
    .where(and(eq(otp.userId, userId), eq(otp.isUsed, false)));
}

export async function findOTP(user_id, otp_code) {
  return await db.query.otp.findFirst({
    where: and(
      eq(otp.userId, user_id),
      eq(otp.otpCode, otp_code),
      eq(otp.isUsed, false),
    ),
    orderBy: desc(otp.createdAt),
  });
}

export async function resetPasword(email, password) {
  const hashed = await bcrypt.hash(password, 10);
  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.email, email));

  return await findUserByEmail(email);
}
