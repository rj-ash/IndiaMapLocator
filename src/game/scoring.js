// Hybrid scoring function
// distanceTiersKm: [tier1, tier2, tier3]
export function scoreHybrid(distanceKm, districtCorrect, distanceTiersKm = [5,15,30]) {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) return { points: 0, breakdown: { base:0, distanceBonus:0, perfectBonus:0 } };
  const [t1, t2, t3] = distanceTiersKm;
  const base = districtCorrect ? 5 : 0;
  let distanceBonus = 0;
  if (distanceKm < t1) distanceBonus = 5; else if (distanceKm < t2) distanceBonus = 3; else if (distanceKm < t3) distanceBonus = 1;
  const perfectBonus = (districtCorrect && distanceKm < 2) ? 1 : 0;
  return { points: base + distanceBonus + perfectBonus, breakdown: { base, distanceBonus, perfectBonus } };
}

// Threshold scoring: if within thresholdKm -> award full points, else zero.
export function scoreThreshold(distanceKm, thresholdKm = 50, pointsIfCorrect = 10) {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) return { points: 0, breakdown: { within:false, thresholdKm } };
  const within = distanceKm <= thresholdKm;
  return { points: within ? pointsIfCorrect : 0, breakdown: { within, thresholdKm } };
}
