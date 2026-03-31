import {
  filterBySkinType,
  getSkinData,
  unionProductFilter,
  scoreProducts,
} from "../services/productRecommendationServices.js";

export async function recommendOrchestrator(analysis_id, user_id, condition_id) {
  try {
    const skinData = await getSkinData(user_id);
    console.log("Phase 1 - skinData:", skinData);
    if (!skinData) return null;

    const matchedProducts = await unionProductFilter(condition_id);
    console.log("Phase 2 - matchedProducts:", matchedProducts.length);
    if (!matchedProducts.length) return null;

    const filteredProducts = filterBySkinType(matchedProducts, skinData);
    console.log("Phase 3 - filteredProducts:", filteredProducts.length);
    if (!filteredProducts.length) return null;

    const scoredProducts = scoreProducts(filteredProducts);
    console.log("Phase 4 - scoredProducts:", scoredProducts.length);

    return scoredProducts;
  } catch (error) {
    console.error("FATAL ERROR in recommendOrchestrator:", error);
    return null;
  }
}