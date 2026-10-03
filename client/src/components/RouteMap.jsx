import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCityByName } from '../data/cities';

// OSRM public API for driving route geometry (free, no API key)
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Fetch real driving route polyline from OSRM for a set of waypoints.
 */
async function fetchOSRMRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return null;
  try {
    const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return {
      geometry,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMinutes: Math.round(route.duration / 60)
    };
  } catch (err) {
    console.warn('OSRM route fetch failed:', err.message);
    return null;
  }
}

// Helper to fit map bounds to current route coordinates
function ChangeView({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {
        // ignore bounds calculation errors
      }
    }
  }, [bounds, map]);
  return null;
}

// Custom DivIcons for beautiful modern pins
const createCustomIcon = (type, label = '') => {
  let bg = '#10b981'; // emerald
  let iconHtml = '📍';

  if (type === 'origin') {
    bg = '#10b981';
    iconHtml = '🟢';
  } else if (type === 'destination') {
    bg = '#ef4444';
    iconHtml = '🏁';
  } else if (type === 'waypoint') {
    bg = '#3b82f6';
    iconHtml = '🔹';
  } else if (type === 'truck') {
    return L.divIcon({
      className: 'custom-truck-marker',
      html: `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div class="beacon-pulse-ring"></div>
          <div style="
            background: linear-gradient(135deg, #10b981, #0d9488);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.75), 0 4px 10px rgba(0,0,0,0.6);
            border: 2px solid #ffffff;
            position: relative;
            z-index: 2;
          ">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#04120e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="flex items-center space-x-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-slate-700 shadow-xl backdrop-blur">
        <span>${iconHtml}</span>
        <span class="truncate max-w-[80px]">${label}</span>
      </div>
    `,
    iconSize: [100, 24],
    iconAnchor: [50, 12],
    popupAnchor: [0, -12]
  });
};

export default function RouteMap({ trip, activeCorridors = [], height = '400px' }) {
  const [osrmGeometry, setOsrmGeometry] = useState(null);
  const [osrmInfo, setOsrmInfo] = useState(null);
  const fetchedRef = useRef(false);

  // Extract route coordinates for the selected trip
  const routeWaypoints = useMemo(() => {
    if (trip && trip.waypoints) {
      return trip.waypoints.map((wp, idx) => {
        const cityData = getCityByName(wp.name);
        return {
          name: wp.name,
          eta: wp.eta,
          completed: wp.completed,
          lat: cityData?.lat || (28.6139 - idx * 1.5),
          lng: cityData?.lng || (77.2090 - idx * 0.8),
          type: idx === 0 ? 'origin' : idx === trip.waypoints.length - 1 ? 'destination' : 'waypoint'
        };
      });
    }
    return [];
  }, [trip]);

  // Reset OSRM geometry when trip changes
  useEffect(() => {
    setOsrmGeometry(null);
    setOsrmInfo(null);
    fetchedRef.current = false;
  }, [trip?.id, trip?.origin, trip?.destination]);

  // Fetch OSRM road-following geometry
  useEffect(() => {
    if (fetchedRef.current || routeWaypoints.length < 2) return;
    fetchedRef.current = true;

    const waypointsForOSRM = routeWaypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
    fetchOSRMRoute(waypointsForOSRM).then(result => {
      if (result) {
        setOsrmGeometry(result.geometry);
        setOsrmInfo({ distanceKm: result.distanceKm, durationMinutes: result.durationMinutes });
      }
    });
  }, [routeWaypoints]);

  // Use OSRM geometry if available, otherwise fall back to straight lines
  const polylinePositions = useMemo(() => {
    if (osrmGeometry) return osrmGeometry;
    return routeWaypoints.map(wp => [wp.lat, wp.lng]);
  }, [routeWaypoints, osrmGeometry]);

  const bounds = useMemo(() => {
    if (polylinePositions.length > 0) {
      return polylinePositions;
    }
    return [
      [28.6139, 77.2090], // Delhi
      [19.0760, 72.8777]  // Mumbai
    ];
  }, [polylinePositions]);

  // Determine current truck position along the route
  const truckPosition = useMemo(() => {
    if (routeWaypoints.length === 0) return null;
    const currentIdx = trip?.currentWaypointIndex || 0;
    const currentWp = routeWaypoints[currentIdx];
    return currentWp ? [currentWp.lat, currentWp.lng] : null;
  }, [routeWaypoints, trip]);

  const defaultCenter = [22.5937, 78.9629]; // Center of India

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950" style={{ height }}>
      
      {/* Top Map Banner */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-semibold text-white">
          {trip ? `${trip.origin} ➔ ${trip.destination}` : 'Live Highway Logistics Corridors'}
        </span>
        {trip && (
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            {trip.waypoints.length} Waypoints
          </span>
        )}
        {osrmInfo && (
          <span className="text-[10px] bg-emerald-800/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600/40 font-mono">
            🛣️ {osrmInfo.distanceKm} km • {Math.floor(osrmInfo.durationMinutes / 60)}h {osrmInfo.durationMinutes % 60}m
          </span>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView bounds={bounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected Trip Route Polyline — OSRM road geometry or straight line */}
        {polylinePositions.length > 1 && (
          <>
            {/* Outer glow stroke */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#10b981', weight: 8, opacity: 0.35 }}
            />
            {/* Inner road line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#059669',
                weight: 4,
                opacity: 0.9,
                dashArray: osrmGeometry ? null : '6, 8'
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-semibold text-slate-900">
                  {trip?.origin} → {trip?.destination}
                  {osrmInfo && ` • ${osrmInfo.distanceKm} km (Real Road)`}
                </div>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* Waypoint Markers */}
        {routeWaypoints.map((wp, i) => (
          <Marker
            key={`${wp.name}-${i}`}
            position={[wp.lat, wp.lng]}
            icon={createCustomIcon(wp.type, wp.name)}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900 text-xs">
                <p className="font-bold text-sm text-slate-900">{wp.name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">ETA: {wp.eta || 'En-route stop'}</p>
                <p className="text-[10px] mt-1 font-semibold text-emerald-700">
                  {wp.completed ? '✓ Passed Waypoint' : '⏳ Upcoming Corridor Stop'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Truck Marker */}
        {truckPosition && (
          <Marker position={truckPosition} icon={createCustomIcon('truck')}>
            <Popup>
              <div className="p-2 text-slate-900 text-xs">
                <p className="font-bold text-sm flex items-center space-x-1">
                  <span>🚚</span>
                  <span>{trip?.truckModel}</span>
                </p>
                <p className="text-[11px] text-slate-600">Driver: {trip?.driverName}</p>
                <p className="text-[11px] text-slate-600">Reg: {trip?.vehicleNumber}</p>
                <div className="mt-1.5 pt-1 border-t border-slate-200 flex justify-between text-[10px] font-semibold text-emerald-700">
                  <span>Space: {trip?.availableWeightKg}kg free</span>
                  <span>{trip?.availableVolumeM3}m³ free</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

      </MapContainer>

      {/* Bottom Info Pill */}
      {trip && (
        <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-3 text-[11px]">
          <span className="text-slate-400">Driver: <strong className="text-white">{trip.driverName}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">{trip.availableWeightKg} kg available</span>
          {osrmGeometry && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-500 font-mono text-[10px]">🛣️ OSRM Road Route</span>
            </>
          )}
        </div>
      )}

    </div>
  );
}
