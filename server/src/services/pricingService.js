
const { getCityDistance } = require('./routingService');

/**
 * Dynamic Fair Freight Price Calculator
 * Formula:
 * Total Price = Base Fee + (Distance * Base Rate/Km) + (Weight Charge) + (Volume Charge) + (Cargo Risk Surcharge)
 */
function calculateFreightQuote({
  origin,
  destination,
  distanceKm,
  weightKg = 50,
  volumeCbm = 0.5,
  cargoType = 'Standard',
  isUrgent = false,
  vehicleType = 'Medium LCV'
}) {
  const effectiveDistance = distanceKm || getCityDistance(origin, destination) || 200;
  
  // 1. Base platform & dispatch fee (₹)
  const baseBookingFee = 250;

  // 2. Base distance rate (₹ per km)
  let perKmRate = 12.0;
  if (vehicleType.includes('Heavy')) perKmRate = 14.5;
  if (vehicleType.includes('Mini')) perKmRate = 9.5;

  const distanceCost = effectiveDistance * perKmRate * 0.25; // 25% of truck base km cost proportional to shared space

  // 3. Weight surcharge (₹ per kg per 100km slab)
  const weightRatePer100Km = 1.8; // ₹1.8 per kg per 100km
  const weightCost = (weightKg * (effectiveDistance / 100) * weightRatePer100Km);

  // 4. Volume surcharge (CBM to Cu.Ft multiplier: 1 CBM = 35.314 Cu.Ft)
  const volumeCost = volumeCbm * 180;

  // 5. Cargo category multiplier
  let cargoMultiplier = 1.0;
  if (cargoType === 'Fragile/Glassware') cargoMultiplier = 1.20;
  else if (cargoType === 'Perishable/Food') cargoMultiplier = 1.15;
  else if (cargoType === 'Hazardous/Chemical') cargoMultiplier = 1.35;
  else if (cargoType === 'Heavy/Machine') cargoMultiplier = 1.10;

  // 6. Urgency surcharge
  const urgencyFee = isUrgent ? 350 : 0;

  // Total shared price
  const subtotal = (baseBookingFee + distanceCost + weightCost + volumeCost + urgencyFee) * cargoMultiplier;
  const finalPrice = Math.round(subtotal);

  // Compare with standard full truck charter cost (Dedicated Truck)
  const dedicatedTruckCost = Math.round(baseBookingFee * 2 + (effectiveDistance * perKmRate) + 1200);
  const savingsVsDedicatedTruck = Math.max(0, dedicatedTruckCost - finalPrice);
  const savingsPercentage = Math.round((savingsVsDedicatedTruck / dedicatedTruckCost) * 100);

  // Driver profit earned on this partial space
  const driverEarning = Math.round(finalPrice * 0.88); // 88% to driver, 12% platform fee

  // Environmental impact (CO2 emissions saved by combining loads, ~0.15kg CO2 per ton-km)
  const co2SavedKg = Math.round((weightKg / 1000) * effectiveDistance * 0.15 * 10) / 10;

  return {
    origin,
    destination,
    distanceKm: effectiveDistance,
    weightKg,
    volumeCbm,
    cargoType,
    calculatedPrice: finalPrice,
    dedicatedTruckCost,
    savingsVsDedicatedTruck,
    savingsPercentage,
    driverEarning,
    co2SavedKg,
    breakdown: {
      baseFee: baseBookingFee,
      distanceShare: Math.round(distanceCost),
      weightCharge: Math.round(weightCost),
      volumeCharge: Math.round(volumeCost),
      urgencyFee,
      cargoMultiplier
    }
  };
}

module.exports = {
  calculateFreightQuote
};
