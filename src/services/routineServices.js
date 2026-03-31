import {
  userRoutine,
  reminderLogs,
  skinCareProducts,
  productRecommendations,
  skinAnalysis,
} from "../drizzle/schema.js";
import { getInstructions } from "../utils/routineInstructions.js";
import { db } from "../config/db.js";
import { eq, desc, and } from "drizzle-orm";

export async function fetchRoutineProducts(userId) {
  const analysisId = await getActiveOrLatestAnalysisId(userId);
  if (!analysisId) return [];

  const rows = await fetchProductRowsByAnalysis(analysisId, userId);
  return shapeRoutineProducts(rows);
}

async function getActiveOrLatestAnalysisId(userId) {
  const routine = await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });

  console.log("[routine] userRoutine row:", routine);
  console.log("[routine] activeAnalysisId:", routine?.activeAnalysisId);

  if (routine?.activeAnalysisId) return routine.activeAnalysisId;

  const [latest] = await db
    .select({ id: skinAnalysis.id })
    .from(skinAnalysis)
    .where(eq(skinAnalysis.userId, userId))
    .orderBy(desc(skinAnalysis.createdAt))
    .limit(1);

  return latest?.id ?? null;
}

export async function fetchReminderLogs(userId) {
  return await db
    .select()
    .from(reminderLogs)
    .where(eq(reminderLogs.userId, userId));
}

export async function insertReminderLog(userId, schedule) {
  const today = new Date().toISOString().slice(0, 10);

  // get active analysis id from userRoutine
  const routine = await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });

  const existing = await db
    .select()
    .from(reminderLogs)
    .where(
      and(
        eq(reminderLogs.userId, userId),
        eq(reminderLogs.schedule, schedule),
        eq(reminderLogs.completedDate, today),
      ),
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(reminderLogs).values({
    userId,
    analysisId: routine?.activeAnalysisId ?? null,
    schedule,
    completedDate: today,
  });
}

export async function fetchRoutineSchedule(userId) {
  const result = await db
    .select({
      morningTime: userRoutine.morningTime,
      eveningTime: userRoutine.eveningTime,
    })
    .from(userRoutine)
    .where(eq(userRoutine.userId, userId));

  return result[0] ?? null;
}

// ======= USER SCHEDULE CRUD =======

export async function insertUserRoutine(userId, morningTime, eveningTime) {
  //upsert using onDuplicateKeyUpdate
  await db
    .insert(userRoutine)
    .values({ userId, morningTime, eveningTime })
    .onDuplicateKeyUpdate({ set: { morningTime, eveningTime } });
  return await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });
}

export async function updateUserRoutine(userId, morningTime, eveningTime) {
  await db
    .update(userRoutine)
    .set({ morningTime, eveningTime })
    .where(eq(userRoutine.userId, userId));
  return await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });
}

export async function updateActiveLoadout(userId, analysisId) {
  const analysis = await db.query.skinAnalysis.findFirst({
    where: and(
      eq(skinAnalysis.id, analysisId),
      eq(skinAnalysis.userId, userId),
    ),
  });
  if (!analysis)
    throw new Error("Analysis not found or does not belong to user");

  const existing = await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });

  if (existing) {
    await db
      .update(userRoutine)
      .set({ activeAnalysisId: analysisId })
      .where(eq(userRoutine.userId, userId));
  } else {
    await db
      .insert(userRoutine)
      .values({ userId, activeAnalysisId: analysisId });
  }

  return await db.query.userRoutine.findFirst({
    where: eq(userRoutine.userId, userId),
  });
}

// ============= HELPER FUNCTIONS ==========

function resolveRoutineTime(timeRoutine, morningTime, eveningTime) {
  const isMorning = timeRoutine?.toLowerCase().includes("morning");
  const isNight = timeRoutine?.toLowerCase().includes("night");

  if (!morningTime && !eveningTime) return timeRoutine;
  if (isMorning && isNight) return `${morningTime} / ${eveningTime}`;
  if (isMorning) return morningTime;
  if (isNight) return eveningTime;

  return timeRoutine;
}

async function fetchProductRowsByAnalysis(analysisId, userId) {
  return await db
    .select({
      id: productRecommendations.id,
      productName: skinCareProducts.productName,
      productImage: skinCareProducts.productImage,
      productType: skinCareProducts.productType,
      timeRoutine: skinCareProducts.timeRoutine,
      morningTime: userRoutine.morningTime,
      eveningTime: userRoutine.eveningTime,
    })
    .from(productRecommendations)
    .innerJoin(
      skinCareProducts,
      eq(productRecommendations.productId, skinCareProducts.id),
    )
    .leftJoin(userRoutine, eq(userRoutine.userId, userId))
    .where(eq(productRecommendations.analysisId, analysisId));
}

function shapeRoutineProducts(rows) {
  return rows.map((row) => ({
    id: row.id,
    productName: row.productName,
    productImage: row.productImage,
    productType: row.productType,
    schedule: row.timeRoutine, // "Morning", "Night", "Morning, Night" — original label
    timeRoutine: resolveRoutineTime(
      row.timeRoutine,
      row.morningTime,
      row.eveningTime,
    ), // display time
    instructions: getInstructions(row.productType),
  }));
}
