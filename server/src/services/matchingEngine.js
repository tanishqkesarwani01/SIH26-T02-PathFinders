/**
 * Matching & Route Optimization Engine
 * Implements Constraint Filtering, Dynamic Corridor Scoring, and Greedy Cargo Bundling
 */

const { calculateFare } = require('./pricingEngine');

// City Coordinates for Geocoding & Distance Calculation in North India / Uttar Pradesh corridor
const CITY_COORDINATES = {
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  'nihalgarh': { lat: 26.6025, lng: 81.6520, name: 'Nihalgarh' },
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
        name: 'Route A: Direct NH731 / Purvanchal Corridor',
        corridor: 'Lucknow → Nihalgarh → Sultanpur → Jaunpur → Varanasi',
        distanceKm: 310,
        estimatedDurationHours: 6.0,
        hubs: ['Lucknow', 'Nihalgarh', 'Sultanpur', 'Jaunpur', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Nihalgarh', lat: 26.6025, lng: 81.6520, type: 'hub' },
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

    // 2. Sort by route order (who comes FIRST along the route progression)
    compatibleShipments.sort((a, b) => {
      const pA = distancePointToPolyline(a.shipment.pickupCoords?.lat || 0, a.shipment.pickupCoords?.lng || 0, route.stops).progress;
      const pB = distancePointToPolyline(b.shipment.pickupCoords?.lat || 0, b.shipment.pickupCoords?.lng || 0, route.stops).progress;
      return pA - pB;
    });

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

/**
 * Calculates perpendicular/minimum distance from a point P to a line segment AB in km,
 * and the projection scalar t in [0, 1].
 */
function distancePointToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const midLat = (aLat + bLat) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180) * 111.32; // km per deg lon
  const ky = 110.57; // km per deg lat

  const bx = (bLng - aLng) * kx, by = (bLat - aLat) * ky;
  const px = (pLng - aLng) * kx, py = (pLat - aLat) * ky;

  const segLenSq = bx * bx + by * by;
  if (segLenSq === 0) {
    const dist = Math.sqrt(px * px + py * py);
    return { distanceKm: dist, t: 0, closestLat: aLat, closestLng: aLng };
  }

  let t = (px * bx + py * by) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = t * bx;
  const closestY = t * by;
  const dx = px - closestX;
  const dy = py - closestY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const closestLat = aLat + t * (bLat - aLat);
  const closestLng = aLng + t * (bLng - aLng);

  return { distanceKm: dist, t, closestLat, closestLng };
}

/**
 * Calculates minimum distance from point P to an entire polyline of stops/waypoints,
 * and cumulative relative progress (0.0 to 1.0) along the route polyline.
 */
function distancePointToPolyline(pLat, pLng, polylineStops = []) {
  if (!polylineStops || polylineStops.length === 0) {
    return { minDistanceKm: 9999, progress: 0, closestStopIndex: 0 };
  }
  if (polylineStops.length === 1) {
    return {
      minDistanceKm: haversineDistance(pLat, pLng, polylineStops[0].lat, polylineStops[0].lng),
      progress: 0,
      closestStopIndex: 0
    };
  }

  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 0; i < polylineStops.length - 1; i++) {
    const d = haversineDistance(
      polylineStops[i].lat, polylineStops[i].lng,
      polylineStops[i + 1].lat, polylineStops[i + 1].lng
    );
    segmentLengths.push(d);
    totalLength += d;
  }

  let minDistanceKm = Infinity;
  let bestProgress = 0;
  let bestStopIndex = 0;
  let accumLength = 0;

  for (let i = 0; i < polylineStops.length - 1; i++) {
    const segRes = distancePointToSegment(
      pLat, pLng,
      polylineStops[i].lat, polylineStops[i].lng,
      polylineStops[i + 1].lat, polylineStops[i + 1].lng
    );

    if (segRes.distanceKm < minDistanceKm) {
      minDistanceKm = segRes.distanceKm;
      bestStopIndex = i;
      const progressKm = accumLength + segRes.t * segmentLengths[i];
      bestProgress = totalLength > 0 ? progressKm / totalLength : 0;
    }
    accumLength += segmentLengths[i];
  }

  return {
    minDistanceKm: Math.round(minDistanceKm * 10) / 10,
    progress: bestProgress,
    closestStopIndex: bestStopIndex
  };
}

/**
 * Purely geometric, location-agnostic en-route proximity & 10 km corridor matching algorithm.
 * Evaluates ANY shipment coordinates against ANY truck route geometry and live GPS location.
 */
function scanEnRouteProximityConsignments(trip, currentCoords, proximityRadiusKm = 10, allShipments = []) {
  if (!trip) return [];

  const activeRoute = (trip.routes || []).find(r => r.id === trip.selectedRouteId) || trip.routes?.[0] || {
    stops: [
      { name: trip.source, ...getCityCoords(trip.source) },
      { name: trip.destination, ...getCityCoords(trip.destination) }
    ]
  };

  const polylineStops = (activeRoute.stops && activeRoute.stops.length > 0)
    ? activeRoute.stops
    : [
        { name: trip.source, ...getCityCoords(trip.source) },
        { name: trip.destination, ...getCityCoords(trip.destination) }
      ];

  const truckLat = currentCoords?.lat !== undefined ? currentCoords.lat : polylineStops[0].lat;
  const truckLng = currentCoords?.lng !== undefined ? currentCoords.lng : polylineStops[0].lng;

  // 1. Calculate truck's current progress along the route polyline (0.0 to 1.0)
  const truckProgRes = distancePointToPolyline(truckLat, truckLng, polylineStops);
  const truckProgress = truckProgRes.progress;

  const remainingCapacity = trip.availableCapacityKg !== undefined
    ? trip.availableCapacityKg
    : ((trip.totalCapacityKg || 5000) - (trip.currentLoadKg || 0));

  const opportunities = [];

  for (const shipment of allShipments) {
    if (shipment.status !== 'PENDING' && shipment.status !== 'MATCHED') continue;
    if (shipment.assignedTripId === trip.id) continue;

    // Constraint 1: Available Capacity
    if (shipment.weightKg > remainingCapacity) continue;

    // Extract pickup & drop coordinates dynamically
    const pCoords = shipment.pickupCoords || (shipment.pickup?.lat ? shipment.pickup : getCityCoords(shipment.pickupLocation));
    const dCoords = shipment.dropCoords || (shipment.drop?.lat ? shipment.drop : getCityCoords(shipment.dropLocation));

    if (!pCoords || pCoords.lat === undefined || !dCoords || dCoords.lat === undefined) continue;

    // Step 1 — Pickup Proximity (Pure Geometry)
    // Distance from truck's current GPS position to pickup point
    const distTruckToPickup = haversineDistance(truckLat, truckLng, pCoords.lat, pCoords.lng);
    // Minimum distance from pickup to route polyline
    const pickPolyRes = distancePointToPolyline(pCoords.lat, pCoords.lng, polylineStops);
    const distPickupToRoute = pickPolyRes.minDistanceKm;
    const pickupProgress = pickPolyRes.progress;

    // Proximity sensor rule: Truck MUST be physically within proximityRadiusKm (10 km) of pickup
    if (distTruckToPickup > proximityRadiusKm) continue;

    // Prevent recommending shipments that were already passed behind the truck
    if (pickupProgress < (truckProgress - 0.04)) continue;

    // Step 2 — Destination Compatibility (Pure Geometry)
    const dropPolyRes = distancePointToPolyline(dCoords.lat, dCoords.lng, polylineStops);
    const distDropToRoute = dropPolyRes.minDistanceKm;
    const dropProgress = dropPolyRes.progress;

    // Destination must be ahead of pickup in forward direction of travel
    const isForwardDirection = dropProgress >= (pickupProgress - 0.04);
    if (!isForwardDirection) continue; // Opposite direction -> filter out

    // Destination must not exceed acceptable route corridor detour
    if (distDropToRoute > 45) continue; // Out of corridor -> filter out

    // Step 3 — Dynamic Detour Calculation
    const detourKm = Math.round((distPickupToRoute + distDropToRoute) * 10) / 10;
    const estimatedMinutesDelay = Math.round(detourKm * 1.8 + 6);

    // Step 4 — Dynamic Compatibility Score (0 to 100%)
    const effectiveProximity = Math.min(distTruckToPickup, distPickupToRoute);
    const proximityScore = Math.max(0, ((proximityRadiusKm - effectiveProximity) / proximityRadiusKm) * 30);
    const destScore = Math.max(0, ((45 - distDropToRoute) / 45) * 35);
    const capacityRatio = Math.min(1, shipment.weightKg / Math.max(1, remainingCapacity));
    const capacityScore = 15 + capacityRatio * 10;
    const detourPenalty = Math.min(10, detourKm * 0.35);

    const compatibilityScore = Math.min(99, Math.max(65, Math.round(proximityScore + destScore + capacityScore - detourPenalty)));

    const fare = shipment.fareEstimate?.totalFare || calculateFare(shipment.distanceKm || Math.round(haversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng)), shipment.weightKg).totalFare;

    const newRemainingCapacityKg = Math.max(0, remainingCapacity - shipment.weightKg);
    const newTotalLoadKg = (trip.currentLoadKg || 0) + shipment.weightKg;
    const newUtilizationPercent = Math.min(100, Math.round((newTotalLoadKg / Math.max(1, trip.totalCapacityKg || 5000)) * 100));

    const pName = shipment.pickupLocation || shipment.pickup?.name || 'Pickup Point';
    const dName = shipment.dropLocation || shipment.drop?.name || 'Dropoff Point';

    opportunities.push({
      shipmentId: shipment.id,
      shipment,
      proximityDistanceKm: Math.round(distTruckToPickup * 10) / 10,
      distanceFromRouteKm: distPickupToRoute,
      detourKm,
      estimatedMinutesDelay,
      revenue: fare,
      weightKg: shipment.weightKg,
      packageType: shipment.packageType || 'Commercial Freight',
      packageDescription: shipment.packageDescription || 'General Cargo',
      senderName: shipment.senderName || 'Verified Consignor',
      senderPhone: shipment.senderPhone || '+91 98000 12345',
      pickupLocation: pName,
      dropLocation: dName,
      pickupCoords: pCoords,
      dropCoords: dCoords,
      currentCapacityKg: remainingCapacity,
      newRemainingCapacityKg,
      newUtilizationPercent,
      compatibilityScore,
      alertMessage: `🚚 En-Route Cargo Opportunity: ${pName} → ${dName} (${Math.round(distTruckToPickup * 10) / 10} km away, ${compatibilityScore}% Match)`,
      urgency: distTruckToPickup <= 6 ? 'IMMEDIATE' : 'APPROACHING'
    });
  }

  // Sort opportunities strictly by distance from truck (closest upcoming on route comes first!)
  opportunities.sort((a, b) => a.proximityDistanceKm - b.proximityDistanceKm);
  return opportunities;
}

module.exports = {
  generateCandidateRoutes,
  matchTripRoutes,
  getCityCoords,
  isShipmentAlongRoute,
  scanEnRouteProximityConsignments,
  distancePointToSegment,
  distancePointToPolyline,
  haversineDistance
};


