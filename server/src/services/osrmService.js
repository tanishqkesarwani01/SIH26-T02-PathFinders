/**
 * OSRM (Open Source Routing Machine) & Nominatim Service
 * Provides real driving distance, duration, and route geometry
 * using the free public OSRM API and OpenStreetMap Nominatim geocoder.
 *
 * OSRM API:  https://router.project-osrm.org
 * Nominatim: https://nominatim.openstreetmap.org
 *
 * Both are 100% free, no API key required.
 * Rate limits: ~1 req/sec for Nominatim, generous for OSRM demo server.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Simple in-memory cache to avoid redundant API calls
const routeCache = new Map();
const geocodeCache = new Map();

/**
 * Fetch with timeout and retry support
 */
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'LoadLink-SIH26/1.0 (logistics-hackathon)' }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Get driving route between two coordinates using OSRM.
 * Returns: { distanceKm, durationMinutes, geometry (array of [lat, lng]) }
 *
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {number} toLat
 * @param {number} toLng
 * @returns {Promise<{distanceKm: number, durationMinutes: number, geometry: Array<[number, number]>}>}
 */
async function getDrivingRoute(fromLat, fromLng, toLat, toLng) {
  const cacheKey = `${fromLat.toFixed(4)},${fromLng.toFixed(4)}-${toLat.toFixed(4)},${toLng.toFixed(4)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    // OSRM uses lng,lat order (not lat,lng)
    const url = `${OSRM_BASE_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=false`;
    const data = await fetchWithTimeout(url);

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM returned no routes');
    }

    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // meters -> km
    const durationMinutes = Math.round(route.duration / 60); // seconds -> minutes

    // GeoJSON coordinates are [lng, lat], convert to [lat, lng] for Leaflet
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const result = { distanceKm, durationMinutes, geometry };
    routeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`OSRM route fetch failed (${cacheKey}):`, err.message);
    // Fallback: return null so caller can fall back to haversine
    return null;
  }
}

/**
 * Get driving route through multiple waypoints using OSRM.
 * Returns: { distanceKm, durationMinutes, geometry (array of [lat, lng]) }
 *
 * @param {Array<{lat: number, lng: number}>} waypoints - Array of coordinate objects
 * @returns {Promise<{distanceKm: number, durationMinutes: number, geometry: Array<[number, number]>}>}
 */
async function getDrivingRouteMultiStop(waypoints) {
  if (!waypoints || waypoints.length < 2) return null;

  const cacheKey = waypoints.map(w => `${w.lat.toFixed(4)},${w.lng.toFixed(4)}`).join(';');

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    // OSRM uses lng,lat order
    const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    const data = await fetchWithTimeout(url);

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM returned no routes');
    }

    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const result = { distanceKm, durationMinutes, geometry };
    routeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`OSRM multi-stop route fetch failed:`, err.message);
    return null;
  }
}

/**
 * Get driving distance between two points (just the km value).
 * Falls back to haversine * 1.3 road factor if OSRM is unavailable.
 *
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {number} toLat
 * @param {number} toLng
 * @returns {Promise<number>} Distance in km
 */
async function getDrivingDistanceKm(fromLat, fromLng, toLat, toLng) {
  const route = await getDrivingRoute(fromLat, fromLng, toLat, toLng);
  if (route) return route.distanceKm;

  // Fallback: haversine with 1.3x road curvature factor
  return Math.round(haversineFallback(fromLat, fromLng, toLat, toLng) * 1.3 * 10) / 10;
}

/**
 * Geocode an address/city name to coordinates using Nominatim.
 * Prioritizes results within India.
 *
 * @param {string} query - Address or city name (e.g., "Sultanpur, UP")
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 */
async function geocodeAddress(query) {
  if (!query || query.trim().length === 0) return null;

  const normalizedQuery = query.trim().toLowerCase();
  if (geocodeCache.has(normalizedQuery)) {
    return geocodeCache.get(normalizedQuery);
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodedQuery}&format=json&limit=1&countrycodes=in&addressdetails=1`;
    const data = await fetchWithTimeout(url);

    if (!data || data.length === 0) return null;

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };

    geocodeCache.set(normalizedQuery, result);
    return result;
  } catch (err) {
    console.warn(`Nominatim geocode failed for "${query}":`, err.message);
    return null;
  }
}

/**
 * Reverse geocode coordinates to an address using Nominatim.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{displayName: string, city: string, state: string} | null>}
 */
async function reverseGeocode(lat, lng) {
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const data = await fetchWithTimeout(url);

    if (!data || data.error) return null;

    return {
      displayName: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || ''
    };
  } catch (err) {
    console.warn(`Nominatim reverse geocode failed:`, err.message);
    return null;
  }
}

/**
 * Compute the OSRM Table (distance matrix) between multiple points.
 * Useful for batch proximity checks.
 *
 * @param {Array<{lat: number, lng: number}>} sources
 * @param {Array<{lat: number, lng: number}>} destinations
 * @returns {Promise<{distances: number[][], durations: number[][]}>}  distances in km, durations in minutes
 */
async function getDistanceMatrix(sources, destinations) {
  try {
    const allCoords = [...sources, ...destinations];
    const coords = allCoords.map(c => `${c.lng},${c.lat}`).join(';');
    const srcIndices = sources.map((_, i) => i).join(';');
    const dstIndices = destinations.map((_, i) => i + sources.length).join(';');

    const url = `${OSRM_BASE_URL}/table/v1/driving/${coords}?sources=${srcIndices}&destinations=${dstIndices}&annotations=distance,duration`;
    const data = await fetchWithTimeout(url, 12000);

    if (data.code !== 'Ok') throw new Error('OSRM table request failed');

    // Convert distances from meters to km, durations from seconds to minutes
    const distances = data.distances.map(row => row.map(d => Math.round((d / 1000) * 10) / 10));
    const durations = data.durations.map(row => row.map(d => Math.round(d / 60)));

    return { distances, durations };
  } catch (err) {
    console.warn('OSRM distance matrix failed:', err.message);
    return null;
  }
}

/**
 * Simple haversine fallback (straight-line distance)
 */
function haversineFallback(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Clear caches (useful for long-running servers)
 */
function clearCaches() {
  routeCache.clear();
  geocodeCache.clear();
}

module.exports = {
  getDrivingRoute,
  getDrivingRouteMultiStop,
  getDrivingDistanceKm,
  geocodeAddress,
  reverseGeocode,
  getDistanceMatrix,
  haversineFallback,
  clearCaches
};
