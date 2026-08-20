import React from 'react';
import { Box, Gauge, Layers, Info, CheckCircle2 } from 'lucide-react';

export default function SpaceVisualizer({ 
  totalWeightKg = 5000, 
  availableWeightKg = 2800, 
  totalVolumeM3 = 45, 
  availableVolumeM3 = 24,
  truckType = 'Closed Container'
}) {
  const usedWeight = Math.max(0, totalWeightKg - availableWeightKg);
  const usedVolume = Math.max(0, Number((totalVolumeM3 - availableVolumeM3).toFixed(1)));
  
  const weightPercent = Math.min(100, Math.round((usedWeight / totalWeightKg) * 100));
  const volumePercent = Math.min(100, Math.round((usedVolume / totalVolumeM3) * 100));
  const availablePercent = 100 - Math.max(weightPercent, volumePercent);

  // Generate 12 container slot blocks for visual loading grid
  const totalSlots = 12;
  const occupiedSlots = Math.round((weightPercent / 100) * totalSlots);

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Truck Capacity Telemetry ({truckType})
          </h4>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {availablePercent}% Space Available
        </span>
      </div>

      {/* Progress Bars (Weight & Volume) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        
        {/* Weight Bar */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Weight Load:</span>
            <span className="text-white font-bold">{usedWeight} / {totalWeightKg} kg ({weightPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                weightPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${weightPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
            ✓ {availableWeightKg} kg available to book
          </p>
        </div>

        {/* Volume Bar */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Volumetric Load:</span>
            <span className="text-white font-bold">{usedVolume} / {totalVolumeM3} m³ ({volumePercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-teal-400 font-semibold mt-1">
            ✓ {availableVolumeM3} m³ open volume
          </p>
        </div>

      </div>

      {/* 2D/3D Container Bay Layout Visualizer */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Truck Cargo Deck (Top-down section):</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-600 inline-block"></span>
              <span>Loaded Goods</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400 border-dashed inline-block"></span>
              <span className="text-emerald-400 font-medium">Bookable Open Space</span>
            </span>
          </div>
        </div>

        {/* Truck Bay Grid */}
        <div className="relative border-2 border-slate-700 rounded-lg p-2 bg-slate-900/50">
          {/* Driver Cabin Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-300 text-[9px] uppercase px-3 py-0.5 rounded font-mono">
            ▲ Driver Cabin (Front)
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-2">
            {Array.from({ length: totalSlots }).map((_, index) => {
              const isOccupied = index < occupiedSlots;
              return (
                <div
                  key={index}
                  className={`h-12 rounded flex flex-col items-center justify-center text-[10px] transition-all ${
                    isOccupied
                      ? 'bg-slate-800 border border-slate-700 text-slate-400'
                      : 'bg-emerald-950/40 border border-dashed border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                  }`}
                >
                  {isOccupied ? (
                    <>
                      <Box className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                      <span className="text-[8px] font-mono">LOADED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                      <span className="text-[8px] font-mono text-emerald-300 font-bold">FREE</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rear Tailgate Indicator */}
          <div className="text-center mt-2 text-[9px] uppercase tracking-wider text-slate-500 font-mono">
            ▼ Rear Loading Tailgate
          </div>
        </div>

      </div>

    </div>
  );
}
