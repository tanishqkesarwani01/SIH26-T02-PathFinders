// Geospatial utility functions

/**
 * Haversine formula - distance between two lat/lng points in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate extra detour distance if a driver's trip from A->B
 * needs to go via C (pickup) and D (dropoff)
 */
function detourDistance(srcLat, srcLng, dstLat, dstLng, pickLat, pickLng, dropLat, dropLng) {
  const direct = haversineDistance(srcLat, srcLng, dstLat, dstLng);
  const withDetour =
    haversineDistance(srcLat, srcLng, pickLat, pickLng) +
    haversineDistance(pickLat, pickLng, dropLat, dropLng) +
    haversineDistance(dropLat, dropLng, dstLat, dstLng);
  return Math.max(0, withDetour - direct);
}

/**
 * Route overlap score (0-1): how aligned the shipment vector is with the trip vector
 */
function routeOverlapScore(srcLat, srcLng, dstLat, dstLng, pickLat, pickLng, dropLat, dropLng) {
  // Vector from trip src to dst
  const tv = { x: dstLat - srcLat, y: dstLng - srcLng };
  // Vector from shipment pickup to dropoff
  const sv = { x: dropLat - pickLat, y: dropLng - pickLng };

  const dot = tv.x * sv.x + tv.y * sv.y;
  const magT = Math.sqrt(tv.x ** 2 + tv.y ** 2);
  const magS = Math.sqrt(sv.x ** 2 + sv.y ** 2);

  if (magT === 0 || magS === 0) return 0;
  return Math.max(0, dot / (magT * magS));
}

/**
 * Generate 3 route variants from source to destination
 * Returns array of {name, label, description, waypointLat, waypointLng, extraKm, label}
 */
function generateRouteVariants(srcLat, srcLng, dstLat, dstLng) {
  const directDist = haversineDistance(srcLat, srcLng, dstLat, dstLng);

  // Midpoint
  const midLat = (srcLat + dstLat) / 2;
  const midLng = (srcLng + dstLng) / 2;

  // Route A: Direct / Highway - slightly north of midpoint
  const aLat = midLat + 0.3;
  const aLng = midLng + 0.2;

  // Route B: Commercial Freight Corridor - via major commercial hub slightly east
  const bLat = midLat - 0.2;
  const bLng = midLng + 0.5;

  // Route C: Detour-optimized / Local - slightly west of midpoint
  const cLat = midLat + 0.1;
  const cLng = midLng - 0.4;

  const distA = haversineDistance(srcLat, srcLng, aLat, aLng) + haversineDistance(aLat, aLng, dstLat, dstLng);
  const distB = haversineDistance(srcLat, srcLng, bLat, bLng) + haversineDistance(bLat, bLng, dstLat, dstLng);
  const distC = haversineDistance(srcLat, srcLng, cLat, cLng) + haversineDistance(cLat, cLng, dstLat, dstLng);

  return [
    {
      key: "A",
      label: "Route A - Highway Express",
      description: "Fastest highway expressway. Minimal stops, maximum speed.",
      waypointLat: aLat,
      waypointLng: aLng,
      distanceKm: Math.round(distA),
      extraKm: Math.round(distA - directDist),
      estimatedHours: Math.round((distA / 70) * 10) / 10,
      shipmentBonus: 0.6, // lower bonus for fewer stops
    },
    {
      key: "B",
      label: "Route B - Freight Corridor",
      description: "Commercial freight corridor via industrial hubs. Higher cargo density.",
      waypointLat: bLat,
      waypointLng: bLng,
      distanceKm: Math.round(distB),
      extraKm: Math.round(distB - directDist),
      estimatedHours: Math.round((distB / 60) * 10) / 10,
      shipmentBonus: 1.0, // highest bonus
    },
    {
      key: "C",
      label: "Route C - Local Optimized",
      description: "Toll-free local route. Good local shipment density.",
      waypointLat: cLat,
      waypointLng: cLng,
      distanceKm: Math.round(distC),
      extraKm: Math.round(distC - directDist),
      estimatedHours: Math.round((distC / 55) * 10) / 10,
      shipmentBonus: 0.8,
    },
  ];
}

module.exports = { haversineDistance, detourDistance, routeOverlapScore, generateRouteVariants };
