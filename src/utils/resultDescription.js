// const MEDICAL_ONLY_CONDITIONS = new Set([
//   "acne-cyst",
//   "acne-nodules",
//   "psoriasis",
//   "out-of-scope",
// ]);

// function formatLabel(rawLabel) {
//   if (!rawLabel) return "your skin condition";
//   const severities = ["mild", "moderate", "severe"];
//   return rawLabel
//     .split("-")
//     .filter((p) => !severities.includes(p))
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");
// }

const MEDICAL_ONLY_CONDITIONS = new Set([
  "acne-nodularcystic", // replaces acne-cyst and acne-nodules
  "psoriasis",
  "out-of-scope",
]);

const LABEL_DISPLAY_OVERRIDE = {
  "acne-inflammatory": "Acne Inflammatory (Papules & Pustules)",
  "acne-nodularcystic": "Severe Nodular/Cystic Acne",
};

function formatLabel(rawLabel) {
  if (!rawLabel) return "your skin condition";
  const severities = ["mild", "moderate", "severe"];
  const base = rawLabel
    .split("-")
    .filter((p) => !severities.includes(p))
    .join("-");

  return (
    LABEL_DISPLAY_OVERRIDE[base] ??
    base
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export function buildAnalysisDescription(analysisData, candidates) {
  if (!candidates || candidates.length === 0) return null;

  const top3 = [];
  let hadSkip = false;

  for (const item of candidates) {
    if (top3.length === 3) break;
    if (MEDICAL_ONLY_CONDITIONS.has(item.label)) {
      hadSkip = true;
      continue;
    }
    top3.push(item);
  }

  const primary = formatLabel(top3[0]?.label ?? analysisData.condition_name);
  const primaryScore = (top3[0]?.score * 100).toFixed(1);

  let secondary = "";
  if (top3[1] || top3[2]) {
    const others = [top3[1], top3[2]]
      .filter(Boolean)
      .map(
        (item) =>
          `${formatLabel(item.label)} (${(item.score * 100).toFixed(1)}%)`,
      )
      .join(" and ");
    secondary = ` Other conditions detected: ${others}.`;
  }

  const disclaimer = hadSkip
    ? " Some secondary indicators may need professional evaluation — consider consulting a dermatologist for a more accurate diagnosis."
    : "";

  return `Your skin shows signs of ${primary} (${primaryScore}%).${secondary}${disclaimer}`;
}

export function buildRecommendDescription(conditionData, recommendationResult) {
  const condition = conditionData?.condition ?? "your condition";
  const ingredients = conditionData?.targetIngredients ?? null;
  const count = recommendationResult?.length ?? 0;

  const parts = [];
  parts.push(
    `For ${condition}, look for products containing ${ingredients ?? "general skincare ingredients"}.`,
  );

  if (count > 0) {
    parts.push(`We found ${count} product(s) that may suit your skin.`);
  } else {
    parts.push("We currently have no matching products in our catalog.");
  }

  return parts.join(" ");
}
