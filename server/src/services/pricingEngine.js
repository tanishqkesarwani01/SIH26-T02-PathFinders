/**
 * Pricing Engine for Shared Logistics Platform
 * Formula: Base fee + (₹/km * distance) + (₹/kg * weight) * categoryMultiplier
 */

const BASE_FEE = 50;
const RATE_PER_KM = 2.0;
const RATE_PER_KG = 1.0;

const PACKAGE_MULTIPLIERS = {
  'Standard / General': 1.0,
  'General Freight': 1.0,
  'Clothing & Textiles': 1.0,
  'Electronics': 1.15,
  'Fragile & Glassware': 1.25,
  'Perishable / FMCG': 1.20,
  'Industrial & Machinery': 1.10,
  'Hazardous / Special': 1.35
};

function calculateFare(distanceKm, weightKg, packageType = 'Standard / General') {
  const dist = Math.max(1, Number(distanceKm) || 10);
  const weight = Math.max(1, Number(weightKg) || 10);
  
  const multiplier = PACKAGE_MULTIPLIERS[packageType] || 1.0;

  const distanceFee = Math.round(dist * RATE_PER_KM);
  const weightFee = Math.round(weight * RATE_PER_KG);
  const subtotal = BASE_FEE + distanceFee + weightFee;
  const categorySurcharge = Math.round(subtotal * (multiplier - 1.0));
  const totalFare = subtotal + categorySurcharge;
  const standardDedicatedTruckCost = Math.round(totalFare * 2.8); // Equivalent solo mini-truck hire
  const estimatedSavings = standardDedicatedTruckCost - totalFare;

  return {
    baseFee: BASE_FEE,
    distanceKm: dist,
    ratePerKm: RATE_PER_KM,
    distanceFee,
    weightKg: weight,
    ratePerKg: RATE_PER_KG,
    weightFee,
    packageType,
    multiplier,
    categorySurcharge,
    totalFare,
    dedicatedTruckComparison: standardDedicatedTruckCost,
    estimatedSavings,
    savingsPercentage: Math.round((estimatedSavings / standardDedicatedTruckCost) * 100)
  };
}

module.exports = {
  BASE_FEE,
  RATE_PER_KM,
  RATE_PER_KG,
  PACKAGE_MULTIPLIERS,
  calculateFare
};
