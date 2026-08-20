
// Indian major logistics hubs coordinates (Lat, Lon)
const CITY_COORDINATES = {
  'delhi': { lat: 28.6139, lon: 77.2090, name: 'Delhi NCR' },
  'gurugram': { lat: 28.4595, lon: 77.0266, name: 'Gurugram' },
  'noida': { lat: 28.5355, lon: 77.3910, name: 'Noida' },
  'jaipur': { lat: 26.9124, lon: 75.7873, name: 'Jaipur' },
  'udaipur': { lat: 24.5854, lon: 73.7125, name: 'Udaipur' },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad' },
  'vadodara': { lat: 22.3072, lon: 73.1812, name: 'Vadodara' },
  'surat': { lat: 21.1702, lon: 72.8311, name: 'Surat' },
  'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune' },
  'solapur': { lat: 17.6599, lon: 75.9064, name: 'Solapur' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  'hosur': { lat: 12.7409, lon: 77.8253, name: 'Hosur' },
  'krishnagiri': { lat: 12.5266, lon: 78.2144, name: 'Krishnagiri' },
  'vellore': { lat: 12.9165, lon: 79.1325, name: 'Vellore' },
  'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  'coimbatore': { lat: 11.0168, lon: 76.9558, name: 'Coimbatore' },
  'kochi': { lat: 9.9312, lon: 76.2673, name: 'Kochi' },
  'kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  'durgapur': { lat: 23.5204, lon: 87.3119, name: 'Durgapur' },
  'asansol': { lat: 23.6739, lon: 86.9524, name: 'Asansol' },
  'dhanbad': { lat: 23.7957, lon: 86.4304, name: 'Dhanbad' },
  'gaya': { lat: 24.7914, lon: 85.0002, name: 'Gaya' },
  'patna': { lat: 25.5941, lon: 85.1376, name: 'Patna' },
  'lucknow': { lat: 26.8467, lon: 80.9462, name: 'Lucknow' },
  'kanpur': { lat: 26.4499, lon: 80.3319, name: 'Kanpur' },
  'agra': { lat: 27.1767, lon: 78.0081, name: 'Agra' },
  'varanasi': { lat: 25.3176, lon: 82.9739, name: 'Varanasi' },
  'indore': { lat: 22.7196, lon: 75.8577, name: 'Indore' },
  'bhopal': { lat: 23.2599, lon: 77.4126, name: 'Bhopal' },
  'nagpur': { lat: 21.1458, lon: 79.0882, name: 'Nagpur' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, name: 'Chandigarh' },
  'ludhiana': { lat: 30.9010, lon: 75.8573, name: 'Ludhiana' },
  'amritsar': { lat: 31.6340, lon: 74.8723, name: 'Amritsar' }
};

function normalizeCityName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function getCoordinates(cityName) {
  if (!cityName) return null;
  const clean = normalizeCityName(cityName);
  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }
  // Default deterministic hash coordinate in India if unknown
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) hash = (hash << 5) - hash + cityName.charCodeAt(i);
  const lat = 20.0 + ((Math.abs(hash) % 100) / 10.0);
  const lon = 75.0 + ((Math.abs(hash >> 3) % 100) / 10.0);
  return { lat, lon, name: cityName };
}

// Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
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

function getCityDistance(city1, city2) {
  const c1 = getCoordinates(city1);
  const c2 = getCoordinates(city2);
  if (!c1 || !c2) return 300;
  const dist = calculateDistance(c1.lat, c1.lon, c2.lat, c2.lon);
  // Add 15% road curvature factor to straight-line distance
  return Math.round(dist * 1.15) || 50;
}

// Check if pickup and drop are on or near the trip's corridor
function matchTripCorridor(trip, shipperPickup, shipperDrop) {
  const pickupNorm = normalizeCityName(shipperPickup);
  const dropNorm = normalizeCityName(shipperDrop);

  const fullRoute = [trip.origin, ...(trip.waypoints || []), trip.destination];
  const normalizedRoute = fullRoute.map(normalizeCityName);

  let pickupIndex = -1;
  let dropIndex = -1;

  for (let i = 0; i < normalizedRoute.length; i++) {
    const stop = normalizedRoute[i];
    if (pickupIndex === -1 && (stop.includes(pickupNorm) || pickupNorm.includes(stop))) {
      pickupIndex = i;
    }
    if (stop.includes(dropNorm) || dropNorm.includes(stop)) {
      dropIndex = i;
    }
  }

  // Exact or waypoint match with correct travel direction
  if (pickupIndex !== -1 && dropIndex !== -1 && pickupIndex < dropIndex) {
    const pickupCity = fullRoute[pickupIndex];
    const dropCity = fullRoute[dropIndex];
    const dist = getCityDistance(pickupCity, dropCity);
    return {
      isMatch: true,
      matchType: 'CORRIDOR_WAYPOINT_EXACT',
      estimatedDistanceKm: dist,
      detourKm: 0,
      pickupStop: pickupCity,
      dropStop: dropCity
    };
  }

  // Geospatial proximity match (within 60km detour of any waypoint)
  const pCoord = getCoordinates(shipperPickup);
  const dCoord = getCoordinates(shipperDrop);

  if (pCoord && dCoord) {
    let closestPickupIdx = -1;
    let minPickupDist = Infinity;
    let closestDropIdx = -1;
    let minDropDist = Infinity;

    fullRoute.forEach((stop, idx) => {
      const stopCoord = getCoordinates(stop);
      if (stopCoord) {
        const distP = calculateDistance(pCoord.lat, pCoord.lon, stopCoord.lat, stopCoord.lon);
        if (distP < minPickupDist) {
          minPickupDist = distP;
          closestPickupIdx = idx;
        }
        const distD = calculateDistance(dCoord.lat, dCoord.lon, stopCoord.lat, stopCoord.lon);
        if (distD < minDropDist) {
          minDropDist = distD;
          closestDropIdx = idx;
        }
      }
    });

    if (minPickupDist <= 75 && minDropDist <= 75 && closestPickupIdx <= closestDropIdx) {
      const dist = getCityDistance(shipperPickup, shipperDrop);
      return {
        isMatch: true,
        matchType: 'DETOUR_RADIUS_MATCH',
        estimatedDistanceKm: dist,
        detourKm: Math.round(minPickupDist + minDropDist),
        pickupStop: fullRoute[closestPickupIdx],
        dropStop: fullRoute[closestDropIdx]
      };
    }
  }

  return { isMatch: false };
}

module.exports = {
  CITY_COORDINATES,
  getCoordinates,
  calculateDistance,
  getCityDistance,
  matchTripCorridor
};
