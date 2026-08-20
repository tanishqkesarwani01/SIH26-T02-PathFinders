import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  MapPin, 
  Weight, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Calculator,
  KeyRound,
  Eye,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { shipmentsAPI } from '../services/api';

export default function SenderDashboard({
  shipments = [],
  trips = [],
  onCreateShipment,
  onBookTripSlot,
  onNavigateToTracker
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Shipment Form
  const [pickupLocation, setPickupLocation] = useState('Lucknow (Transport Nagar)');
  const [dropLocation, setDropLocation] = useState('Sultanpur (Civil Lines)');
  const [weightKg, setWeightKg] = useState(450);
  const [packageType, setPackageType] = useState('Clothing & Textiles');
  const [packageDescription, setPackageDescription] = useState('10 Cartons of Readymade Garments');
  const [pickupTimeWindow, setPickupTimeWindow] = useState('Today 10:00 AM - 12:00 PM');
  const [deliveryDeadline, setDeliveryDeadline] = useState('Today 06:00 PM');
  const [senderName, setSenderName] = useState('Priya Sharma (Retail Goods)');
  const [senderPhone, setSenderPhone] = useState('+91 9415098765');
  
  // Live Fare Estimation Breakdown
  const [fareEstimate, setFareEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Auto calculate fare when parameters change
  useEffect(() => {
    const fetchEstimate = async () => {
      setIsEstimating(true);
      try {
        // Approximate distance
        let dist = 140;
        const p = pickupLocation.toLowerCase();
        const d = dropLocation.toLowerCase();
        if (p.includes('lucknow') && d.includes('varanasi')) dist = 310;
        else if (p.includes('lucknow') && d.includes('sultanpur')) dist = 140;
        else if (p.includes('sultanpur') && d.includes('varanasi')) dist = 170;
        else if (p.includes('raebareli') && d.includes('prayagraj')) dist = 120;

        const res = await shipmentsAPI.getFareEstimate({
          distanceKm: dist,
          weightKg: Number(weightKg) || 100,
          packageType
        });
        setFareEstimate(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEstimating(false);
      }
    };

    fetchEstimate();
  }, [pickupLocation, dropLocation, weightKg, packageType]);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      await onCreateShipment({
        pickupLocation,
        dropLocation,
        weightKg: Number(weightKg),
        packageType,
        packageDescription,
        pickupTimeWindow,
        deliveryDeadline,
        senderName,
        senderPhone
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Find available matching trips that have enough spare capacity
  const matchingTrips = trips.filter(t => t.status === 'SCHEDULED' && t.availableCapacityKg >= 100);

  return (
    <div className="space-y-6">
      
      {/* Sender Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 text-2xl font-bold">
            📦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Sender & Merchant Portal</h1>
              <span className="bg-sky-500/10 text-sky-400 text-xs px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold">
                Transparent Freight Rates
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Book partial truck capacity sitting at home • Up to 65% cheaper than dedicated vehicle hire
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all w-full md:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showCreateForm ? 'Close Form' : 'Send New Package / Cargo'}</span>
        </button>
      </div>

      {/* Create Shipment Form & Transparent Pricing Preview */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              <span>Create Shipment Request & Get Instant Fare</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Dynamic Highway Matching
            </span>
          </div>

          <form onSubmit={handleCreateShipment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Inputs (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Pickup Location / Hub</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Lucknow (Transport Nagar)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Drop-off Destination</label>
                <input
                  type="text"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  placeholder="e.g. Sultanpur (Civil Lines)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cargo Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Package Category</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 text-xs"
                >
                  <option value="Clothing & Textiles">Clothing & Textiles (1.0x)</option>
                  <option value="Electronics">Electronics & Precision (1.15x)</option>
                  <option value="General Freight">General Freight / Hardware (1.0x)</option>
                  <option value="Fragile & Glassware">Fragile & Glassware (1.25x)</option>
                  <option value="Perishable / FMCG">Perishable / FMCG (1.20x)</option>
                  <option value="Industrial & Machinery">Industrial & Machinery (1.10x)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Cargo Description & Quantities</label>
                <input
                  type="text"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="e.g. 10 Cartons of Readymade Garments"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sender Name / Business</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sender Phone Number</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Live Pricing Breakdown Card (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-400" />
                    <span>Transparent Fare Breakdown</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    Official Formula
                  </span>
                </div>

                {fareEstimate ? (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fixed Platform Base Fee:</span>
                      <span className="font-semibold text-white">₹{fareEstimate.baseFee}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Distance ({fareEstimate.distanceKm} km × ₹{fareEstimate.ratePerKm}/km):
                      </span>
                      <span className="font-semibold text-white">₹{fareEstimate.distanceFee}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Weight Charge ({fareEstimate.weightKg} kg × ₹{fareEstimate.ratePerKg}/kg):
                      </span>
                      <span className="font-semibold text-white">₹{fareEstimate.weightFee}</span>
                    </div>

                    {fareEstimate.categorySurcharge > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>Category Modifier ({packageType}):</span>
                        <span className="font-semibold">+₹{fareEstimate.categorySurcharge}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-end">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">Total Calculated Fare</span>
                        <span className="text-2xl font-extrabold text-emerald-400">
                          ₹{fareEstimate.totalFare}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 line-through">
                          Dedicated Truck: ₹{fareEstimate.dedicatedTruckComparison}
                        </div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Save {fareEstimate.savingsPercentage}% (₹{fareEstimate.estimatedSavings})
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">Calculating fare breakdown...</div>
                )}
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  Create & Find Matching Trucks
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Available En-Route Trucks (Instant Matching) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Available Active Truck Trips Along Corridors</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified drivers with available spare capacity ready to transport your parcel
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {matchingTrips.length} Trucks Available
          </span>
        </div>

        {matchingTrips.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p className="text-slate-300 font-semibold mb-1">No Active Trips Posted Yet</p>
            <p className="text-[11px]">
              Switch to "Driver Mode" to create a trip or click "Load SIH Demo" in the top bar to load Ramesh's Lucknow-Varanasi truck.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingTrips.map((trip) => {
              const activeRoute = (trip.routes || []).find(r => r.id === trip.selectedRouteId) || trip.routes?.[0];

              return (
                <div
                  key={trip.id}
                  className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white">
                            {trip.source} → {trip.destination}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          Driver: <strong className="text-slate-200">{trip.driverName}</strong> ({trip.driverRating || 4.9} ★)
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {trip.vehicleNumber}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spare Capacity:</span>
                        <span className="font-bold text-emerald-400">{trip.availableCapacityKg} kg free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Departure:</span>
                        <span className="font-medium text-white">{trip.departureDate} at {trip.departureTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Corridor:</span>
                        <span className="font-medium text-slate-300 truncate max-w-[160px]">{activeRoute?.corridor || 'Direct NH Corridor'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Action for Pending Shipments */}
                  {shipments.filter(s => s.status === 'PENDING').length > 0 ? (
                    <div className="pt-2 border-t border-slate-850">
                      <p className="text-[11px] text-slate-400 mb-1.5">Reserve slot for your pending parcel:</p>
                      {shipments.filter(s => s.status === 'PENDING').map((pendingShp) => (
                        <button
                          key={pendingShp.id}
                          onClick={() => onBookTripSlot(pendingShp.id, trip.id)}
                          className="w-full mb-1.5 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-between transition-all"
                        >
                          <span>Book for {pendingShp.pickupLocation.split(' ')[0]}</span>
                          <span className="font-mono">₹{pendingShp.fareEstimate?.totalFare || 980} →</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Create Shipment to Book</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sender's Current Shipments Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>My Active & Past Shipments</span>
          </h2>
          <span className="text-xs text-slate-400">Total: {shipments.length}</span>
        </div>

        {shipments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p className="text-slate-300 font-semibold mb-1">No Shipments Created Yet</p>
            <p className="text-[11px]">Click "Send New Package" above to create your first shared logistics request.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((shp) => (
              <div
                key={shp.id}
                className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {shp.pickupLocation} → {shp.dropLocation}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      shp.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : shp.status === 'IN_TRANSIT' || shp.status === 'PICKED_UP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : shp.status === 'BOOKED'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {shp.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    {shp.packageDescription} • <strong className="text-slate-200">{shp.weightKg} kg</strong> • Fare: <strong className="text-emerald-400">₹{shp.fareEstimate?.totalFare || 980}</strong>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Driver: <strong className="text-slate-300">{shp.driverName || 'Matching in progress...'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-mono">
                      <KeyRound className="w-3 h-3" /> Pickup OTP: <strong>{shp.pickupOtp}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onNavigateToTracker(shp.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Track Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
