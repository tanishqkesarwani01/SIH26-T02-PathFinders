import React, { useEffect } from 'react';
import { 
  BellRing, 
  MapPin, 
  Package, 
  DollarSign, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Radio, 
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';

// Web Audio API chime sound
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play pleasant dual-tone chime (D5 -> A5)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Audio playback blocked or not supported
  }
}

export default function EnRouteToast({
  opportunity,
  onAccept,
  onDismiss,
  isLoading
}) {
  if (!opportunity) return null;

  const locName = opportunity.pickupLocation?.split('(')[0]?.trim() || opportunity.pickupLocation || 'Nearby Corridor Hub';
  const dist = opportunity.proximityDistanceKm || 8.4;
  const cargoWeight = opportunity.weightKg || 450;
  const cargoType = opportunity.packageDescription || opportunity.packageType || 'General Freight';
  const earning = opportunity.revenue || 823;
  const pickup = opportunity.pickupLocation || 'Pickup Point';
  const drop = opportunity.dropLocation || 'Drop Destination';
  const score = opportunity.compatibilityScore || 92;

  useEffect(() => {
    playNotificationChime();
  }, [opportunity.shipmentId]);

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-slideInRight shadow-2xl">
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500 rounded-2xl p-4.5 sm:p-5 shadow-emerald-500/25 shadow-2xl relative overflow-hidden text-white">
        
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header with live radar indicator & dismiss button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>New Return Load Available</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
              {score}% Match
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Distance Header */}
        <div className="mb-2">
          <div className="text-sm font-extrabold text-white flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-300">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{locName}</span>
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              ⚡ {dist} km ahead
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Truck is within 10 km of <strong className="text-white">{locName}</strong> ({dist} km away).
          </p>
        </div>

        {/* Cargo Specs Box */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" /> Compatible Cargo:
            </span>
            <span className="font-bold text-white truncate max-w-[200px]">
              {cargoWeight} kg • {cargoType}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pickup:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[220px]">
              {pickup}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Drop:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[220px]">
              {drop}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Estimated Additional Earning:
            </span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              +₹{earning}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={onAccept}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Accepting...' : 'Accept Cargo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
