const MEDICAL_ONLY_CONDITIONS = new Set([
  "acne-cyst",
  "acne-nodules",
  "psoriasis",
  "out-of-scope",
]);

const CONDITION_DISPLAY_NAMES = {
  "acne-blackheads": "Acne (Blackheads)",
  "acne-whiteheads": "Acne (Whiteheads)",
  "acne-papules": "Acne (Papules)",
  "acne-pustules": "Acne (Pustules)",
  "acne-cyst": "Cystic Acne",
  "acne-nodules": "Nodular Acne",
  "acne-fungal": "Fungal Acne",
  eczema: "Eczema",
  melasma: "Melasma",
  milia: "Milia",
  "enlarged-pores": "Enlarged Pores",
  "post-inflammatory-pigmentation":
    "Post-Inflammatory Pigmentation (Dark Spots)",
  "post-inflammatory-erythema": "Post-Inflammatory Erythema (Redness)",
  psoriasis: "Psoriasis",
  "out-of-scope": null,
};

const SEVERITY_DISPLAY = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

function formatLabel(rawLabel) {
  if (!rawLabel) {
    return "your skin condition";
  }

  const severities = ["mild", "moderate", "severe"];
  const words = rawLabel.split("-");

  let severityFound = null;
  const baseWords = [];

  for (let i = 0; i < words.length; i++) {
    if (severities.includes(words[i])) {
      severityFound = words[i];
    } else {
      baseWords.push(words[i]);
    }
  }

  const baseKey = baseWords.join("-");
  const displayName = CONDITION_DISPLAY_NAMES[baseKey];

  if (displayName === null) {
    return "your skin condition";
  }

  if (!displayName) {
    // fallback for anything not in the map
    const fallback = baseWords
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    if (severityFound) {
      return fallback + " — " + SEVERITY_DISPLAY[severityFound];
    }

    return fallback;
  }

  if (severityFound) {
    return displayName + " — " + SEVERITY_DISPLAY[severityFound];
  }

  return displayName;
}

export function buildAnalysisDescription(analysisData, candidates) {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const top3 = [];
  let hadSkip = false;

  for (let i = 0; i < candidates.length; i++) {
    if (top3.length === 3) {
      break;
    }

    if (MEDICAL_ONLY_CONDITIONS.has(candidates[i].label)) {
      hadSkip = true;
      continue;
    }

    top3.push(candidates[i]);
  }

const primaryLabel = analysisData.condition_name ?? top3[0]?.label;
const primary = formatLabel(primaryLabel);
const primaryScore = (top3[0]?.score * 100).toFixed(1);

let secondary = "";

if (top3[1] || top3[2]) {
  const others = [];

  if (top3[1]) {
    // strip severity for secondary — pass a label without the severity word
    const secondaryLabel = top3[1].label;
    const words = secondaryLabel
      .split("-")
      .filter((w) => !["mild", "moderate", "severe"].includes(w));
    const baseKey = words.join("-");
    const secondaryName =
      CONDITION_DISPLAY_NAMES[baseKey] ??
      words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    others.push(secondaryName + " (" + (top3[1].score * 100).toFixed(1) + "%)");
  }

  if (top3[2]) {
    const secondaryLabel = top3[2].label;
    const words = secondaryLabel
      .split("-")
      .filter((w) => !["mild", "moderate", "severe"].includes(w));
    const baseKey = words.join("-");
    const secondaryName =
      CONDITION_DISPLAY_NAMES[baseKey] ??
      words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    others.push(secondaryName + " (" + (top3[2].score * 100).toFixed(1) + "%)");
  }

  secondary = " Other conditions detected: " + others.join(" and ") + ".";
}
  let disclaimer = "";

  if (hadSkip) {
    disclaimer =
      " Some secondary indicators may need professional evaluation — consider consulting a dermatologist for a more accurate diagnosis.";
  }

  return (
    "Your skin shows signs of " +
    primary +
    " (" +
    primaryScore +
    "%)." +
    secondary +
    disclaimer
  );
}

export function buildRecommendDescription(conditionData, recommendationResult) {
  let condition = "your condition";
  let ingredients = null;
  let count = 0;

  if (conditionData && conditionData.condition) {
    condition = formatLabel(conditionData.condition);
  }

  if (conditionData && conditionData.targetIngredients) {
    ingredients = conditionData.targetIngredients;
  }

  if (recommendationResult && recommendationResult.length > 0) {
    count = recommendationResult.length;
  }

  let ingredientText = "general skincare ingredients";

  if (ingredients) {
    ingredientText = ingredients;
  }

  let result =
    "For " +
    condition +
    ", look for products containing " +
    ingredientText +
    ".";

  if (count > 0) {
    result =
      result + " We found " + count + " product(s) that may suit your skin.";
  } else {
    result = result + " We currently have no matching products in our catalog.";
  }

  return result;
}