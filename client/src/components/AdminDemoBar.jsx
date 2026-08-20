import React, { useState } from 'react';
import { Sparkles, Trash2, RefreshCw, Zap, CheckCircle, Database, TrendingUp, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDemoBar({
  onSeedDemo,
  onResetDb,
  stats = {},
  isLoading = false
}) {
  const [actionMsg, setActionMsg] = useState('');

  const handleSeed = async () => {
    try {
      await onSeedDemo();
      setActionMsg('Lucknow → Varanasi SIH Scenario Loaded!');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.2 }
      });
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset database to 100% empty state (all trips, shipments, and users cleared)?')) {
      try {
        await onResetDb();
        setActionMsg('Database Reset: 0 items (Clean Initial State)');
        setTimeout(() => setActionMsg(''), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Left: Quick Stats / Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">SIH 2026 Engine</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span>Trips: <strong className="text-white">{stats.totalTrips || 0}</strong></span>
          <span>•</span>
          <span>Shipments: <strong className="text-white">{stats.totalShipments || 0}</strong></span>
          <span>•</span>
          <span>Matched Cargo: <strong className="text-emerald-400">{stats.totalWeightMovedKg || 0} kg</strong></span>
        </div>

        {actionMsg && (
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 flex items-center gap-1 animate-fadeIn">
            <CheckCircle className="w-3 h-3" />
            {actionMsg}
          </span>
        )}
      </div>

      {/* Right: Demo Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSeed}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 disabled:opacity-50 text-xs"
          title="Preload Lucknow to Varanasi trip with 3 route options and candidate shipments"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Load SIH Demo (Lucknow → Varanasi)</span>
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/60 text-slate-300 font-medium flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50 text-xs"
          title="Reset database to 100% empty state"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset to Empty</span>
        </button>
      </div>

    </div>
  );
}
