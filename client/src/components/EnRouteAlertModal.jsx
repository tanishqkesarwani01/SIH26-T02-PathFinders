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
  AlertTriangle
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

  const currentLoad = trip?.currentLoadKg || 1800;
  const totalCapacity = trip?.totalCapacityKg || 5000;
  const cargoWeight = opportunity.weightKg || 500;
  const newLoad = currentLoad + cargoWeight;
  const currentUtil = Math.round((currentLoad / totalCapacity) * 100);
  const newUtil = Math.min(100, Math.round((newLoad / totalCapacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
        
        {/* Glowing Radar Background Effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> 10 KM Proximity Detection
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              ?? {opportunity.proximityDistanceKm || 4.2} km ahead
            </span>
          </div>
        </div>

        {/* Modal Title */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            En-Route Pickup Opportunity Available!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            A sender within your 10km highway proximity radius is requesting delivery along your active destination corridor.
          </p>
        </div>

        {/* Consignment Highlight Card */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3.5 mb-5">
          
          {/* Sender & Cargo Header */}
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{opportunity.senderName || 'En-Route Shipper'}</div>
                <div className="text-xs text-slate-400">{opportunity.packageType || 'Commercial Freight'} ? {opportunity.weightKg} kg</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-emerald-400">
                +?{opportunity.revenue || 920}
              </div>
              <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 justify-end font-semibold">
                <ShieldCheck className="w-3 h-3" /> Escrow Guaranteed
              </div>
            </div>
          </div>

          {/* Route Trajectory */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                Pickup (En-Route Stop)
              </span>
              <div className="font-bold text-white flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{opportunity.pickupLocation}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Detour: <span className="text-emerald-400 font-semibold">+{opportunity.detourKm || 3.5} km (~{opportunity.estimatedMinutesDelay || 12} mins)</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                Drop-off (Matches Corridor)
              </span>
              <div className="font-bold text-white flex items-center gap-1 truncate">
                <Navigation className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{opportunity.dropLocation}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Aligned with <span className="text-indigo-400 font-semibold">{trip?.destination || 'Final Destination'}</span>
              </div>
            </div>
          </div>

          {/* Space Availability & Utilization Meter */}
          <div className="pt-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" /> Space Impact:
              </span>
              <span className="text-white font-bold">
                {currentLoad} kg ? <span className="text-emerald-400">{newLoad} kg</span> / {totalCapacity} kg ({newUtil}%)
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${currentUtil}%` }} 
                title={`Current Load: ${currentLoad} kg`}
              />
              <div 
                className="bg-emerald-400 h-full animate-pulse transition-all duration-500" 
                style={{ width: `${Math.min(100 - currentUtil, (cargoWeight / totalCapacity) * 100)}%` }} 
                title={`New Cargo: +${cargoWeight} kg`}
              />
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Current: {trip?.availableCapacityKg} kg free</span>
              <span className="text-emerald-400 font-semibold">{totalCapacity - newLoad} kg remaining after pickup</span>
            </div>
          </div>
        </div>

        {/* Driver Choice Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold">Driver's Choice:</span> You are under no obligation to take this en-route load. If you decline, your route and schedule continue without any penalty.
          </div>
        </div>

        {/* Decision Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDecline}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-slate-400" /> Decline / Leave Load
          </button>

          <button
            type="button"
            onClick={onAccept}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            {isLoading ? "Locking Space..." : "Accept & Add to Route"}
          </button>
        </div>

      </div>
    </div>
  );
}