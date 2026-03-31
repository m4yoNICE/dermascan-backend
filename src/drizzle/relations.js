import { relations } from "drizzle-orm/relations";
import {
  users,
  journals,
  otp,
  skinConditions,
  skinAnalysis,
  storedImages,
  role,
  skinProfile,
  productRecommendations,
  skinCareProducts,
  conditionProducts,
  reminderLogs,
  userRoutine,
} from "./schema.js";

export const journalsRelations = relations(journals, ({ one }) => ({
  user: one(users, {
    fields: [journals.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  journals: many(journals),
  otps: many(otp),
  skinAnalysis: many(skinAnalysis),
  skinProfile: many(skinProfile),
  storedImages: many(storedImages),
  reminderLogs: many(reminderLogs),
  userRoutine: one(userRoutine, {
    fields: [users.id],
    references: [userRoutine.userId],
  }),
  role: one(role, {
    fields: [users.roleId],
    references: [role.id],
  }),
}));

export const otpRelations = relations(otp, ({ one }) => ({
  user: one(users, {
    fields: [otp.userId],
    references: [users.id],
  }),
}));

export const skinAnalysisRelations = relations(
  skinAnalysis,
  ({ one, many }) => ({
    skinCondition: one(skinConditions, {
      fields: [skinAnalysis.conditionId],
      references: [skinConditions.id],
    }),
    storedImage: one(storedImages, {
      fields: [skinAnalysis.imageId],
      references: [storedImages.id],
    }),
    user: one(users, {
      fields: [skinAnalysis.userId],
      references: [users.id],
    }),
    recommendations: many(productRecommendations),
  }),
);

export const skinConditionsRelations = relations(
  skinConditions,
  ({ many }) => ({
    skinAnalysis: many(skinAnalysis),
    conditionProducts: many(conditionProducts),
  }),
);

export const storedImagesRelations = relations(
  storedImages,
  ({ one, many }) => ({
    skinAnalysis: many(skinAnalysis),
    user: one(users, {
      fields: [storedImages.userId],
      references: [users.id],
    }),
  }),
);

export const skinProfileRelations = relations(skinProfile, ({ one }) => ({
  user: one(users, {
    fields: [skinProfile.userId],
    references: [users.id],
  }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  users: many(users),
}));

export const skinCareProductsRelations = relations(
  skinCareProducts,
  ({ many }) => ({
    recommendations: many(productRecommendations),
    conditionProducts: many(conditionProducts),
  }),
);

export const conditionProductsRelations = relations(
  conditionProducts,
  ({ one }) => ({
    condition: one(skinConditions, {
      fields: [conditionProducts.conditionId],
      references: [skinConditions.id],
    }),
    product: one(skinCareProducts, {
      fields: [conditionProducts.productId],
      references: [skinCareProducts.id],
    }),
  }),
);

export const productRecommendationsRelations = relations(
  productRecommendations,
  ({ one }) => ({
    analysis: one(skinAnalysis, {
      fields: [productRecommendations.analysisId],
      references: [skinAnalysis.id],
    }),
    product: one(skinCareProducts, {
      fields: [productRecommendations.productId],
      references: [skinCareProducts.id],
    }),
  }),
);

export const reminderLogsRelations = relations(reminderLogs, ({ one }) => ({
  user: one(users, {
    fields: [reminderLogs.userId],
    references: [users.id],
  }),
  analysis: one(skinAnalysis, {
    fields: [reminderLogs.analysisId],
    references: [skinAnalysis.id],
  }),
}));

export const userRoutineRelations = relations(userRoutine, ({ one }) => ({
  user: one(users, {
    fields: [userRoutine.userId],
    references: [users.id],
  }),
  activeAnalysis: one(skinAnalysis, {
    fields: [userRoutine.activeAnalysisId],
    references: [skinAnalysis.id],
  }),
}));
