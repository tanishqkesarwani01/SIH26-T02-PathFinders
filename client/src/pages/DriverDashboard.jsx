import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Weight, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Star, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Play,
  CheckCheck,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import MapView from '../components/MapView';

export default function DriverDashboard({
  trips = [],
  onCreateTrip,
  onSelectRoute,
  onAcceptShipment,
  onRejectShipment,
  onUpdateTripStatus,
  onOpenPickupVerification,
  driverRatings = []
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || null);
  const [activeTripData, setActiveTripData] = useState(null);

  // Form State
  const [source, setSource] = useState('Lucknow');
  const [destination, setDestination] = useState('Varanasi');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('10:00 AM');
  const [totalCapacityKg, setTotalCapacityKg] = useState(5000);
  const [currentLoadKg, setCurrentLoadKg] = useState(1500);
  const [vehicleNumber, setVehicleNumber] = useState('UP-32-TR-7890');
  const [vehicleType, setVehicleType] = useState('Medium LCV (14ft Container)');
  const [notes, setNotes] = useState('Regular express highway route. Covered waterproof box.');

  // Set default selected trip
  useEffect(() => {
    if (trips && trips.length > 0) {
      if (!selectedTripId || !trips.find(t => t.id === selectedTripId)) {
        setSelectedTripId(trips[0].id);
      }
    }
  }, [trips, selectedTripId]);

  // Find active selected trip object
  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreateTrip({
        source,
        destination,
        departureDate,
        departureTime,
        totalCapacityKg: Number(totalCapacityKg),
        currentLoadKg: Number(currentLoadKg),
        vehicleNumber,
        vehicleType,
        notes
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute stats for current driver
  const avgRating = driverRatings.length > 0
    ? (driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length).toFixed(1)
    : (currentTrip?.driverRating || '4.9');

  return (
    <div className="space-y-6">
      
      {/* Driver Header & Profile Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 text-2xl font-bold">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Driver Portal & Route Optimizer</h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Maximize truck space utilization along Highway Corridors • Zero Empty Return Miles
            </p>
          </div>
        </div>

        {/* Rating & Post Trip Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <div className="text-xs font-bold text-white leading-none">{avgRating} / 5.0</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Driver Score ({driverRatings.length || 38} reviews)</div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showCreateForm ? 'Close Form' : 'Post New Trip'}</span>
          </button>
        </div>
      </div>

      {/* Create Trip Form Collapsible Drawer */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>Create New Freight Trip & Route Corridor</span>
            </h2>
            <span className="text-xs text-slate-400">Routes A, B, C will be generated automatically</span>
          </div>

          <form onSubmit={handleCreateTripSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Origin / Departure City</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Lucknow"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Destination City</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Varanasi"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. UP-32-TR-7890"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Total Vehicle Capacity (kg)</label>
              <input
                type="number"
                value={totalCapacityKg}
                onChange={(e) => setTotalCapacityKg(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Current Pre-loaded Cargo (kg)</label>
              <input
                type="number"
                value={currentLoadKg}
                onChange={(e) => setCurrentLoadKg(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Departure Date & Time</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
              >
                Publish Trip & Run Matching Engine
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Area: If No Trips, Show Empty State */}
      {trips.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Trips Posted Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            You currently have no scheduled freight routes. Click "Post New Trip" above or click "Load SIH Demo" in the top bar to test the Lucknow → Varanasi corridor.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Trip Selector & Multi-Route Corridor Recommendations (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Trip Selector Tabs if multiple trips */}
            {trips.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTripId(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedTripId === t.id
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.source} → {t.destination}</span>
                    <span className="text-[10px] opacity-70 font-mono">({t.availableCapacityKg}kg free)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Trip Details Card */}
            {currentTrip && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        {currentTrip.source} <span className="text-emerald-400">→</span> {currentTrip.destination}
                      </h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        currentTrip.status === 'IN_TRANSIT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : currentTrip.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {currentTrip.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vehicle: <span className="text-slate-200 font-mono font-medium">{currentTrip.vehicleNumber}</span> ({currentTrip.vehicleType})
                    </p>
                  </div>

                  {/* Trip Action Button */}
                  <div>
                    {currentTrip.status === 'SCHEDULED' && (
                      <button
                        onClick={() => onUpdateTripStatus(currentTrip.id, 'IN_TRANSIT')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Start Journey</span>
                      </button>
                    )}
                    {currentTrip.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => onUpdateTripStatus(currentTrip.id, 'COMPLETED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark Trip Completed</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Capacity Gauges */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Total Capacity</p>
                    <p className="text-base font-bold text-white mt-0.5">{currentTrip.totalCapacityKg} kg</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Current Loaded</p>
                    <p className="text-base font-bold text-sky-400 mt-0.5">{currentTrip.currentLoadKg} kg</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Available Spare Space</p>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">{currentTrip.availableCapacityKg} kg</p>
                  </div>
                </div>

                {/* Interactive Multi-Corridor Map View */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Live Route Corridor & Stops Preview</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Active: <strong className="text-emerald-400">{currentTrip.selectedRouteId}</strong>
                    </span>
                  </div>

                  <MapView
                    routes={currentTrip.routes || []}
                    selectedRouteId={currentTrip.selectedRouteId}
                    onSelectRoute={(route) => onSelectRoute(currentTrip.id, route.id)}
                    height="320px"
                  />
                </div>

              </div>
            )}

            {/* Candidate Route Options Evaluated (A, B, C) */}
            {currentTrip && currentTrip.routes && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Candidate Corridor Options (Evaluated by Matching Engine)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Click a route to activate</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentTrip.routes.map((route, idx) => {
                    const isSelected = currentTrip.selectedRouteId === route.id;

                    return (
                      <div
                        key={route.id || idx}
                        onClick={() => onSelectRoute(currentTrip.id, route.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-400 shadow-lg'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        {route.isRecommended && (
                          <div className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow">
                            ★ RECOMMENDED
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: route.color || '#10b981' }}
                          />
                          <h4 className="text-xs font-bold text-white truncate">{route.name?.split(':')[0]}</h4>
                        </div>

                        <p className="text-[11px] text-slate-400 mb-2 truncate">
                          {route.corridor}
                        </p>

                        <div className="space-y-1 text-[11px] border-t border-slate-700/60 pt-2 text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Distance:</span>
                            <span className="font-semibold">{route.distanceKm} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Est. Duration:</span>
                            <span className="font-semibold">{route.estimatedDurationHours} hrs</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`mt-2.5 w-full py-1 rounded-lg text-[11px] font-bold text-center transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Active Route Corridor' : 'Select Route'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Recommended Shipments & Bundling Hub (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Recommended Shipments Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Compatible Shipment Recommendations</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Filter by corridor proximity, capacity, and extra revenue
                  </p>
                </div>
              </div>

              {/* Render Bundled / Candidate Shipments */}
              {(!currentTrip || !currentTrip.candidateMatches || currentTrip.candidateMatches.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p className="text-slate-300 font-semibold mb-1">No Pending Shipments Matching This Route</p>
                  <p className="text-[11px]">
                    Create shipments in "Sender Mode" or click "Load SIH Demo" to view candidate parcels in Sultanpur & Raebareli.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTrip.candidateMatches.map((item, idx) => {
                    const shp = item.shipment || item;
                    const metrics = item.metrics || {};
                    const isAccepted = currentTrip.acceptedShipmentIds?.includes(shp.id);

                    return (
                      <div
                        key={shp.id || idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isAccepted
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {shp.packageType}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-1">
                              {shp.pickupLocation} <span className="text-emerald-400">→</span> {shp.dropLocation}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-extrabold text-emerald-400">
                              +₹{shp.fareEstimate?.totalFare || 980}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium">Extra Earning</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 mb-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          {shp.packageDescription}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3">
                          <div>Weight: <strong className="text-slate-200">{shp.weightKg} kg</strong></div>
                          <div>Detour: <strong className="text-emerald-400">{metrics.detourKm || 0} km</strong></div>
                          <div>Shipper: <span className="text-slate-300 font-medium">{shp.senderName}</span></div>
                          <div>Deadline: <span className="text-slate-300 font-medium">{shp.deliveryDeadline}</span></div>
                        </div>

                        {/* Accept / Reject Buttons */}
                        {isAccepted ? (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Locked in Cargo Hold
                            </span>
                            {shp.status === 'BOOKED' && (
                              <button
                                onClick={() => onOpenPickupVerification(shp)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors"
                              >
                                Verify Pickup OTP
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                            <button
                              onClick={() => onRejectShipment(currentTrip.id, shp.id)}
                              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>
                            <button
                              onClick={() => onAcceptShipment(currentTrip.id, shp.id)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept Cargo</span>
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Ratings & Driver Feedback */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Verified Shipper Feedback & Ratings</span>
              </h3>

              {driverRatings.length === 0 ? (
                <p className="text-xs text-slate-400">No ratings yet. Complete shipments to receive 5-star shipper reviews.</p>
              ) : (
                <div className="space-y-2.5">
                  {driverRatings.slice(0, 3).map((r, i) => (
                    <div key={r.id || i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{r.senderName}</span>
                        <div className="flex text-amber-400 text-xs">
                          {'★'.repeat(r.rating)}
                        </div>
                      </div>
                      <p className="text-slate-400 text-[11px] italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
