import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Phone
} from 'lucide-react';
import SpaceVisualizer from './SpaceVisualizer';

export default function TripCard({ trip, onBookNow, onSelectForMap }) {
  const [showDetails, setShowDetails] = useState(false);

  const availableWeightPercent = Math.round((trip.availableWeightKg / trip.totalWeightCapacityKg) * 100);

  return (
    <div className="bg-slate-850 rounded-2xl border border-slate-750 p-5 shadow-xl hover:border-emerald-500/50 transition-all duration-300 group">
      
      {/* Top Header: Route & Driver Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        
        {/* Route Details */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-extrabold text-white">{trip.origin}</span>
            <div className="flex items-center space-x-1 text-emerald-400">
              <span className="h-0.5 w-4 bg-emerald-500"></span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400">{trip.destination}</span>
          </div>

          {/* Intermediate Stops pill line */}
          <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
            <span>Via Corridor:</span>
            {trip.waypoints.map((wp, idx) => (
              <span 
                key={idx} 
                className={`px-1.5 py-0.2 rounded text-[10px] ${
                  idx === 0 || idx === trip.waypoints.length - 1
                    ? 'font-bold text-slate-300'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}
              >
                {wp.name || wp}
                {idx < trip.waypoints.length - 1 ? ' ➔' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Driver Profile */}
        <div className="flex items-center space-x-3 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
          <img
            src={trip.driverAvatar}
            alt={trip.driverName}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">{trip.driverName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Carrier" />
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span className="flex items-center text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                {trip.driverRating}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">{trip.vehicleNumber}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Body: Capacity Gauges & Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
        
        {/* Available Weight */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] font-medium uppercase">Free Weight</span>
          <span className="text-base font-extrabold text-emerald-400">{trip.availableWeightKg} kg</span>
          <span className="text-[10px] text-slate-500 block">of {trip.totalWeightCapacityKg} kg total</span>
        </div>

        {/* Available Volume */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] font-medium uppercase">Free Volume</span>
          <span className="text-base font-extrabold text-teal-400">{trip.availableVolumeM3} m³</span>
          <span className="text-[10px] text-slate-500 block">of {trip.totalVolumeM3} m³ total</span>
        </div>

        {/* Departure Time */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] font-medium uppercase">Departure</span>
          <span className="text-xs font-bold text-white flex items-center mt-1">
            <Clock className="w-3 h-3 text-amber-400 mr-1" />
            {trip.departureTime || '18:00'} ({trip.departureDate || 'Today'})
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            {trip.status === 'ACTIVE_ON_ROAD' ? '🟢 En-Route Now' : '🟡 Scheduled'}
          </span>
        </div>

        {/* Truck Type & Rate */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] font-medium uppercase">Vehicle Type</span>
          <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">{trip.truckModel}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">₹{trip.pricePerKg}/kg est.</span>
        </div>

      </div>

      {/* Features Tags */}
      {trip.features && (
        <div className="flex items-center flex-wrap gap-1.5 pb-4">
          {trip.features.map((feat, idx) => (
            <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 flex items-center space-x-1">
              <Check className="w-2.5 h-2.5 text-emerald-400" />
              <span>{feat}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expandable Visualizer */}
      {showDetails && (
        <div className="pt-2 pb-4 border-t border-slate-800">
          <SpaceVisualizer
            totalWeightKg={trip.totalWeightCapacityKg}
            availableWeightKg={trip.availableWeightKg}
            totalVolumeM3={trip.totalVolumeM3}
            availableVolumeM3={trip.availableVolumeM3}
            truckType={trip.truckType}
          />
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        
        {/* Toggle Space Deck / Map view */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showDetails ? 'Hide Container Deck' : 'Inspect Truck Deck'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {onSelectForMap && (
            <button
              onClick={() => onSelectForMap(trip)}
              className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition hidden sm:flex"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View On Map</span>
            </button>
          )}
        </div>

        {/* Instant Book Button */}
        <button
          onClick={() => onBookNow(trip)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Book Space Instantly</span>
        </button>

      </div>

    </div>
  );
}
