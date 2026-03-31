export const routineInstructions = {
  Cleanser: "Wet your face with lukewarm water. Apply a small amount and massage gently in circular motions for 30-60 seconds. Rinse thoroughly and pat dry.",
  Toner: "After cleansing, apply a small amount to a cotton pad or your palms. Gently press or swipe across your face and neck. Allow to absorb fully before next step.",
  Moisturizer: "Take a pea-sized amount and dot across forehead, cheeks, nose, and chin. Gently massage in upward circular motions until fully absorbed.",
  Sunscreen: "Apply generously as the last step of your morning routine. Dot across face and blend evenly. Reapply every 2 hours if outdoors.",
  Serum: "Apply 2-3 drops after toner on clean skin. Gently press into skin using fingertips. Allow to fully absorb before moisturizer.",
  "Eye Cream": "Using your ring finger, gently tap a small amount around the orbital bone. Never pull or drag the delicate eye area.",
  Exfoliator: "Apply to damp skin 2-3 times per week. Massage gently in circular motions for 30 seconds. Rinse thoroughly. Avoid if skin is irritated.",
  Mask: "Apply an even layer to clean dry skin. Leave on for the recommended time. Rinse off thoroughly with lukewarm water.",
};

export function getInstructions(productType) {
  return routineInstructions[productType] ?? "Apply as directed on the product label.";
}