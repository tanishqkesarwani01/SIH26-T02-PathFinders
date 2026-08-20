// Major transit hubs and highway corridor waypoints with real geographic coordinates
export const CITIES = [
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090, hub: 'North Hub' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, hub: 'Western Corridor' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, hub: 'NH-48 Hub' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, hub: 'Gujarat Hub' },
  { id: 'vadodara', name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, hub: 'Industrial Corridor' },
  { id: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, hub: 'Textile & Diamond Hub' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, hub: 'West Coast Gateway' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, hub: 'Auto-Tech Hub' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, hub: 'South Hub' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, hub: 'Eastern Port Hub' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, hub: 'Central-South Hub' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, hub: 'Eastern Gateway' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, hub: 'Purvanchal Freight Hub' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, hub: 'UP Central Hub' },
  { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, hub: 'Yamuna Expressway Hub' },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lng: 76.7794, hub: 'North Agro Gateway' },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, hub: 'Zero Mile Central Hub' },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, hub: 'MP Commercial Hub' }
];

export const getCityByName = (name) => {
  if (!name) return null;
  const clean = name.toLowerCase().trim();
  return CITIES.find(c => c.name.toLowerCase().includes(clean) || c.id === clean);
};

// Calculate Haversine distance in km with practical road factor (1.25x detour coefficient)
export const calculateDistanceKm = (cityA, cityB) => {
  const c1 = typeof cityA === 'string' ? getCityByName(cityA) : cityA;
  const c2 = typeof cityB === 'string' ? getCityByName(cityB) : cityB;
  if (!c1 || !c2) return 350; // default fallback

  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;

  // Road factor detour adjustment (Indian highway network average: 1.22 - 1.28x)
  return Math.round(directDistance * 1.25);
};
