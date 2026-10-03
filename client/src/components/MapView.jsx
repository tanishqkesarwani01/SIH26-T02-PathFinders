import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Truck, Box, CheckCircle, Radio } from 'lucide-react';

// Fix standard Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// OSRM public API for driving route geometry (free, no API key)
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Fetch real driving route polyline from OSRM for a set of waypoints.
 * Returns array of [lat, lng] pairs that follow actual roads.
 */
async function fetchOSRMRoute(stops) {
  if (!stops || stops.length < 2) return null;
  try {
    // OSRM uses lng,lat order
    const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    // GeoJSON [lng, lat] -> Leaflet [lat, lng]
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return {
      geometry,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMinutes: Math.round(route.duration / 60)
    };
  } catch (err) {
    console.warn('OSRM route fetch failed, using straight line:', err.message);
    return null;
  }
}

// Custom SVG Icons
const createCustomIcon = (bgColor, iconChar, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 12px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
      ">
        ${iconChar}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });
};

const getTruckIcon = (isPaused = false) => {
  return L.divIcon({
    className: 'truck-map-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div class="${isPaused ? 'beacon-pulse-ring-amber' : 'beacon-pulse-ring'}"></div>
        <div style="
          background: ${isPaused ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #0d9488)'};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 22px ${isPaused ? 'rgba(245, 158, 11, 0.85)' : 'rgba(16, 185, 129, 0.75)'}, 0 4px 12px rgba(0,0,0,0.6);
          border: 2px solid #ffffff;
          position: relative;
          z-index: 2;
        ">
          ${isPaused ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f172a" stroke="#0f172a" stroke-width="2">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#04120e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          `}
        </div>
        ${isPaused ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -6px;
            background: #ef4444;
            color: #ffffff;
            font-size: 8px;
            font-weight: 900;
            padding: 1px 4px;
            border-radius: 4px;
            border: 1px solid #ffffff;
            line-height: 1;
            z-index: 3;
            letter-spacing: 0.5px;
          ">PAUSED</div>
        ` : ''}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Helper component to auto-fit bounds
function FitBoundsToStops({ stops = [] }) {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0) {
      const validStops = stops.filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number');
      if (validStops.length > 0) {
        const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [stops, map]);
  return null;
}

export default function MapView({
  routes = [],
  selectedRouteId = null,
  onSelectRoute = null,
  activeShipment = null,
  candidateShipments = [],
  liveTruckLocation = null,
  enRouteOpportunity = null,
  height = '420px',
  center = [26.4, 81.8],
  zoom = 8
}) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  // Store OSRM road-following geometry per route (keyed by route id)
  const [osrmGeometries, setOsrmGeometries] = useState({});
  const [osrmRouteInfo, setOsrmRouteInfo] = useState({});
  const fetchedRoutesRef = useRef(new Set());

  // Dynamic route calculation for single active shipment when trip routes are empty
  const getEffectiveRoutes = () => {
    if (routes && routes.length > 0) {
      return routes;
    }
    const shp = activeShipment || candidateShipments?.[0];
    if (shp && shp.pickupCoords && shp.dropCoords) {
      return [
        {
          id: 'route_shp_direct',
          name: `Route: ${shp.pickupLocation} → ${shp.dropLocation}`,
          corridor: `${shp.pickupLocation} → Highway Corridor → ${shp.dropLocation}`,
          distanceKm: shp.distanceKm || 80,
          estimatedDurationHours: ((shp.distanceKm || 80) / 50).toFixed(1),
          color: '#10b981',
          stops: [
            {
              name: shp.pickupLocation,
              lat: shp.pickupCoords.lat,
              lng: shp.pickupCoords.lng,
              type: 'source'
            },
            {
              name: shp.dropLocation,
              lat: shp.dropCoords.lat,
              lng: shp.dropCoords.lng,
              type: 'destination'
            }
          ]
        }
      ];
    }
    return [
      {
        id: 'route_default',
        name: 'Default Freight Corridor',
        corridor: 'Lucknow → Varanasi',
        distanceKm: 310,
        estimatedDurationHours: 6.0,
        color: '#10b981',
        stops: [
          { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
          { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
        ]
      }
    ];
  };

  const effectiveRoutes = getEffectiveRoutes();

  useEffect(() => {
    if (effectiveRoutes.length > 0) {
      const found = effectiveRoutes.find(r => r.id === selectedRouteId) || effectiveRoutes[0];
      setSelectedRoute(found);
    }
  }, [routes, selectedRouteId, activeShipment]);

  const getRouteKey = (route) => {
    if (!route) return '';
    const stops = route.stops || [];
    const first = stops[0]?.name || stops[0]?.lat || '';
    const last = stops[stops.length - 1]?.name || stops[stops.length - 1]?.lat || '';
    return `${route.id}_${first}_${last}_${stops.length}`;
  };

  const routesSignature = (effectiveRoutes || [])
    .map(r => `${r.id}:${r.stops?.[0]?.name}->${r.stops?.[r.stops.length - 1]?.name}`)
    .join('|');

  // Reset cached geometries whenever the set of route stops changes between trips
  useEffect(() => {
    setOsrmGeometries({});
    setOsrmRouteInfo({});
    fetchedRoutesRef.current = new Set();
  }, [routesSignature]);

  // Fetch OSRM road-following geometries for all routes if not already provided by backend
  useEffect(() => {
    effectiveRoutes.forEach(async (route) => {
      // If route already has full road geometry from backend, skip fetching
      if (route.geometry && Array.isArray(route.geometry) && route.geometry.length > 2) {
        return;
      }
      if (!route.stops || route.stops.length < 2) return;

      const routeKey = getRouteKey(route);
      if (fetchedRoutesRef.current.has(routeKey)) return;
      fetchedRoutesRef.current.add(routeKey);

      const osrmResult = await fetchOSRMRoute(route.stops);
      if (osrmResult) {
        setOsrmGeometries(prev => ({ ...prev, [routeKey]: osrmResult.geometry }));
        setOsrmRouteInfo(prev => ({
          ...prev,
          [routeKey]: {
            distanceKm: osrmResult.distanceKm,
            durationMinutes: osrmResult.durationMinutes
          }
        }));
      }
    });
  }, [effectiveRoutes, routesSignature]);

  // Aggregate all stops for boundary calculations
  const allStops = selectedRoute?.stops || effectiveRoutes[0]?.stops || [
    { name: 'Origin', lat: 26.8467, lng: 80.9462 },
    { name: 'Destination', lat: 25.3176, lng: 82.9739 }
  ];

  const truckPos = liveTruckLocation?.lat && liveTruckLocation?.lng
    ? [liveTruckLocation.lat, liveTruckLocation.lng]
    : selectedRoute?.stops?.[0]
    ? [selectedRoute.stops[0].lat, selectedRoute.stops[0].lng]
    : [26.8467, 80.9462];

  const isTruckPaused = Boolean(enRouteOpportunity);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
      
      {/* Route Selector Badges on top of map */}
      {effectiveRoutes.length > 1 && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl max-w-[90%]">
          {effectiveRoutes.map((route, idx) => {
            const isSelected = (selectedRoute?.id === route.id);
            const routeKey = getRouteKey(route);
            const osrmInfo = osrmRouteInfo[routeKey];
            const displayDistance = route.distanceKm || osrmInfo?.distanceKm;
            return (
              <button
                key={route.id || idx}
                onClick={() => {
                  setSelectedRoute(route);
                  if (onSelectRoute) onSelectRoute(route);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: route.color || '#10b981' }}
                />
                <span>{route.name?.split(':')[0] || `Route ${idx + 1}`}</span>
                <span className="text-[10px] opacity-75">
                  ({displayDistance ? `${displayDistance} km` : '...'})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsToStops stops={allStops} />

        {/* Draw Polylines for routes — uses OSRM road geometry when available */}
        {effectiveRoutes.map((route) => {
          if (!route.stops || route.stops.length < 2) return null;
          const isSelected = (selectedRoute?.id === route.id) || effectiveRoutes.length === 1;
          const routeKey = getRouteKey(route);

          // Use OSRM road-following geometry: prioritize route.geometry from backend, then fetched OSRM geometry, then stops
          const osrmGeo = (route.geometry && Array.isArray(route.geometry) && route.geometry.length > 2)
            ? route.geometry
            : osrmGeometries[routeKey];
          const positions = osrmGeo || route.stops.map(s => [s.lat, s.lng]);
          const osrmInfo = osrmRouteInfo[routeKey];
          const displayDistance = route.distanceKm || osrmInfo?.distanceKm;
          const displayDuration = route.estimatedDurationHours
            ? `${route.estimatedDurationHours} hrs`
            : (osrmInfo ? `${Math.floor(osrmInfo.durationMinutes / 60)}h ${osrmInfo.durationMinutes % 60}m` : '5 hrs');


          return (
            <React.Fragment key={`frag_line_${route.id}`}>
              {/* 10 km Corridor Buffer Ribbon */}
              {isSelected && (
                <Polyline
                  key={`corridor_ribbon_${route.id}`}
                  positions={positions}
                  pathOptions={{
                    color: '#10b981',
                    weight: 34,
                    opacity: 0.14,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}

              <Polyline
                key={`line_${route.id}`}
                positions={positions}
                pathOptions={{
                  color: isSelected ? (route.color || '#10b981') : '#64748b',
                  weight: isSelected ? 6 : 3,
                  opacity: isSelected ? 0.95 : 0.45,
                  dashArray: isSelected ? null : '6, 6'
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-semibold text-slate-100 font-mono">
                    {route.name} • {displayDistance} km ({displayDuration})
                    {osrmGeo ? ' • Road Curvature' : ''}
                  </div>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Render Stops of the Selected Route */}
        {selectedRoute?.stops?.map((stop, sIdx) => {
          const isSource = stop.type === 'source' || sIdx === 0;
          const isDest = stop.type === 'destination' || sIdx === selectedRoute.stops.length - 1;
          const color = isSource ? '#10b981' : isDest ? '#ef4444' : '#3b82f6';
          const symbol = isSource ? 'S' : isDest ? 'D' : `${sIdx}`;

          return (
            <Marker
              key={`stop_${stop.name}_${sIdx}`}
              position={[stop.lat, stop.lng]}
              icon={createCustomIcon(color, symbol, stop.name)}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs">
                  <p className="font-bold text-sm text-slate-900 mb-0.5">{stop.name}</p>
                  <p className="text-slate-600">
                    {isSource ? 'Origin Pickup Location' : isDest ? 'Destination Handover Hub' : 'Corridor Waypoint & Pickup Node'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* If candidate/bundled shipments exist, render them */}
        {(candidateShipments || []).map((shp, idx) => {
          if (!shp.pickupCoords || !shp.dropCoords) return null;
          return (
            <React.Fragment key={`shp_frag_${shp.id || idx}`}>
              <Marker
                position={[shp.pickupCoords.lat, shp.pickupCoords.lng]}
                icon={createCustomIcon('#f59e0b', '📦', 'Pickup')}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <p className="font-bold text-amber-700">📦 Pickup: {shp.pickupLocation}</p>
                    <p className="text-slate-700">{shp.packageDescription || shp.packageType}</p>
                    <p className="font-medium text-emerald-700">Weight: {shp.weightKg} kg • Fare: ₹{shp.fareEstimate?.totalFare || 'Est'}</p>
                  </div>
                </Popup>
              </Marker>
              
              <Marker
                position={[shp.dropCoords.lat, shp.dropCoords.lng]}
                icon={createCustomIcon('#8b5cf6', '🏁', 'Drop')}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <p className="font-bold text-purple-700">🏁 Dropoff: {shp.dropLocation}</p>
                    <p className="text-slate-700">Recipient handover node</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 10 km Proximity Corridor Zone around truck */}
        {truckPos && (
          <Circle
            center={truckPos}
            radius={10000}
            pathOptions={{
              color: isTruckPaused ? '#f59e0b' : '#10b981',
              fillColor: isTruckPaused ? '#f59e0b' : '#10b981',
              fillOpacity: isTruckPaused ? 0.22 : 0.12,
              weight: isTruckPaused ? 2.5 : 2,
              dashArray: isTruckPaused ? '4, 4' : '5, 5'
            }}
          >
            <Tooltip sticky>
              <div className="text-[11px] font-bold text-slate-100 font-mono">
                {isTruckPaused ? '⏸️ 10 km Detection Zone (Truck Paused for Decision)' : '10 km En-Route Autonomous Proximity Zone'}
              </div>
            </Tooltip>
          </Circle>
        )}

        {/* Live Truck Marker */}
        {truckPos && (
          <Marker
            position={truckPos}
            icon={getTruckIcon(isTruckPaused)}
          >
            <Popup>
              <div className="p-1.5 text-xs text-slate-100">
                <p className={`font-bold flex items-center gap-1.5 font-mono ${isTruckPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isTruckPaused ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
                  <span>{isTruckPaused ? 'Truck Stopped • Awaiting Decision' : 'Active Commercial Fleet'}</span>
                </p>
                <p className="text-slate-300 mt-1 font-mono text-[11px] leading-snug">
                  {liveTruckLocation?.statusText || 'Highway GPS Telemetry Synced'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 10km Radar Proximity Lock to upcoming cargo pickup when paused */}
        {isTruckPaused && enRouteOpportunity?.pickupCoords && truckPos && (
          <Polyline
            positions={[truckPos, [enRouteOpportunity.pickupCoords.lat, enRouteOpportunity.pickupCoords.lng]]}
            pathOptions={{
              color: '#f59e0b',
              weight: 3,
              dashArray: '6, 6',
              opacity: 0.95
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-bold text-amber-400 font-mono">
                ⚡ 10 km Proximity Lock: {enRouteOpportunity.pickupLocation}
              </div>
            </Tooltip>
          </Polyline>
        )}

      </MapContainer>

      {/* Map Legend Footer */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Origin / Active Path</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Parcel Pickup</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Parcel Dropoff</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Destination</span>
          </span>
        </div>
        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          OSRM + OpenStreetMap Routing Engine
        </div>
      </div>

    </div>
  );
}
