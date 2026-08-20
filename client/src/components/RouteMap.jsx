import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCityByName } from '../data/cities';

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
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-amber-500/30 rounded-full animate-ping"></div>
          <div class="relative w-9 h-9 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-slate-900 text-base">
            🚚
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
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

  const polylinePositions = useMemo(() => {
    return routeWaypoints.map(wp => [wp.lat, wp.lng]);
  }, [routeWaypoints]);

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
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView bounds={bounds} />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Selected Trip Route Polyline */}
        {polylinePositions.length > 1 && (
          <>
            {/* Outer glow stroke */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#10b981', weight: 8, opacity: 0.35 }}
            />
            {/* Inner dashed highway line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#059669', weight: 4, opacity: 0.9, dashArray: '6, 8' }}
            />
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
        </div>
      )}

    </div>
  );
}
