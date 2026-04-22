import {
  skinCareProducts,
  skinProfile,
  conditionProducts,
  skinConditions,
} from "../drizzle/schema.js";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm";

//initializing skin profile for recommendation
export async function getSkinData(user_id) {
  const [result] = await db
    .select({
      skinType: skinProfile.skinType,
      skinSensitivity: skinProfile.skinSensitivity,
    })
    .from(skinProfile)
    .where(eq(skinProfile.userId, user_id))
    .limit(1);

  return result;
}

//centralized recommendation products
export async function unionProductFilter(condition_id) {
  const [subProcessOne, subProcessTwo, subProcessThree] = await Promise.all([
    matchProductByCondition(condition_id),
    matchProductByTargetIngredient(condition_id),
    matchProductByHighlightIngredient(condition_id),
  ]);

  //compiles from 3 processes
  const combined = [...subProcessOne, ...subProcessTwo, ...subProcessThree];
  const isExist = {};
  const result = [];
  for (const product of combined) {
    if (!isExist[product.id]) {
      isExist[product.id] = true;
      result.push(product);
    }
  }

  return result;
}

export function filterBySkinType(products, userSkinProfile) {
  const { skinType, skinSensitivity } = userSkinProfile;

  return products.filter((product) => {
    const productSkinType = product.skinType?.toLowerCase() ?? "";

    if (skinType && !productSkinType.includes(skinType.toLowerCase()))
      return false;

    if (
      skinSensitivity === "sensitive" &&
      !productSkinType.includes("sensitive")
    )
      return false;

    return true;
  });
}

export function scoreProducts(products, userLocality = "Philippines") {
  const scored = products.map((product) => {
    let score = 0;
    if (product.dermaTested === true) score += 50;
    if (product.locality?.toLowerCase() === userLocality.toLowerCase())
      score += 30;
    return { ...product, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}

//=============================HELPERS========================================

async function matchProductByHighlightIngredient(condition_id) {
  const [condition] = await db
    .select({ targetIngredients: skinConditions.targetIngredients })
    .from(skinConditions)
    .where(eq(skinConditions.id, condition_id))
    .limit(1);

  if (!condition?.targetIngredients) return [];

  const raw = condition.targetIngredients.split(",");
  const targets = [];
  for (const item of raw) {
    targets.push(item.trim().toLowerCase());
  }
  const allProducts = await db
    .select({
      id: skinCareProducts.id,
      productName: skinCareProducts.productName,
      productImage: skinCareProducts.productImage,
      productBrand: skinCareProducts.productBrand,
      highlightedIngredients: skinCareProducts.highlightedIngredients,
      ingredient: skinCareProducts.ingredient,
      description: skinCareProducts.description,
      productType: skinCareProducts.productType,
      locality: skinCareProducts.locality,
      availableIn: skinCareProducts.availableIn,
      skinType: skinCareProducts.skinType,
      dermaTested: skinCareProducts.dermaTested,
      timeRoutine: skinCareProducts.timeRoutine,
      routine: skinCareProducts.routine,
      price: skinCareProducts.price,
    })
    .from(skinCareProducts);

  const result = [];
  for (const product of allProducts) {
    if (!product.highlightedIngredients) condition;
    const ingredients = product.highlightedIngredients.toLowerCase();
    for (const target of targets) {
      if (ingredients.includes(target)) {
        result.push(product);
        break;
      }
    }
  }

  return result;
}

async function matchProductByTargetIngredient(condition_id) {
  const [condition] = await db
    .select({ targetIngredients: skinConditions.targetIngredients })
    .from(skinConditions)
    .where(eq(skinConditions.id, condition_id))
    .limit(1);

  if (!condition?.targetIngredients) return [];

  const raw = condition.targetIngredients.split(",");
  const targets = [];
  for (const item of raw) {
    targets.push(item.trim().toLowerCase());
  }
  const allProducts = await db
    .select({
      id: skinCareProducts.id,
      productName: skinCareProducts.productName,
      productImage: skinCareProducts.productImage,
      productBrand: skinCareProducts.productBrand,
      highlightedIngredients: skinCareProducts.highlightedIngredients,
      ingredient: skinCareProducts.ingredient,
      description: skinCareProducts.description,
      productType: skinCareProducts.productType,
      locality: skinCareProducts.locality,
      availableIn: skinCareProducts.availableIn,
      skinType: skinCareProducts.skinType,
      dermaTested: skinCareProducts.dermaTested,
      timeRoutine: skinCareProducts.timeRoutine,
      routine: skinCareProducts.routine,
      price: skinCareProducts.price,
    })
    .from(skinCareProducts);

  const result = [];
  for (const product of allProducts) {
    if (!product.ingredient) condition;
    const ingredients = product.ingredient.toLowerCase();
    for (const target of targets) {
      if (ingredients.includes(target)) {
        result.push(product);
        break;
      }
    }
  }

  return result;
}
async function matchProductByCondition(condition_id) {
  const results = await db
    .select({
      id: skinCareProducts.id,
      productName: skinCareProducts.productName,
      productImage: skinCareProducts.productImage,
      productBrand: skinCareProducts.productBrand,
      highlightedIngredients: skinCareProducts.highlightedIngredients,
      ingredient: skinCareProducts.ingredient,
      description: skinCareProducts.description,
      productType: skinCareProducts.productType,
      locality: skinCareProducts.locality,
      availableIn: skinCareProducts.availableIn,
      skinType: skinCareProducts.skinType,
      dermaTested: skinCareProducts.dermaTested,
      timeRoutine: skinCareProducts.timeRoutine,
      routine: skinCareProducts.routine,
      price: skinCareProducts.price,
    })
    .from(conditionProducts)
    .innerJoin(
      skinCareProducts,
      eq(conditionProducts.productId, skinCareProducts.id),
    )
    .where(eq(conditionProducts.conditionId, condition_id));

  return results;
}