import { db } from "../config/db.js";
import { journals } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

// Get all journals for a user
export async function getAllJournal(user_id) {
  return await db.query.journals.findMany({
    where: eq(journals.userId, user_id),
  });
}

// Get a single journal by date
export async function getSingleJournalByDate(user_id, date) {
  return await db.query.journals.findFirst({
    where: and(eq(journals.userId, user_id), eq(journals.journalDate, date)),
  });
}

// Create a new journal
export async function createJournal(
  user_id,
  journal_text,
  journal_date,
  mood = null,
) {
  const [inserted] = await db
    .insert(journals)
    .values({
      journalText: journal_text,
      userId: user_id,
      journalDate: journal_date,
      mood: mood ?? null,
    })
    .$returningId();

  return await db.query.journals.findFirst({
    where: eq(journals.id, inserted.id),
  });
}

// Update a journal
export async function updateJournal(
  user_id,
  journal_id,
  journal_text,
  mood = undefined,
) {
  const updates = { journalText: journal_text };
  if (mood !== undefined) updates.mood = mood ?? null;

  await db
    .update(journals)
    .set(updates)
    .where(and(eq(journals.id, journal_id), eq(journals.userId, user_id)));

  return await db.query.journals.findFirst({
    where: and(eq(journals.id, journal_id), eq(journals.userId, user_id)),
  });
}

// Delete a journal
export async function deleteJournal(user_id, journal_id) {
  const [result] = await db
    .delete(journals)
    .where(and(eq(journals.id, journal_id), eq(journals.userId, user_id)));
  return (result?.affectedRows ?? 0) > 0;
}
