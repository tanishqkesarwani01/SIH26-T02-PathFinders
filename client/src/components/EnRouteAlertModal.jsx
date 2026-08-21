import React from "react";
import { 
  Radio, 
  MapPin, 
  Package, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Navigation, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Zap,
  Gauge
} from "lucide-react";

export default function EnRouteAlertModal({
  isOpen,
  opportunity,
  trip,
  onAccept,
  onDecline,
  isLoading
}) {
  if (!isOpen || !opportunity) return null;

  const currentAvailable = trip?.availableCapacityKg !== undefined ? trip.availableCapacityKg : 2780;
  const totalCapacity = trip?.totalCapacityKg || 5000;
  const currentLoad = totalCapacity - currentAvailable;
  const cargoWeight = opportunity.weightKg || 450;
  const afterAvailable = Math.max(0, currentAvailable - cargoWeight);
  const afterLoad = currentLoad + cargoWeight;

  const currentUtil = Math.round((currentLoad / totalCapacity) * 100);
  const newUtil = Math.min(100, Math.round((afterLoad / totalCapacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
        
        {/* Radar Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge & Radar Active Indicator */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> 10 km Corridor Proximity Alert
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              {opportunity.compatibilityScore || 92}% Route Compatible
            </span>
          </div>
        </div>

        {/* Modal Title */}
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            🚚 En-Route Cargo Opportunity
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            A compatible shipment has been detected along your forward highway corridor within 10 km.
          </p>
        </div>

        {/* Consignment Highlight Card */}
        <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-3.5 mb-5 shadow-inner">
          
          {/* Header Specs */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{opportunity.shipmentId || 'SHIPMENT'}</span>
                  <span className="text-xs font-normal text-slate-400">• {opportunity.senderName || 'Consignor'}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Weight: <strong className="text-white">{opportunity.weightKg} kg</strong> • {opportunity.packageType || 'General Cargo'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-emerald-400">
                +₹{opportunity.revenue}
              </div>
              <div className="text-[10px] text-emerald-400/90 flex items-center gap-1 justify-end font-semibold">
                <ShieldCheck className="w-3 h-3" /> Extra Earning
              </div>
            </div>
          </div>

          {/* Dynamic Pickup & Drop Nodes */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                📍 Pickup Location
              </span>
              <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                <span className="text-emerald-400">●</span> {opportunity.pickupLocation}
              </div>
              <div className="text-xs text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Distance: {opportunity.proximityDistanceKm} km from truck
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                🏁 Drop-off Destination
              </span>
              <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                <span className="text-indigo-400">●</span> {opportunity.dropLocation}
              </div>
              <div className="text-xs text-slate-400 mt-1.5">
                Extra Distance: <strong className="text-slate-200">+{opportunity.detourKm} km</strong>
              </div>
            </div>
          </div>

          {/* Space Availability & Utilization Meter */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Available Space: <span className="text-white font-bold">{currentAvailable.toLocaleString()} kg</span>
                <ArrowRight className="w-3 h-3 text-slate-500 inline" />
                <span className="text-emerald-400 font-bold">{afterAvailable.toLocaleString()} kg</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {newUtil}% Truck Utilized
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${currentUtil}%` }} 
                title={`Current Loaded: ${currentLoad} kg`}
              />
              <div 
                className="bg-emerald-400 h-full animate-pulse transition-all duration-500" 
                style={{ width: `${Math.min(100 - currentUtil, (cargoWeight / totalCapacity) * 100)}%` }} 
                title={`New Cargo: +${cargoWeight} kg`}
              />
            </div>
            
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Current Load: {currentLoad.toLocaleString()} kg</span>
              <span className="text-emerald-400 font-semibold">Sufficient Space for {cargoWeight} kg Cargo</span>
            </div>
          </div>
        </div>

        {/* Driver Option Notice */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold">Driver Option:</span> You can take this en-route load if convenient, or dismiss it freely without impacting your schedule or rating.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDecline}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-slate-400" /> Dismiss
          </button>

          <button
            type="button"
            onClick={onAccept}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            {isLoading ? "Updating Space..." : "Accept Cargo"}
          </button>
        </div>

      </div>
    </div>
  );
}
