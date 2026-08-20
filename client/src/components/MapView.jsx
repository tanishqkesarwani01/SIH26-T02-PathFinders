import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Truck, Box, CheckCircle } from 'lucide-react';

// Fix standard Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons
const createCustomIcon = (bgColor, iconChar, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
      ">
        ${iconChar}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const truckIcon = L.divIcon({
  className: 'truck-map-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
      border: 3px solid #ffffff;
      animation: pulse 2s infinite;
    ">
      🚚
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22]
});

// Helper component to auto-fit bounds
function FitBoundsToStops({ stops = [] }) {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
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
  height = '420px',
  center = [26.4, 81.8],
  zoom = 8
}) {
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (routes && routes.length > 0) {
      const found = routes.find(r => r.id === selectedRouteId) || routes[0];
      setSelectedRoute(found);
    }
  }, [routes, selectedRouteId]);

  // Aggregate all stops for boundary calculations
  const allStops = selectedRoute?.stops || (routes[0]?.stops) || [
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739 }
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
      
      {/* Route Selector Badges on top of map */}
      {routes.length > 0 && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl max-w-[90%]">
          {routes.map((route, idx) => {
            const isSelected = (selectedRoute?.id === route.id);
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
                <span className="text-[10px] opacity-75">({route.distanceKm} km)</span>
                {route.isRecommended && (
                  <span className="ml-1 bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded border border-amber-500/40">
                    ★ Best
                  </span>
                )}
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

        {/* Draw Polylines for all routes (selected highlighted, others dimmed) */}
        {routes.map((route) => {
          if (!route.stops || route.stops.length < 2) return null;
          const isSelected = selectedRoute?.id === route.id;
          const positions = route.stops.map(s => [s.lat, s.lng]);

          return (
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
                <div className="text-xs font-semibold text-slate-900">
                  {route.name} • {route.distanceKm} km ({route.estimatedDurationHours} hrs)
                </div>
              </Tooltip>
            </Polyline>
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
                    {isSource ? 'Trip Starting Point' : isDest ? 'Trip Destination Hub' : 'Corridor Waypoint & Pickup Node'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* If there are candidate / bundled shipments, render their pickup/drop markers */}
        {(selectedRoute?.bundledShipments || candidateShipments || []).map((shp, idx) => {
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

        {/* Live Truck Simulation Marker at the first stop or current point */}
        {selectedRoute?.stops?.[0] && (
          <Marker
            position={[selectedRoute.stops[0].lat + 0.05, selectedRoute.stops[0].lng + 0.08]}
            icon={truckIcon}
          >
            <Popup>
              <div className="p-1 text-slate-900 text-xs">
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  🚚 Live Truck In-Transit
                </p>
                <p className="text-slate-600">En-route via {selectedRoute.name}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-slate-950/95 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Origin / Active Path</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Parcel Pickup</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Parcel Dropoff</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Destination</span>
        </div>
        <div className="text-slate-300 font-medium">
          OpenStreetMap & Routing Engine
        </div>
      </div>
    </div>
  );
}
