import { db } from "../../config/db.js";
import { skinCareProducts, conditionProducts } from "../../drizzle/schema.js";
import { eq, sql} from "drizzle-orm";

export const getAllProducts = async () => {
  const rows = await db
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
      createdAt: skinCareProducts.createdAt,
      updatedAt: skinCareProducts.updatedAt,
      conditionId: conditionProducts.conditionId,
    })
    .from(skinCareProducts)
    .leftJoin(conditionProducts, eq(skinCareProducts.id, conditionProducts.productId));

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.id]) {
      grouped[row.id] = {
        id: row.id,
        productName: row.productName,
        productImage: row.productImage,
        productBrand: row.productBrand,
        highlightedIngredients: row.highlightedIngredients,
        ingredient: row.ingredient,
        description: row.description,
        productType: row.productType,
        locality: row.locality,
        availableIn: row.availableIn,
        skinType: row.skinType,
        dermaTested: row.dermaTested,
        timeRoutine: row.timeRoutine,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        conditionIds: [],
      };
    }
    if (row.conditionId) {
      grouped[row.id].conditionIds.push(row.conditionId);
    }
  }

  return Object.values(grouped);
};

export const getProductById = async (id) => {
  const result = await db
    .select()
    .from(skinCareProducts)
    .where(eq(skinCareProducts.id, id));
  return result[0] || null;
};

export const createProduct = async (data) => {
  const { conditionIds, ...productData } = data;

  const result = await db.insert(skinCareProducts).values(productData);
  const insertId = result[0].insertId;

  const parsedConditionIds = JSON.parse(conditionIds || "[]");
  if (parsedConditionIds.length > 0) {
    const conditionValues = [];
    for (const conditionId of parsedConditionIds) {
      conditionValues.push({
        conditionId: Number(conditionId),
        productId: insertId,
      });
    }
    await db.insert(conditionProducts).values(conditionValues);
  }

  const [product] = await db
    .select()
    .from(skinCareProducts)
    .where(eq(skinCareProducts.id, insertId));
  return product;
};

export const updateProduct = async (id, data) => {
  const { conditionIds, ...productData } = data;

  await db
    .update(skinCareProducts)
    .set(productData)
    .where(eq(skinCareProducts.id, id));

  await db.delete(conditionProducts).where(eq(conditionProducts.productId, id));

  const parsedConditionIds = JSON.parse(conditionIds || "[]");
  if (parsedConditionIds.length > 0) {
    const conditionValues = [];
    for (const conditionId of parsedConditionIds) {
      conditionValues.push({
        conditionId: Number(conditionId),
        productId: id,
      });
    }
    await db.insert(conditionProducts).values(conditionValues);
  }

  const [product] = await db
    .select()
    .from(skinCareProducts)
    .where(eq(skinCareProducts.id, id));
  return product;
};

export const deleteProduct = async (id) => {
  const result = await db
    .delete(skinCareProducts)
    .where(eq(skinCareProducts.id, id));

  return result;
};

export const conditionCounts = async () => {
  const result = await db
    .select({
      conditionId: conditionProducts.conditionId,
      count: sql`COUNT(${conditionProducts.productId})`,  
    })
    .from(conditionProducts)
    .groupBy(conditionProducts.conditionId);
    
  return result;
}

export const fetchConditionProducts = async () => {
  const result = await db
  .select({
    conditionId: conditionProducts.conditionId,
    productId: conditionProducts.productId,
    productName: skinCareProducts.productName,
  })
  .from(conditionProducts)
  .leftJoin(
    skinCareProducts,
    eq(conditionProducts.productId, skinCareProducts.id)
  );

return result;
}

export const getAllProductImages = async () => {
  const result = await db
  .select({
    productId: skinCareProducts.id,
    name: skinCareProducts.productName,
    image: skinCareProducts.productImage,
    conditionId: conditionProducts.conditionId,
  })
  .from(conditionProducts)
  .innerJoin(skinCareProducts, eq(skinCareProducts.id, conditionProducts.productId));

  return result;
}