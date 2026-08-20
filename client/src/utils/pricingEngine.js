import { calculateDistanceKm } from '../data/cities';

export const CARGO_CATEGORIES = [
  { id: 'general', name: 'General Merchandise / Boxes', factor: 1.0, icon: '📦' },
  { id: 'furniture', name: 'Household Furniture & Appliances', factor: 1.15, icon: '🛋️' },
  { id: 'electronics', name: 'Electronics & Fragile Equipment', factor: 1.25, icon: '💻' },
  { id: 'industrial', name: 'Auto Parts & Industrial Hardware', factor: 1.18, icon: '⚙️' },
  { id: 'textiles', name: 'Textiles & Garments', factor: 1.05, icon: '👕' },
  { id: 'agro', name: 'Agricultural Produce / Dry Goods', factor: 1.08, icon: '🌾' }
];

export const calculateFreightQuote = ({
  origin,
  destination,
  weightKg = 50,
  volumeM3 = 0.5,
  category = 'general',
  isExpress = false,
  customDistance = null
}) => {
  const distanceKm = customDistance || calculateDistanceKm(origin, destination);
  const selectedCategory = CARGO_CATEGORIES.find(c => c.id === category) || CARGO_CATEGORIES[0];
  
  // Rate Constants for Shared Empty-Truck Space (approx. 40-60% cheaper than dedicated full truck)
  const BASE_PRICE = 200; // Minimum booking base
  const RATE_PER_KM = 3.20; // ₹/km
  const RATE_PER_KG = 3.80; // ₹/kg
  const RATE_PER_M3 = 180;  // ₹/m³ volumetric component
  const HANDLING_BASE = 150; // Loading/unloading handling

  // Sub-calculations
  const distanceCost = distanceKm * RATE_PER_KM;
  const weightCost = weightKg * RATE_PER_KG;
  const volumeCost = volumeM3 * RATE_PER_M3;
  
  const rawSubtotal = (BASE_PRICE + distanceCost + weightCost + volumeCost) * selectedCategory.factor * (isExpress ? 1.25 : 1.0);
  const handlingFee = HANDLING_BASE + (weightKg > 200 ? Math.round((weightKg - 200) * 0.5) : 0);

  const subtotal = Math.round(rawSubtotal + handlingFee);
  const platformFee = Math.round(subtotal * 0.08); // 8% Platform escrow fee
  const gst = Math.round((subtotal + platformFee) * 0.05); // 5% GST on transport
  const totalFare = subtotal + platformFee + gst;
  const driverEarnings = subtotal + gst; // Driver gets net fare

  // Dedicated single truck baseline comparison (what user would pay if booking a whole mini-truck)
  const dedicatedFullTruckCost = Math.round(distanceKm * 18.5 + 1500 + weightKg * 1.5);
  const userSavingsPercent = Math.min(75, Math.max(25, Math.round(((dedicatedFullTruckCost - totalFare) / dedicatedFullTruckCost) * 100)));

  // Environmental impact: Estimated CO2 saved by sharing an existing trip
  // (Average diesel truck emissions ~0.15 kg CO2 per ton-km)
  const carbonSavedKg = Number(((distanceKm * (weightKg / 1000) * 0.18)).toFixed(1));

  return {
    distanceKm,
    baseFare: BASE_PRICE,
    distanceCost: Math.round(distanceCost),
    weightCost: Math.round(weightCost),
    volumeCost: Math.round(volumeCost),
    handlingFee,
    subtotal,
    platformFee,
    gst,
    totalFare,
    driverEarnings,
    dedicatedFullTruckCost,
    userSavingsPercent,
    carbonSavedKg,
    categoryName: selectedCategory.name
  };
};
