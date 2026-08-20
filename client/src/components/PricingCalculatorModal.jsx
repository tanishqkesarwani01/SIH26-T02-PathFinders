import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  MapPin, 
  Weight, 
  Box, 
  Sparkles, 
  TrendingDown, 
  Leaf, 
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { CITIES, calculateDistanceKm } from '../data/cities';
import { CARGO_CATEGORIES, calculateFreightQuote } from '../utils/pricingEngine';

export default function PricingCalculatorModal({ isOpen, onClose, initialData = {}, onSelectRoute }) {
  const [origin, setOrigin] = useState(initialData.origin || 'Delhi NCR');
  const [destination, setDestination] = useState(initialData.destination || 'Mumbai');
  const [weightKg, setWeightKg] = useState(initialData.weightKg || 80);
  const [volumeM3, setVolumeM3] = useState(initialData.volumeM3 || 0.6);
  const [category, setCategory] = useState('general');
  const [isExpress, setIsExpress] = useState(false);

  const quote = useMemo(() => {
    if (!origin || !destination) return null;
    const distanceKm = calculateDistanceKm(origin, destination);
    return calculateFreightQuote({
      origin,
      destination,
      weightKg: Number(weightKg) || 10,
      volumeM3: Number(volumeM3) || 0.1,
      category,
      isExpress,
      customDistance: distanceKm
    });
  }, [origin, destination, weightKg, volumeM3, category, isExpress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>AI Dynamic Pricing Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">Empty Truck Space Fare Estimator</h2>
          <p className="text-xs text-slate-400">
            Transparent price computation based on highway distance, cargo payload weight, volume, and material category.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Pickup Station / City:</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                {CITIES.map(c => <option key={c.id} value={c.name}>{c.name} ({c.state})</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Dropoff Station / City:</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                {CITIES.map(c => <option key={c.id} value={c.name}>{c.name} ({c.state})</option>)}
              </select>
            </div>
          </div>

          {/* Sliders for Weight & Volume */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            
            {/* Weight Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Cargo Weight:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="2500"
                step="5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Small Box (5kg)</span>
                <span>Medium Cargo (250kg)</span>
                <span>Heavy Pallet (2,500kg)</span>
              </div>
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Volumetric Size:</span>
                <span className="text-teal-400 font-extrabold text-sm">{volumeM3} m³</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={volumeM3}
                onChange={(e) => setVolumeM3(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.1 m³ (Parcel)</span>
                <span>2 m³ (Furniture)</span>
                <span>20 m³ (Large Cargo)</span>
              </div>
            </div>

            {/* Cargo Category Pills */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 block mb-1.5">Cargo Category:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CARGO_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 transition ${
                      category === cat.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-850 border-slate-750 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Calculation Breakdown Result */}
          {quote && (
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Cost Breakdown ({quote.distanceKm} km Transit)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Shared Rate
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Distance Fare:</span>
                  <span className="font-bold text-white">₹{quote.distanceCost}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Weight Fare:</span>
                  <span className="font-bold text-white">₹{quote.weightCost}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Volume Fare:</span>
                  <span className="font-bold text-white">₹{quote.volumeCost}</span>
                </div>
              </div>

              {/* Total Card */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 text-xs block">Estimated Shared Freight Fare:</span>
                  <span className="text-3xl font-extrabold text-emerald-400">₹{quote.totalFare.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">Incl. 8% platform escrow & 5% GST</span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                    <TrendingDown className="w-4 h-4" />
                    <span>Save {quote.userSavingsPercent}% (vs ₹{quote.dedicatedFullTruckCost.toLocaleString()} solo truck)</span>
                  </div>
                  <p className="text-[11px] text-teal-400 flex items-center justify-end space-x-1">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Offset {quote.carbonSavedKg} kg CO₂ emissions</span>
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Action CTA */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (onSelectRoute) onSelectRoute({ origin, destination, weightKg, volumeM3 });
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <span>Search Trucks on this Route</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
