const { haversineDistance, detourDistance, routeOverlapScore } = require("./geo");
const { calculateFare } = require("./fare");

/**
 * Scoring weights
 */
const W = {
  routeOverlap: 35,
  utilizationGain: 25,
  revenue: 20,
  detourPenalty: -10,
  delayPenalty: -10,
};

const MAX_DETOUR_KM = 30;

/**
 * Score a single (trip, shipment) pair
 */
function scoreMatch(trip, shipment, srcAddr, dstAddr, pickAddr, dropAddr) {
  const overlap = routeOverlapScore(
    srcAddr.lat, srcAddr.lng,
    dstAddr.lat, dstAddr.lng,
    pickAddr.lat, pickAddr.lng,
    dropAddr.lat, dropAddr.lng
  );

  const utilization = Math.min(1, shipment.weight_kg / trip.total_capacity_kg);

  const fare = calculateFare(
    haversineDistance(pickAddr.lat, pickAddr.lng, dropAddr.lat, dropAddr.lng),
    shipment.weight_kg
  );
  const maxFare = calculateFare(
    haversineDistance(srcAddr.lat, srcAddr.lng, dstAddr.lat, dstAddr.lng),
    trip.total_capacity_kg
  );
  const normalizedRevenue = Math.min(1, fare.totalFare / (maxFare.totalFare || 1));

  const extraKm = detourDistance(
    srcAddr.lat, srcAddr.lng,
    dstAddr.lat, dstAddr.lng,
    pickAddr.lat, pickAddr.lng,
    dropAddr.lat, dropAddr.lng
  );
  const tripDist = haversineDistance(srcAddr.lat, srcAddr.lng, dstAddr.lat, dstAddr.lng);
  const detourPenalty = Math.min(1, extraKm / Math.max(tripDist, 1));
  const delayPenalty = detourPenalty * 0.8;

  const score =
    W.routeOverlap * overlap +
    W.utilizationGain * utilization +
    W.revenue * normalizedRevenue +
    W.detourPenalty * detourPenalty +
    W.delayPenalty * delayPenalty;

  return {
    score: Math.max(0, Math.round(score * 10) / 10),
    overlap: Math.round(overlap * 100),
    utilization: Math.round(utilization * 100),
    revenueEst: fare.totalFare,
    extraKm: Math.round(extraKm),
    fareBreakdown: fare.breakdown,
  };
}

/**
 * Find and rank matching shipments for a given trip
 */
function findMatchingShipments(trip, allShipments, addresses) {
  const addrMap = {};
  for (const a of addresses) addrMap[a.id] = a;

  const srcAddr = addrMap[trip.source_address_id];
  const dstAddr = addrMap[trip.dest_address_id];
  if (!srcAddr || !dstAddr) return [];

  const results = [];

  for (const shipment of allShipments) {
    if (shipment.status !== "pending") continue;
    if (shipment.weight_kg > trip.available_capacity_kg) continue;

    const pickAddr = addrMap[shipment.pickup_address_id];
    const dropAddr = addrMap[shipment.drop_address_id];
    if (!pickAddr || !dropAddr) continue;

    const extra = detourDistance(
      srcAddr.lat, srcAddr.lng,
      dstAddr.lat, dstAddr.lng,
      pickAddr.lat, pickAddr.lng,
      dropAddr.lat, dropAddr.lng
    );
    if (extra > MAX_DETOUR_KM) continue;

    const scored = scoreMatch(trip, shipment, srcAddr, dstAddr, pickAddr, dropAddr);

    results.push({
      shipment,
      ...scored,
      pickupCity: pickAddr.city,
      dropCity: dropAddr.city,
    });
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Greedy knapsack bundler: pick top-scoring shipments up to capacity
 */
function bundleShipments(matchedShipments, availableCapacityKg) {
  let remaining = availableCapacityKg;
  const bundle = [];
  let totalRevenue = 0;
  let totalWeight = 0;

  for (const m of matchedShipments) {
    if (m.shipment.weight_kg <= remaining) {
      bundle.push(m);
      remaining -= m.shipment.weight_kg;
      totalRevenue += m.revenueEst;
      totalWeight += m.shipment.weight_kg;
    }
  }

  return {
    bundle,
    totalWeight,
    totalRevenue,
    utilizationPercent: Math.round((totalWeight / availableCapacityKg) * 100),
  };
}

module.exports = { findMatchingShipments, bundleShipments, scoreMatch };
