import {
  mysqlTable,
  int,
  text,
  date,
  datetime,
  varchar,
  double,
  unique,
  boolean,
  foreignKey,
  time,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ======JOURNALS======
export const journals = mysqlTable("journals", {
  id: int().autoincrement().primaryKey().notNull(),
  journalText: text("journal_text").default("NULL"),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  journalDate: date("journal_date", { mode: "string" }).notNull(),
  mood: varchar("mood", { length: 10 }).default(null), // "happy" | "neutral" | "sad"
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======OTP======
export const otp = mysqlTable("otp", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  otpCode: varchar("otp_code", { length: 255 }).notNull(),
  isUsed: boolean("is_used").notNull(),
  expiresAt: datetime({ mode: "string", fsp: 3 }).notNull(),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======ROLE======
export const role = mysqlTable("role", {
  id: int().autoincrement().primaryKey().notNull(),
  roleName: varchar("role_name", { length: 255 }).notNull(),
});

// ======SKIN_ANALYSIS======
export const skinAnalysis = mysqlTable("skin_analysis", {
  id: int().autoincrement().primaryKey().notNull(),
  imageId: int("image_id").references(() => storedImages.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  status: varchar({ length: 255 }).notNull(),
  conditionId: int("condition_id").references(() => skinConditions.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  confidenceScores: double("confidence_scores"),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======SKIN_CARE_PRODUCTS======
export const skinCareProducts = mysqlTable("skin_care_products", {
  id: int().autoincrement().primaryKey().notNull(),
  productName: varchar("product_name", { length: 255 }).default("NULL"),
  productImage: varchar("product_image", { length: 255 }).default("NULL"),
  productBrand: varchar("product_brand", { length: 255 }).default("NULL"),
  highlightedIngredients: varchar("highlighted_ingredients", {
    length: 255,
  }).default("NULL"),
  ingredient: text("ingredient").default("NULL"),
  description: text("description").default("NULL"),
  productType: varchar("product_type", { length: 255 }).default("NULL"),
  locality: varchar({ length: 255 }).default("NULL"),
  availableIn: varchar("available_in", { length: 255 }).default("NULL"),
  skinType: varchar("skin_type", { length: 255 }).default("NULL"),
  dermaTested: boolean("derma_tested"),
  routine: varchar("routine", { length: 255 }).default(null),
  price: varchar("price", { length: 50 }).default(null),
  timeRoutine: varchar("time_routine", { length: 255 }).default("NULL"),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======SKIN_CONDITIONS======
export const skinConditions = mysqlTable("skin_conditions", {
  id: int().autoincrement().primaryKey().notNull(),
  condition: varchar({ length: 255 }).notNull(),
  canRecommend: varchar("can_recommend", { length: 255 }).notNull(),
  targetIngredients: text("target_ingredients").default(null),
});

// ======PRODUCT_RECOMMENDATIONS======
export const productRecommendations = mysqlTable(
  "product_recommendations",
  {
    id: int().autoincrement().primaryKey().notNull(),
    analysisId: int("analysis_id").notNull(),
    productId: int("product_id").notNull(),
    createdAt: datetime("created_at", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: "prt_analysis_fk",
      columns: [table.analysisId],
      foreignColumns: [skinAnalysis.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "prt_prod_fk",
      columns: [table.productId],
      foreignColumns: [skinCareProducts.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ],
);

// ======CONDITION_PRODUCTS (junction: skin_conditions <-> skin_care_products)======
export const conditionProducts = mysqlTable("condition_products", {
  id: int().autoincrement().primaryKey().notNull(),
  conditionId: int("condition_id")
    .notNull()
    .references(() => skinConditions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
      name: "cp_cond_fk",
    }),
  productId: int("product_id")
    .notNull()
    .references(() => skinCareProducts.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
      name: "cp_prod_fk",
    }),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======SKIN_PROFILE======
export const skinProfile = mysqlTable("skin_profile", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skinType: varchar("skin_type", { length: 50 }),
  skinSensitivity: varchar("skin_sensitivity", { length: 50 }),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`,
  ),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
},
(table) => [unique("skin_profile_user_unique").on(table.userId)],
);

// ======STORED_IMAGES======
export const storedImages = mysqlTable("stored_images", {
  id: int().autoincrement().primaryKey().notNull(),
  photoUrl: varchar({ length: 255 }).notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// ======USERS======
export const users = mysqlTable(
  "users",
  {
    id: int().autoincrement().primaryKey().notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    roleId: int("role_id")
      .notNull()
      .references(() => role.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    birthdate: date({ mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updated_at", { mode: "string", fsp: 3 }),
  },
  (table) => [unique("users_email_key").on(table.email)],
);

// ======USER_ROUTINE======
export const userRoutine = mysqlTable(
  "user_routine",
  {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    activeAnalysisId: int("active_analysis_id").references(
      () => skinAnalysis.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      },
    ),
    morningTime: time("morning_time").notNull().default("07:00:00"),
    eveningTime: time("evening_time").notNull().default("21:00:00"),
    createdAt: datetime("created_at", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updated_at", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => [unique("user_routine_user_unique").on(table.userId)],
);

// ======REMINDER_LOGS======
// one row per schedule per day — "Morning" or "Night"
// inserted when user completes all products for that schedule
// powers calendar ✓ / ✗ / 1/2 display
export const reminderLogs = mysqlTable(
  "reminder_logs",
  {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    analysisId: int("analysis_id").references(() => skinAnalysis.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    schedule: varchar("schedule", { length: 10 }).notNull(),
    completedDate: date("completed_date", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: "rl_user_fk",
      columns: [table.userId],
      foreignColumns: [users.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ],
);