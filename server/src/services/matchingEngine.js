/**
 * Matching & Route Optimization Engine
 * Implements Constraint Filtering, Dynamic Corridor Scoring, and Greedy Cargo Bundling
 */

const { calculateFare } = require('./pricingEngine');
const {
  getDrivingRoute,
  getDrivingRouteMultiStop,
  getDrivingRouteAlternatives,
  getDrivingDistanceKm,
  geocodeAddress,
  reverseGeocode
} = require('./osrmService');

// Extended City Coordinates for Uttar Pradesh, New Delhi / NCR Corridor & North India
const CITY_COORDINATES = {
  // National Capital Region (NCR) & Delhi
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
  'noida': { lat: 28.5355, lng: 77.3910, name: 'Noida' },
  'greater noida': { lat: 28.4744, lng: 77.5040, name: 'Greater Noida' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, name: 'Gurgaon' },
  'gurugram': { lat: 28.4595, lng: 77.0266, name: 'Gurugram' },
  'faridabad': { lat: 28.4089, lng: 77.3178, name: 'Faridabad' },
  'meerut': { lat: 28.9845, lng: 77.7064, name: 'Meerut' },
  'hapur': { lat: 28.7306, lng: 77.7759, name: 'Hapur' },
  'bulandshahr': { lat: 28.4070, lng: 77.8498, name: 'Bulandshahr' },
  'muzaffarnagar': { lat: 29.4727, lng: 77.7085, name: 'Muzaffarnagar' },
  'saharanpur': { lat: 29.9679, lng: 77.5452, name: 'Saharanpur' },

  // Western & Central UP
  'aligarh': { lat: 27.8974, lng: 78.0880, name: 'Aligarh' },
  'mathura': { lat: 27.4924, lng: 77.6737, name: 'Mathura' },
  'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra' },
  'firozabad': { lat: 27.1593, lng: 78.3957, name: 'Firozabad' },
  'mainpuri': { lat: 27.2289, lng: 79.0278, name: 'Mainpuri' },
  'etawah': { lat: 26.7855, lng: 79.0154, name: 'Etawah' },
  'auraiya': { lat: 26.4673, lng: 79.5165, name: 'Auraiya' },

  // Rohilkhand & Northern UP
  'moradabad': { lat: 28.8386, lng: 78.7733, name: 'Moradabad' },
  'bareilly': { lat: 28.3670, lng: 79.4304, name: 'Bareilly' },
  'rampur': { lat: 28.8154, lng: 79.0257, name: 'Rampur' },
  'shahjahanpur': { lat: 27.8814, lng: 79.9120, name: 'Shahjahanpur' },
  'sitapur': { lat: 27.5683, lng: 80.6829, name: 'Sitapur' },
  'hardoi': { lat: 27.3956, lng: 80.1317, name: 'Hardoi' },
  'lakhimpur': { lat: 27.9463, lng: 80.7767, name: 'Lakhimpur' },

  // Awadh & Central Corridor
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  'barabanki': { lat: 26.9274, lng: 81.1834, name: 'Barabanki' },
  'haidergarh': { lat: 26.6980, lng: 81.3340, name: 'Haidergarh' },
  'nihalgarh': { lat: 26.6025, lng: 81.6520, name: 'Nihalgarh' },
  'unnao': { lat: 26.5393, lng: 80.4878, name: 'Unnao' },
  'kanpur': { lat: 26.4499, lng: 80.3319, name: 'Kanpur' },
  'fatehpur': { lat: 25.9284, lng: 80.8130, name: 'Fatehpur' },
  'raebareli': { lat: 26.2236, lng: 81.2409, name: 'Raebareli' },
  'amethi': { lat: 26.1557, lng: 81.8159, name: 'Amethi' },
  'sultanpur': { lat: 26.2648, lng: 82.0727, name: 'Sultanpur' },
  'pratapgarh': { lat: 25.8977, lng: 81.9472, name: 'Pratapgarh' },

  // Eastern UP & Purvanchal
  'ayodhya': { lat: 26.7922, lng: 82.1998, name: 'Ayodhya' },
  'faizabad': { lat: 26.7922, lng: 82.1998, name: 'Ayodhya' },
  'akbarpur': { lat: 26.4355, lng: 82.5414, name: 'Akbarpur' },
  'gonda': { lat: 27.1340, lng: 81.9619, name: 'Gonda' },
  'bahraich': { lat: 27.5750, lng: 81.5950, name: 'Bahraich' },
  'basti': { lat: 26.7963, lng: 82.7483, name: 'Basti' },
  'gorakhpur': { lat: 26.7606, lng: 83.3732, name: 'Gorakhpur' },
  'deoria': { lat: 26.5024, lng: 83.7791, name: 'Deoria' },
  'kushinagar': { lat: 26.7410, lng: 83.8890, name: 'Kushinagar' },
  'azamgarh': { lat: 26.0738, lng: 83.1859, name: 'Azamgarh' },
  'mau': { lat: 25.9419, lng: 83.5610, name: 'Mau' },
  'ballia': { lat: 25.7583, lng: 84.1482, name: 'Ballia' },
  'jaunpur': { lat: 25.7464, lng: 82.6837, name: 'Jaunpur' },
  'ghazipur': { lat: 25.5840, lng: 83.5770, name: 'Ghazipur' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  'allahabad': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  'mirzapur': { lat: 25.1337, lng: 82.5644, name: 'Mirzapur' },
  'bhadohi': { lat: 25.3944, lng: 82.5694, name: 'Bhadohi' },
  'chandauli': { lat: 25.2608, lng: 83.2707, name: 'Chandauli' },

  // Bundelkhand
  'jhansi': { lat: 25.4484, lng: 78.5685, name: 'Jhansi' },
  'lalitpur': { lat: 24.6908, lng: 78.4116, name: 'Lalitpur' },
  'orai': { lat: 25.9904, lng: 79.4526, name: 'Orai' },
  'banda': { lat: 25.4756, lng: 80.3364, name: 'Banda' },
  'chitrakoot': { lat: 25.2070, lng: 80.9200, name: 'Chitrakoot' }
};

function normalizeCityName(str = '') {
  if (!str) return null;
  const lower = str.toLowerCase().trim();

  // 1. Exact match
  if (CITY_COORDINATES[lower]) return lower;

  // 2. Sort keys by length descending so longer city names match before substrings
  const sortedKeys = Object.keys(CITY_COORDINATES).sort((a, b) => b.length - a.length);

  // 3. Word boundary or sub-phrase match
  for (const city of sortedKeys) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(lower)) return city;
  }

  // 4. Fallback substring match (only for longer words to avoid false positive like 'agra' in 'prayagraj')
  for (const city of sortedKeys) {
    if (city.length > 4 && lower.includes(city)) return city;
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
  if (key && CITY_COORDINATES[key]) return { ...CITY_COORDINATES[key] };
  return { lat: 26.8467, lng: 80.9462, name: name || 'City' };
}

async function getCityCoordsAsync(name) {
  const key = normalizeCityName(name);
  if (key && CITY_COORDINATES[key]) return { ...CITY_COORDINATES[key] };

  // Try geocoding with Nominatim (free geocoder)
  const geo = await geocodeAddress(`${name}, Uttar Pradesh, India`);
  if (geo) {
    const entry = { lat: geo.lat, lng: geo.lng, name: name.trim() };
    CITY_COORDINATES[name.toLowerCase().trim()] = entry;
    return entry;
  }

  return getCityCoords(name);
}

/**
 * Identify intermediate cities/hubs along a route's Leaflet geometry.
 */
function detectHubsAlongGeometry(geometry, origCoords, destCoords) {
  if (!geometry || geometry.length < 2) return [];

  const origKey = normalizeCityName(origCoords.name);
  const destKey = normalizeCityName(destCoords.name);
  const detected = [];

  for (const [key, c] of Object.entries(CITY_COORDINATES)) {
    if (key === origKey || key === destKey) continue;
    if (c.name.toLowerCase() === origCoords.name.toLowerCase() || c.name.toLowerCase() === destCoords.name.toLowerCase()) continue;

    // Skip hubs that are too close to origin or destination (< 20 km)
    const distToOrig = haversineDistance(origCoords.lat, origCoords.lng, c.lat, c.lng);
    const distToDest = haversineDistance(destCoords.lat, destCoords.lng, c.lat, c.lng);
    if (distToOrig < 20 || distToDest < 20) continue;

    let minD = 9999;
    let bestIdx = 0;

    // Sample geometry points
    const step = Math.max(1, Math.floor(geometry.length / 80));
    for (let i = 0; i < geometry.length; i += step) {
      const pt = geometry[i];
      const dlat = (pt[0] - c.lat) * 110.57;
      const dlng = (pt[1] - c.lng) * 111.32 * Math.cos((c.lat * Math.PI) / 180);
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < minD) {
        minD = dist;
        bestIdx = i;
      }
    }

    // Road bypass detection radius (22 km)
    if (minD <= 22) {
      detected.push({
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        dist: minD,
        progress: bestIdx / geometry.length
      });
    }
  }

  // Sort by progression along the route
  detected.sort((a, b) => a.progress - b.progress);

  // Filter out adjacent duplicate hubs that are within 30 km of each other
  const uniqueHubs = [];
  for (const hub of detected) {
    const isTooClose = uniqueHubs.some(u => haversineDistance(u.lat, u.lng, hub.lat, hub.lng) < 30);
    if (!isTooClose) {
      uniqueHubs.push(hub);
    }
  }

  // Keep up to 4 prominent intermediate hubs for a clean corridor title
  return uniqueHubs.slice(0, 4);
}

/**
 * Generate 3 alternative route corridors for any origin -> destination dynamically
 * using OSRM alternatives and intermediate corridor detection.
 */
async function generateCandidateRoutes(origin, destination) {
  const origCoords = await getCityCoordsAsync(origin);
  const destCoords = await getCityCoordsAsync(destination);

  const origKey = normalizeCityName(origin);
  const destKey = normalizeCityName(destination);

  // Special scenario 1: Lucknow ↔ Varanasi
  if (origKey === 'lucknow' && destKey === 'varanasi') {
    const [routeAData, routeBData, routeCData] = await Promise.all([
      getDrivingRouteMultiStop([
        { lat: 26.8467, lng: 80.9462 },
        { lat: 26.6025, lng: 81.6520 }, // Nihalgarh
        { lat: 26.2648, lng: 82.0727 }, // Sultanpur
        { lat: 25.7464, lng: 82.6837 }, // Jaunpur
        { lat: 25.3176, lng: 82.9739 }  // Varanasi
      ]),
      getDrivingRouteMultiStop([
        { lat: 26.8467, lng: 80.9462 },
        { lat: 26.2236, lng: 81.2409 }, // Raebareli
        { lat: 25.4358, lng: 81.8463 }, // Prayagraj
        { lat: 25.3176, lng: 82.9739 }  // Varanasi
      ]),
      getDrivingRouteMultiStop([
        { lat: 26.8467, lng: 80.9462 },
        { lat: 26.7922, lng: 82.1998 }, // Ayodhya
        { lat: 26.4355, lng: 82.5414 }, // Akbarpur
        { lat: 25.3176, lng: 82.9739 }  // Varanasi
      ])
    ]);

    return [
      {
        id: 'route_A',
        name: 'Route A: Direct NH731 / Purvanchal Corridor',
        corridor: 'Lucknow → Nihalgarh → Sultanpur → Jaunpur → Varanasi',
        distanceKm: routeAData?.distanceKm || 310,
        estimatedDurationHours: routeAData ? Number((routeAData.durationMinutes / 60).toFixed(1)) : 6.0,
        hubs: ['Lucknow', 'Nihalgarh', 'Sultanpur', 'Jaunpur', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Nihalgarh', lat: 26.6025, lng: 81.6520, type: 'hub' },
          { name: 'Sultanpur', lat: 26.2648, lng: 82.0727, type: 'hub' },
          { name: 'Jaunpur', lat: 25.7464, lng: 82.6837, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        geometry: routeAData?.geometry || null,
        color: '#10b981',
        isRecommended: true
      },
      {
        id: 'route_B',
        name: 'Route B: Southern Highway via Raebareli & Prayagraj',
        corridor: 'Lucknow → Raebareli → Prayagraj → Varanasi',
        distanceKm: routeBData?.distanceKm || 335,
        estimatedDurationHours: routeBData ? Number((routeBData.durationMinutes / 60).toFixed(1)) : 6.8,
        hubs: ['Lucknow', 'Raebareli', 'Prayagraj', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Raebareli', lat: 26.2236, lng: 81.2409, type: 'hub' },
          { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        geometry: routeBData?.geometry || null,
        color: '#3b82f6',
        isRecommended: false
      },
      {
        id: 'route_C',
        name: 'Route C: Northern Heritage via Ayodhya & Akbarpur',
        corridor: 'Lucknow → Ayodhya → Akbarpur → Varanasi',
        distanceKm: routeCData?.distanceKm || 355,
        estimatedDurationHours: routeCData ? Number((routeCData.durationMinutes / 60).toFixed(1)) : 7.2,
        hubs: ['Lucknow', 'Ayodhya', 'Akbarpur', 'Varanasi'],
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
          { name: 'Akbarpur', lat: 26.4355, lng: 82.5414, type: 'hub' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ],
        geometry: routeCData?.geometry || null,
        color: '#f59e0b',
        isRecommended: false
      }
    ];
  }

  // Special scenario 2: Prayagraj ↔ New Delhi
  if ((origKey === 'prayagraj' || origKey === 'allahabad') && (destKey === 'new delhi' || destKey === 'delhi')) {
    const [routeAData, routeBData, routeCData] = await Promise.all([
      getDrivingRouteMultiStop([
        { lat: 25.4358, lng: 81.8463 }, // Prayagraj
        { lat: 26.4499, lng: 80.3319 }, // Kanpur
        { lat: 26.7855, lng: 79.0154 }, // Etawah
        { lat: 27.1767, lng: 78.0081 }, // Agra
        { lat: 28.4744, lng: 77.5040 }, // Greater Noida
        { lat: 28.6139, lng: 77.2090 }  // New Delhi
      ]),
      getDrivingRouteMultiStop([
        { lat: 25.4358, lng: 81.8463 }, // Prayagraj
        { lat: 25.9284, lng: 80.8130 }, // Fatehpur
        { lat: 26.4499, lng: 80.3319 }, // Kanpur
        { lat: 27.8974, lng: 78.0880 }, // Aligarh
        { lat: 28.4070, lng: 77.8498 }, // Bulandshahr
        { lat: 28.6139, lng: 77.2090 }  // New Delhi
      ]),
      getDrivingRouteMultiStop([
        { lat: 25.4358, lng: 81.8463 }, // Prayagraj
        { lat: 26.2236, lng: 81.2409 }, // Raebareli
        { lat: 26.8467, lng: 80.9462 }, // Lucknow
        { lat: 28.3670, lng: 79.4304 }, // Bareilly
        { lat: 28.8386, lng: 78.7733 }, // Moradabad
        { lat: 28.6139, lng: 77.2090 }  // New Delhi
      ])
    ]);

    return [
      {
        id: 'route_A',
        name: 'Route A: Yamuna & Agra-Lucknow Expressway Corridor',
        corridor: 'Prayagraj → Kanpur → Etawah → Agra → Greater Noida → New Delhi',
        distanceKm: routeAData?.distanceKm || 665,
        estimatedDurationHours: routeAData ? Number((routeAData.durationMinutes / 60).toFixed(1)) : 9.5,
        hubs: ['Prayagraj', 'Kanpur', 'Etawah', 'Agra', 'Greater Noida', 'New Delhi'],
        stops: [
          { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
          { name: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'hub' },
          { name: 'Etawah', lat: 26.7855, lng: 79.0154, type: 'hub' },
          { name: 'Agra', lat: 27.1767, lng: 78.0081, type: 'hub' },
          { name: 'Greater Noida', lat: 28.4744, lng: 77.5040, type: 'hub' },
          { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
        ],
        geometry: routeAData?.geometry || null,
        color: '#10b981',
        isRecommended: true
      },
      {
        id: 'route_B',
        name: 'Route B: Grand Trunk Road / NH19 Corridor',
        corridor: 'Prayagraj → Fatehpur → Kanpur → Aligarh → Bulandshahr → New Delhi',
        distanceKm: routeBData?.distanceKm || 685,
        estimatedDurationHours: routeBData ? Number((routeBData.durationMinutes / 60).toFixed(1)) : 10.5,
        hubs: ['Prayagraj', 'Fatehpur', 'Kanpur', 'Aligarh', 'Bulandshahr', 'New Delhi'],
        stops: [
          { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
          { name: 'Fatehpur', lat: 25.9284, lng: 80.8130, type: 'hub' },
          { name: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'hub' },
          { name: 'Aligarh', lat: 27.8974, lng: 78.0880, type: 'hub' },
          { name: 'Bulandshahr', lat: 28.4070, lng: 77.8498, type: 'hub' },
          { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
        ],
        geometry: routeBData?.geometry || null,
        color: '#3b82f6',
        isRecommended: false
      },
      {
        id: 'route_C',
        name: 'Route C: Central Awadh & Rohilkhand Bypass',
        corridor: 'Prayagraj → Raebareli → Lucknow → Bareilly → Moradabad → New Delhi',
        distanceKm: routeCData?.distanceKm || 730,
        estimatedDurationHours: routeCData ? Number((routeCData.durationMinutes / 60).toFixed(1)) : 11.5,
        hubs: ['Prayagraj', 'Raebareli', 'Lucknow', 'Bareilly', 'Moradabad', 'New Delhi'],
        stops: [
          { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
          { name: 'Raebareli', lat: 26.2236, lng: 81.2409, type: 'hub' },
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'hub' },
          { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
          { name: 'Moradabad', lat: 28.8386, lng: 78.7733, type: 'hub' },
          { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
        ],
        geometry: routeCData?.geometry || null,
        color: '#f59e0b',
        isRecommended: false
      }
    ];
  }

  // Special scenario 3: Gorakhpur ↔ Meerut
  if (origKey === 'gorakhpur' && destKey === 'meerut') {
    const [routeAData, routeBData, routeCData] = await Promise.all([
      getDrivingRouteMultiStop([
        { lat: 26.7606, lng: 83.3732 }, // Gorakhpur
        { lat: 26.7922, lng: 82.1998 }, // Ayodhya
        { lat: 26.8467, lng: 80.9462 }, // Lucknow
        { lat: 28.3670, lng: 79.4304 }, // Bareilly
        { lat: 28.8386, lng: 78.7733 }, // Moradabad
        { lat: 28.9845, lng: 77.7064 }  // Meerut
      ]),
      getDrivingRouteMultiStop([
        { lat: 26.7606, lng: 83.3732 }, // Gorakhpur
        { lat: 26.7963, lng: 82.7483 }, // Basti
        { lat: 27.1340, lng: 81.9619 }, // Gonda
        { lat: 27.5683, lng: 80.6829 }, // Sitapur
        { lat: 28.3670, lng: 79.4304 }, // Bareilly
        { lat: 28.9845, lng: 77.7064 }  // Meerut
      ]),
      getDrivingRouteMultiStop([
        { lat: 26.7606, lng: 83.3732 }, // Gorakhpur
        { lat: 26.7922, lng: 82.1998 }, // Ayodhya
        { lat: 26.9274, lng: 81.1834 }, // Barabanki
        { lat: 27.3956, lng: 80.1317 }, // Hardoi
        { lat: 28.7306, lng: 77.7759 }, // Hapur
        { lat: 28.9845, lng: 77.7064 }  // Meerut
      ])
    ]);

    return [
      {
        id: 'route_A',
        name: 'Route A: Express Corridor via Purvanchal & Bareilly',
        corridor: 'Gorakhpur → Ayodhya → Lucknow → Bareilly → Moradabad → Meerut',
        distanceKm: routeAData?.distanceKm || 690,
        estimatedDurationHours: routeAData ? Number((routeAData.durationMinutes / 60).toFixed(1)) : 10.2,
        hubs: ['Gorakhpur', 'Ayodhya', 'Lucknow', 'Bareilly', 'Moradabad', 'Meerut'],
        stops: [
          { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
          { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'hub' },
          { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
          { name: 'Moradabad', lat: 28.8386, lng: 78.7733, type: 'hub' },
          { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
        ],
        geometry: routeAData?.geometry || null,
        color: '#10b981',
        isRecommended: true
      },
      {
        id: 'route_B',
        name: 'Route B: Northern Highway NH27 / NH730 via Basti & Sitapur',
        corridor: 'Gorakhpur → Basti → Gonda → Sitapur → Bareilly → Meerut',
        distanceKm: routeBData?.distanceKm || 715,
        estimatedDurationHours: routeBData ? Number((routeBData.durationMinutes / 60).toFixed(1)) : 11.0,
        hubs: ['Gorakhpur', 'Basti', 'Gonda', 'Sitapur', 'Bareilly', 'Meerut'],
        stops: [
          { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
          { name: 'Basti', lat: 26.7963, lng: 82.7483, type: 'hub' },
          { name: 'Gonda', lat: 27.1340, lng: 81.9619, type: 'hub' },
          { name: 'Sitapur', lat: 27.5683, lng: 80.6829, type: 'hub' },
          { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
          { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
        ],
        geometry: routeBData?.geometry || null,
        color: '#3b82f6',
        isRecommended: false
      },
      {
        id: 'route_C',
        name: 'Route C: Central Awadh & Western NCR Link via Hardoi',
        corridor: 'Gorakhpur → Ayodhya → Barabanki → Hardoi → Hapur → Meerut',
        distanceKm: routeCData?.distanceKm || 745,
        estimatedDurationHours: routeCData ? Number((routeCData.durationMinutes / 60).toFixed(1)) : 11.8,
        hubs: ['Gorakhpur', 'Ayodhya', 'Barabanki', 'Hardoi', 'Hapur', 'Meerut'],
        stops: [
          { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
          { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
          { name: 'Barabanki', lat: 26.9274, lng: 81.1834, type: 'hub' },
          { name: 'Hardoi', lat: 27.3956, lng: 80.1317, type: 'hub' },
          { name: 'Hapur', lat: 28.7306, lng: 77.7759, type: 'hub' },
          { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
        ],
        geometry: routeCData?.geometry || null,
        color: '#f59e0b',
        isRecommended: false
      }
    ];
  }

  // 1. Fetch OSRM alternatives for any arbitrary city pair
  let osrmAlternatives = await getDrivingRouteAlternatives(
    origCoords.lat, origCoords.lng,
    destCoords.lat, destCoords.lng
  );

  // 2. If OSRM returns fewer than 3 alternatives, find intermediate waypoints from our registry
  if (!osrmAlternatives || osrmAlternatives.length < 3) {
    if (!osrmAlternatives) osrmAlternatives = [];

    // Find viable intermediate cities between origin & destination
    const totalDist = haversineDistance(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng);
    const dLat = destCoords.lat - origCoords.lat;
    const dLng = destCoords.lng - origCoords.lng;

    const candidateWaypoints = [];
    for (const [key, c] of Object.entries(CITY_COORDINATES)) {
      if (key === origKey || key === destKey) continue;
      const d1 = haversineDistance(origCoords.lat, origCoords.lng, c.lat, c.lng);
      const d2 = haversineDistance(c.lat, c.lng, destCoords.lat, destCoords.lng);
      const detour = (d1 + d2) - totalDist;

      // Reasonable detour window (between 8 km and max(40, totalDist * 0.35))
      if (detour >= 8 && detour <= Math.max(40, totalDist * 0.35)) {
        // Cross-product lateral offset sign (determines which side of the line it is on)
        const cross = (c.lat - origCoords.lat) * dLng - (c.lng - origCoords.lng) * dLat;
        candidateWaypoints.push({ city: c, detour, side: cross >= 0 ? 1 : -1 });
      }
    }

    // Pick top candidates from positive and negative lateral sides
    const posCandidates = candidateWaypoints.filter(w => w.side > 0).sort((a, b) => a.detour - b.detour);
    const negCandidates = candidateWaypoints.filter(w => w.side < 0).sort((a, b) => a.detour - b.detour);

    const waypointsToTry = [];
    if (posCandidates[0]) waypointsToTry.push(posCandidates[0].city);
    if (negCandidates[0]) waypointsToTry.push(negCandidates[0].city);
    if (waypointsToTry.length < 2 && candidateWaypoints.length > 1) {
      for (const w of candidateWaypoints) {
        if (!waypointsToTry.includes(w.city)) waypointsToTry.push(w.city);
        if (waypointsToTry.length >= 2) break;
      }
    }

    // Query multi-stop routes for additional alternatives
    for (const wp of waypointsToTry) {
      if (osrmAlternatives.length >= 3) break;
      const multi = await getDrivingRouteMultiStop([origCoords, wp, destCoords]);
      if (multi) {
        // Avoid duplicate distances
        const exists = osrmAlternatives.some(r => Math.abs(r.distanceKm - multi.distanceKm) < 5);
        if (!exists) {
          osrmAlternatives.push({
            distanceKm: multi.distanceKm,
            durationMinutes: multi.durationMinutes,
            estimatedDurationHours: Number((multi.durationMinutes / 60).toFixed(1)),
            geometry: multi.geometry
          });
        }
      }
    }
  }

  // 3. Fallback if OSRM is completely offline
  const directDistance = Math.max(50, haversineDistance(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng) * 1.25);
  while (osrmAlternatives.length < 3) {
    const factor = osrmAlternatives.length === 0 ? 1.0 : osrmAlternatives.length === 1 ? 1.12 : 1.22;
    const dist = Math.round(directDistance * factor);
    osrmAlternatives.push({
      distanceKm: dist,
      durationMinutes: Math.round((dist / 55) * 60),
      estimatedDurationHours: Number((dist / 55).toFixed(1)),
      geometry: [
        [origCoords.lat, origCoords.lng],
        [destCoords.lat, destCoords.lng]
      ]
    });
  }

  // 4. Sort routes by distance
  osrmAlternatives.sort((a, b) => a.distanceKm - b.distanceKm);

  // 5. Build the 3 Candidate Routes (Route A, Route B, Route C)
  const routeConfigs = [
    { id: 'route_A', prefix: 'Route A: Primary Express Corridor', color: '#10b981' },
    { id: 'route_B', prefix: 'Route B: Alternative Highway Bypass', color: '#3b82f6' },
    { id: 'route_C', prefix: 'Route C: Regional Transit Corridor', color: '#f59e0b' }
  ];

  return routeConfigs.map((cfg, idx) => {
    const routeData = osrmAlternatives[idx] || osrmAlternatives[0];
    const detectedHubs = detectHubsAlongGeometry(routeData.geometry, origCoords, destCoords);

    const hubsList = [origCoords.name, ...detectedHubs.map(h => h.name), destCoords.name];
    const stopsList = [
      { name: origCoords.name, lat: origCoords.lat, lng: origCoords.lng, type: 'source' },
      ...detectedHubs.map(h => ({ name: h.name, lat: h.lat, lng: h.lng, type: 'hub' })),
      { name: destCoords.name, lat: destCoords.lat, lng: destCoords.lng, type: 'destination' }
    ];

    const corridorString = hubsList.join(' → ');

    return {
      id: cfg.id,
      name: `${cfg.prefix} (${origCoords.name} → ${destCoords.name})`,
      corridor: corridorString,
      distanceKm: routeData.distanceKm,
      estimatedDurationHours: routeData.estimatedDurationHours || Number((routeData.durationMinutes / 60).toFixed(1)),
      hubs: hubsList,
      stops: stopsList,
      geometry: routeData.geometry,
      color: cfg.color
    };
  });
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
async function matchTripRoutes(trip, availableShipments) {
  const routes = trip.routes && trip.routes.length > 0
    ? trip.routes
    : await generateCandidateRoutes(trip.source, trip.destination);

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
 * Now using OSRM for real driving distance instead of just straight lines.
 */
async function scanEnRouteProximityConsignments(trip, currentCoords, proximityRadiusKm = 10, allShipments = []) {
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

    // Step 1 — Fast Haversine Filter
    // Filter out obvious non-matches before calling OSRM to save time
    const distTruckToPickupHav = haversineDistance(truckLat, truckLng, pCoords.lat, pCoords.lng);
    if (distTruckToPickupHav > proximityRadiusKm * 1.5) continue; // Give 50% buffer for road winding

    // Step 2 — Real Driving Distance (OSRM)
    let distTruckToPickup = await getDrivingDistanceKm(truckLat, truckLng, pCoords.lat, pCoords.lng);
    if (distTruckToPickup === null) {
      distTruckToPickup = distTruckToPickupHav * 1.2; // Fallback
    }

    // Minimum distance from pickup to route polyline
    const pickPolyRes = distancePointToPolyline(pCoords.lat, pCoords.lng, polylineStops);
    const distPickupToRoute = pickPolyRes.minDistanceKm;
    const pickupProgress = pickPolyRes.progress;

    // Proximity sensor rule: Truck MUST be physically within proximityRadiusKm (10 km) of pickup BY ROAD
    if (distTruckToPickup > proximityRadiusKm) continue;

    // Prevent recommending shipments that were already passed behind the truck
    if (pickupProgress < (truckProgress - 0.04)) continue;

    // Step 3 — Destination Compatibility
    const dropPolyRes = distancePointToPolyline(dCoords.lat, dCoords.lng, polylineStops);
    const distDropToRoute = dropPolyRes.minDistanceKm;
    const dropProgress = dropPolyRes.progress;

    // Destination must be ahead of pickup in forward direction of travel
    const isForwardDirection = dropProgress >= (pickupProgress - 0.04);
    if (!isForwardDirection) continue; // Opposite direction -> filter out

    // Destination must not exceed acceptable route corridor detour
    if (distDropToRoute > 45) continue; // Out of corridor -> filter out

    // Step 4 — Dynamic Detour Calculation
    const detourKm = Math.round((distPickupToRoute + distDropToRoute) * 10) / 10;
    const estimatedMinutesDelay = Math.round(detourKm * 1.8 + 6);

    // Step 5 — Dynamic Compatibility Score (0 to 100%)
    const effectiveProximity = Math.min(distTruckToPickup, distPickupToRoute);
    const proximityScore = Math.max(0, ((proximityRadiusKm - effectiveProximity) / proximityRadiusKm) * 30);
    const destScore = Math.max(0, ((45 - distDropToRoute) / 45) * 35);
    const capacityRatio = Math.min(1, shipment.weightKg / Math.max(1, remainingCapacity));
    const capacityScore = 15 + capacityRatio * 10;
    const detourPenalty = Math.min(10, detourKm * 0.35);

    const compatibilityScore = Math.min(99, Math.max(65, Math.round(proximityScore + destScore + capacityScore - detourPenalty)));

    // Try OSRM for fare calculation, fallback to haversine
    let shipmentRealDist = await getDrivingDistanceKm(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
    if (!shipmentRealDist) shipmentRealDist = Math.round(haversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng) * 1.2);
    
    const fare = shipment.fareEstimate?.totalFare || calculateFare(shipment.distanceKm || shipmentRealDist, shipment.weightKg).totalFare;

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


