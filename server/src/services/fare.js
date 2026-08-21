/**
 * Dynamic fare calculator
 * Base: ?50 + ?2/km * distance + ?1/kg * weight
 */
function calculateFare(distanceKm, weightKg) {
  const BASE_FEE = 50;
  const PER_KM_RATE = 2;
  const PER_KG_RATE = 1;

  const baseFee = BASE_FEE;
  const distanceFee = PER_KM_RATE * distanceKm;
  const weightFee = PER_KG_RATE * weightKg;
  const total = baseFee + distanceFee + weightFee;

  return {
    baseFee,
    distanceFee: Math.round(distanceFee),
    weightFee: Math.round(weightFee),
    totalFare: Math.round(total),
    breakdown: `?${BASE_FEE} base + ?${PER_KM_RATE}/km × ${Math.round(distanceKm)} km + ?${PER_KG_RATE}/kg × ${weightKg} kg`,
  };
}

module.exports = { calculateFare };
