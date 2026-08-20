/**
 * Matching & Route Optimization Engine
 * Implements Constraint Filtering, Dynamic Corridor Scoring, and Greedy Cargo Bundling
 */

const { calculateFare } = require('./pricingEngine');

// City Coordinates for Geocoding & Distance Calculation in North India / Uttar Pradesh corridor
const CITY_COORDINATES = {
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi' },
  'sultanpur': { lat: 26.2648, lng: 82.0727, name: 'Sultanpur' },
  'jaunpur': { lat: 25.7464, lng: 82.6837, name: 'Jaunpur' },
  'raebareli': { lat: 26.2236, lng: 81.2409, name: 'Raebareli' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  'allahabad': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  'ayodhya': { lat: 26.7922, lng: 82.1998, name: 'Ayodhya' },
  'faizabad': { lat: 26.7922, lng: 82.1998, name: 'Ayodhya' },
  'akbarpur': { lat: 26.4355, lng: 82.5414, name: 'Akbarpur' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  'kanpur': { lat: 26.4499, lng: 80.3319, name: 'Kanpur' },
  'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra' },
  'gorakhpur': { lat: 26.7606, lng: 83.3732, name: 'Gorakhpur' }
};

function normalizeCityName(str = '') {
  const lower = str.toLowerCase();
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (lower.includes(city)) return city;
  }
  return null;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getCityCoords(name) {
  const key = normalizeCityName(name);
  if (key && CITY_COORDINATES[key]) return CITY_COORDINATES[key];
  return { lat: 26.8467, lng: 80.9462, name: name || 'City' };
}

/**
 * Generate 3 alternative route corridors for any origin -> destination
 */
function generateCandidateRoutes(origin, destination) {
  const origKey = normalizeCityName(origin) || 'lucknow';
  const destKey = normalizeCityName(destination) || 'varanasi';

  const origCoords = getCityCoords(origKey);
  const destCoords = getCityCoords(destKey);
  const directDistance = Math.max(50, haversineDistance(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng) * 1.25);

  if (origKey === 'lucknow' && destKey === 'varanasi') {
    return [
      {
        id: 'route_A',
        name: 'Route A: Direct NH31 / Purvanchal Corridor',
        corridor: 'Lucknow → Sultanpur → Jaunpur → Varanasi',
        distanceKm: 310,
        estimatedDurationHours: 6.0,
        hubs: ['Lucknow', 'Sultanpur', 'Jaunpur', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Sultanpur', lat: 26.2648, lng: 82.0727, type: 'hub' },
          { name: 'Jaunpur', lat: 25.7464, lng: 82.6837, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        color: '#10b981'
      },
      {
        id: 'route_B',
        name: 'Route B: Southern Highway via Raebareli & Prayagraj',
        corridor: 'Lucknow → Raebareli → Prayagraj → Varanasi',
        distanceKm: 335,
        estimatedDurationHours: 6.8,
        hubs: ['Lucknow', 'Raebareli', 'Prayagraj', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Raebareli', lat: 26.2236, lng: 81.2409, type: 'hub' },
          { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        color: '#3b82f6'
      },
      {
        id: 'route_C',
        name: 'Route C: Northern Heritage via Ayodhya & Akbarpur',
        corridor: 'Lucknow → Ayodhya → Akbarpur → Varanasi',
        distanceKm: 355,
        estimatedDurationHours: 7.2,
        hubs: ['Lucknow', 'Ayodhya', 'Akbarpur', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
          { name: 'Akbarpur', lat: 26.4355, lng: 82.5414, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        color: '#f59e0b'
      }
    ];
  }

  // Generic fallback generator for arbitrary cities
  return [
    {
      id: 'route_A',
      name: `Route A: Primary Express Highway (${origin} → ${destination})`,
      corridor: `${origin} → Main Corridor → ${destination}`,
      distanceKm: Math.round(directDistance),
      estimatedDurationHours: Number((directDistance / 55).toFixed(1)),
      hubs: [origin, destination],
      stops: [
        { name: origin, lat: origCoords.lat, lng: origCoords.lng, type: 'source' },
        { name: destination, lat: destCoords.lat, lng: destCoords.lng, type: 'destination' }
      ],
      color: '#10b981'
    },
    {
      id: 'route_B',
      name: `Route B: Secondary Arterial Bypass (${origin} → ${destination})`,
      corridor: `${origin} → Regional Hubs → ${destination}`,
      distanceKm: Math.round(directDistance * 1.1),
      estimatedDurationHours: Number(((directDistance * 1.1) / 50).toFixed(1)),
      hubs: [origin, destination],
      stops: [
        { name: origin, lat: origCoords.lat, lng: origCoords.lng, type: 'source' },
        { name: destination, lat: destCoords.lat, lng: destCoords.lng, type: 'destination' }
      ],
      color: '#3b82f6'
    },
    {
      id: 'route_C',
      name: `Route C: Outer Loop Route (${origin} → ${destination})`,
      corridor: `${origin} → Outer Bypass → ${destination}`,
      distanceKm: Math.round(directDistance * 1.2),
      estimatedDurationHours: Number(((directDistance * 1.2) / 48).toFixed(1)),
      hubs: [origin, destination],
      stops: [
        { name: origin, lat: origCoords.lat, lng: origCoords.lng, type: 'source' },
        { name: destination, lat: destCoords.lat, lng: destCoords.lng, type: 'destination' }
      ],
      color: '#f59e0b'
    }
  ];
}

/**
 * Check if a shipment is geographically along the route corridor
 */
function isShipmentAlongRoute(route, shipment) {
  const pickupCity = normalizeCityName(shipment.pickupLocation);
  const dropCity = normalizeCityName(shipment.dropLocation);

  // If route explicitly defines hubs, check if cities match
  if (route.hubs && route.hubs.length > 0) {
    const routeHubKeys = route.hubs.map(h => normalizeCityName(h)).filter(Boolean);
    const pickupIdx = routeHubKeys.indexOf(pickupCity);
    const dropIdx = routeHubKeys.indexOf(dropCity);

    if (pickupIdx !== -1 && dropIdx !== -1 && pickupIdx < dropIdx) {
      return { compatible: true, detourKm: 0, overlapScore: 1.0 };
    }

    if (pickupIdx !== -1 || dropIdx !== -1) {
      return { compatible: true, detourKm: 8, overlapScore: 0.7 };
    }
  }

  // Fallback Haversine proximity to route stops
  const pCoords = getCityCoords(shipment.pickupLocation);
  const dCoords = getCityCoords(shipment.dropLocation);
  
  let minPickupDetour = 999;
  let minDropDetour = 999;

  for (const stop of (route.stops || [])) {
    const d1 = haversineDistance(pCoords.lat, pCoords.lng, stop.lat, stop.lng);
    const d2 = haversineDistance(dCoords.lat, dCoords.lng, stop.lat, stop.lng);
    if (d1 < minPickupDetour) minPickupDetour = d1;
    if (d2 < minDropDetour) minDropDetour = d2;
  }

  const totalDetour = minPickupDetour + minDropDetour;
  if (totalDetour <= 40) {
    return {
      compatible: true,
      detourKm: Math.min(25, totalDetour),
      overlapScore: Math.max(0.3, (40 - totalDetour) / 40)
    };
  }

  return { compatible: false, detourKm: totalDetour, overlapScore: 0 };
}

/**
 * Compute the composite MatchScore for a shipment on a route
 * MatchScore = w1*(RouteOverlap) + w2*(UtilizationGain) + w3*(Revenue) - w4*(DetourDistance) - w5*(Delay)
 */
function computeShipmentScore(trip, route, shipment, routeCheck) {
  const w1 = 30; // Route overlap weight
  const w2 = 25; // Utilization gain weight
  const w3 = 0.02; // Revenue weight
  const w4 = 1.2; // Detour penalty weight
  const w5 = 0.5; // Delay penalty weight

  const routeOverlap = (routeCheck.overlapScore || 0.5) * 100;
  const utilizationGain = (shipment.weightKg / Math.max(100, trip.totalCapacityKg)) * 100;
  const revenue = shipment.fareEstimate?.totalFare || calculateFare(shipment.distanceKm, shipment.weightKg).totalFare;
  const detour = routeCheck.detourKm || 0;
  const delayMinutes = detour * 1.8;

  const score = (w1 * (routeOverlap / 100)) +
                (w2 * (utilizationGain / 100)) +
                (w3 * revenue) -
                (w4 * detour) -
                (w5 * (delayMinutes / 10));

  return {
    score: Math.max(10, Math.round(score * 10) / 10),
    revenue,
    detourKm: detour,
    extraTimeMinutes: Math.round(delayMinutes),
    utilizationGainKg: shipment.weightKg,
    overlapPercent: Math.round(routeOverlap)
  };
}

/**
 * Main Algorithm: Evaluate Route Options (A, B, C) and Bundle Compatible Shipments
 */
function matchTripRoutes(trip, availableShipments) {
  const routes = trip.routes && trip.routes.length > 0
    ? trip.routes
    : generateCandidateRoutes(trip.source, trip.destination);

  const evaluatedRoutes = routes.map((route) => {
    // 1. Filter shipments by hard constraints
    const compatibleShipments = [];

    for (const shipment of availableShipments) {
      // Must be pending or open for matching
      if (shipment.status !== 'PENDING' && shipment.status !== 'MATCHED') continue;
      
      // Hard constraint: Capacity check
      if (shipment.weightKg > trip.availableCapacityKg) continue;

      // Hard constraint: Geographic route overlap
      const routeCheck = isShipmentAlongRoute(route, shipment);
      if (!routeCheck.compatible) continue;

      // Compute score
      const matchMetrics = computeShipmentScore(trip, route, shipment, routeCheck);
      compatibleShipments.push({
        shipment,
        metrics: matchMetrics
      });
    }

    // 2. Sort by match score descending (Knapsack greedy approach)
    compatibleShipments.sort((a, b) => b.metrics.score - a.metrics.score);

    // 3. Greedily select shipments until available capacity is reached
    let accumulatedWeight = 0;
    let accumulatedRevenue = 0;
    let accumulatedDetourKm = 0;
    let accumulatedExtraTime = 0;
    const bundledShipments = [];

    for (const item of compatibleShipments) {
      if (accumulatedWeight + item.shipment.weightKg <= trip.availableCapacityKg) {
        accumulatedWeight += item.shipment.weightKg;
        accumulatedRevenue += item.metrics.revenue;
        accumulatedDetourKm += item.metrics.detourKm;
        accumulatedExtraTime += item.metrics.extraTimeMinutes;
        bundledShipments.push({
          ...item.shipment,
          matchScore: item.metrics.score,
          overlapPercent: item.metrics.overlapPercent,
          detourKm: item.metrics.detourKm
        });
      }
    }

    const currentLoad = trip.currentLoadKg || 0;
    const newTotalLoad = currentLoad + accumulatedWeight;
    const utilizationRate = Math.min(100, Math.round((newTotalLoad / Math.max(1, trip.totalCapacityKg)) * 100));

    // Overall Route Score
    const routeCompositeScore = (bundledShipments.length * 20) +
                                (utilizationRate * 0.5) +
                                (accumulatedRevenue * 0.05) -
                                (accumulatedDetourKm * 1.5);

    return {
      ...route,
      bundledShipments,
      totalMatchedCount: compatibleShipments.length,
      bundledCount: bundledShipments.length,
      additionalCargoKg: accumulatedWeight,
      totalNewLoadKg: newTotalLoad,
      utilizationRate,
      estimatedExtraRevenue: Math.round(accumulatedRevenue),
      extraDistanceKm: accumulatedDetourKm,
      extraTravelTimeMinutes: accumulatedExtraTime,
      routeScore: Math.max(15, Math.round(routeCompositeScore))
    };
  });

  // Rank routes by overall score
  evaluatedRoutes.sort((a, b) => b.routeScore - a.routeScore);
  if (evaluatedRoutes.length > 0) {
    evaluatedRoutes[0].isRecommended = true;
  }

  return evaluatedRoutes;
}

module.exports = {
  generateCandidateRoutes,
  matchTripRoutes,
  getCityCoords,
  isShipmentAlongRoute
};
