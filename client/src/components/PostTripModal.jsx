import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Weight, 
  Box, 
  IndianRupee, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CITIES } from '../data/cities';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';

const TRUCK_PRESETS = [
  { model: 'Tata Ace Gold EV', type: 'Mini SCV (Electric)', totalKg: 850, totalM3: 6.5, rateKm: 3.50, priceKg: 4.00 },
  { model: 'Eicher Pro 2049 (14ft)', type: 'Medium Covered LPT', totalKg: 2500, totalM3: 20, rateKm: 3.20, priceKg: 3.80 },
  { model: 'Ashok Leyland BOSS 1215', type: 'Heavy Open Body Deck', totalKg: 4000, totalM3: 35, rateKm: 3.00, priceKg: 3.40 },
  { model: 'Tata Signa 4825.TK (32ft)', type: 'Heavy Closed Container', totalKg: 5000, totalM3: 45, rateKm: 3.20, priceKg: 3.50 },
  { model: 'BharatBenz 2823R (Multi-Axle)', type: 'Heavy Duty Long-Haul', totalKg: 8000, totalM3: 60, rateKm: 2.80, priceKg: 3.00 }
];

export default function PostTripModal({ isOpen, onClose, onTripPosted }) {
  const { postNewTrip } = useLogistics();
  const { user } = useAuth();

  const [origin, setOrigin] = useState('Delhi NCR');
  const [destination, setDestination] = useState('Mumbai');
  const [waypoints, setWaypoints] = useState(['Jaipur', 'Ahmedabad', 'Surat']);
  const [newWaypoint, setNewWaypoint] = useState('');

  const [selectedPreset, setSelectedPreset] = useState(TRUCK_PRESETS[3]);
  const [vehicleNumber, setVehicleNumber] = useState(user?.driverDetails?.vehicleNumber || 'HR 55 AH 8892');
  const [totalWeightCapacityKg, setTotalWeightCapacityKg] = useState(5000);
  const [availableWeightKg, setAvailableWeightKg] = useState(3000);
  const [totalVolumeM3, setTotalVolumeM3] = useState(45);
  const [availableVolumeM3, setAvailableVolumeM3] = useState(25);
  
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('18:00');
  const [baseRatePerKm, setBaseRatePerKm] = useState(3.20);
  const [pricePerKg, setPricePerKg] = useState(3.50);
  const [notes, setNotes] = useState('Empty return run after delivery. Locked waterproof container with GPS tracking.');

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset);
    setTotalWeightCapacityKg(preset.totalKg);
    setAvailableWeightKg(Math.round(preset.totalKg * 0.6));
    setTotalVolumeM3(preset.totalM3);
    setAvailableVolumeM3(Math.round(preset.totalM3 * 0.6));
    setBaseRatePerKm(preset.rateKm);
    setPricePerKg(preset.priceKg);
  };

  const handleAddWaypoint = () => {
    if (newWaypoint.trim() && !waypoints.includes(newWaypoint.trim())) {
      setWaypoints([...waypoints, newWaypoint.trim()]);
      setNewWaypoint('');
    }
  };

  const handleRemoveWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct all stops in order: Origin -> Waypoints -> Destination
    const allStops = [origin, ...waypoints, destination];

    const newTrip = postNewTrip({
      origin,
      destination,
      waypoints: allStops.map((stop, i) => ({
        name: stop,
        eta: i === 0 ? 'Start' : i === allStops.length - 1 ? 'End' : `Waypoint ${i}`,
        completed: i === 0
      })),
      vehicleNumber,
      truckModel: selectedPreset.model,
      truckType: selectedPreset.type,
      totalWeightCapacityKg: Number(totalWeightCapacityKg),
      availableWeightKg: Number(availableWeightKg),
      totalVolumeM3: Number(totalVolumeM3),
      availableVolumeM3: Number(availableVolumeM3),
      departureDate,
      departureTime,
      baseRatePerKm: Number(baseRatePerKm),
      pricePerKg: Number(pricePerKg),
      notes
    });

    if (onTripPosted) onTripPosted(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Driver / Fleet Portal</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">Post Empty or Partial Truck Space</h2>
          <p className="text-xs text-slate-400">
            Monetize your return trips or extra deck capacity by connecting with senders on your route.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Preset Selector */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[11px] uppercase font-bold text-slate-400 block">Select Vehicle Preset:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRUCK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedPreset.model === preset.model
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-850 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold truncate">{preset.model}</p>
                  <p className="text-[10px] text-slate-500">{preset.totalKg}kg • {preset.totalM3}m³</p>
                </button>
              ))}
            </div>
          </div>

          {/* Corridor & Intermediate Stops */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <label className="text-[11px] uppercase font-bold text-slate-400 block">
              Highway Transit Corridor & Waypoints
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Origin City:</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-amber-400"
                >
                  {CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination City:</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-amber-400"
                >
                  {CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Intermediate Waypoints */}
            <div>
              <label className="text-slate-400 block mb-1.5">Intermediate Stops along Highway:</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {waypoints.map((wp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300"
                  >
                    <span>{idx + 1}. {wp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWaypoint(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <select
                  value={newWaypoint}
                  onChange={(e) => setNewWaypoint(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value="">-- Add an intermediate city stop --</option>
                  {CITIES.filter(c => c.name !== origin && c.name !== destination && !waypoints.includes(c.name)).map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.state})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddWaypoint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Capacity Details */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <label className="text-[11px] uppercase font-bold text-slate-400 block">Available Empty Space</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Total Cap (kg):</label>
                <input
                  type="number"
                  value={totalWeightCapacityKg}
                  onChange={(e) => setTotalWeightCapacityKg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-emerald-400 font-bold block mb-1">Available (kg):</label>
                <input
                  type="number"
                  value={availableWeightKg}
                  onChange={(e) => setAvailableWeightKg(e.target.value)}
                  className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-emerald-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Total Vol (m³):</label>
                <input
                  type="number"
                  step="0.5"
                  value={totalVolumeM3}
                  onChange={(e) => setTotalVolumeM3(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-teal-400 font-bold block mb-1">Available (m³):</label>
                <input
                  type="number"
                  step="0.5"
                  value={availableVolumeM3}
                  onChange={(e) => setAvailableVolumeM3(e.target.value)}
                  className="w-full bg-slate-800 border border-teal-500/50 rounded-lg px-2.5 py-1.5 text-teal-300 font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Schedule & Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Departure Date:</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Departure Time:</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Rate (₹/kg):</label>
              <input
                type="number"
                step="0.1"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-400 block mb-1">Trip Notes & Security Details:</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:ring-1 focus:ring-amber-400"
              placeholder="e.g. Empty return trip after unloading electronics in Delhi. Secure waterproof locked container."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20 transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Trip & Start Earning</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
