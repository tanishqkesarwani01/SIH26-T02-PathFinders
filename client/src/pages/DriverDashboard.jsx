import React, { useState, useEffect, useRef } from 'react';
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
  Pause,
  RotateCcw,
  CheckCheck,
  Layers,
  Sparkles,
  Info,
  Radio,
  Zap,
  Navigation,
  BellRing,
  History,
  Volume2,
  FastForward
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MapView from '../components/MapView';
import EnRouteToast, { playNotificationChime } from '../components/EnRouteToast';
import EnRouteAlertModal from '../components/EnRouteAlertModal';
import { tripsAPI, shipmentsAPI } from '../services/api';

export default function DriverDashboard({
  trips = [],
  onCreateTrip,
  onSelectRoute,
  onAcceptShipment,
  onRejectShipment,
  onUpdateTripStatus,
  onOpenPickupVerification,
  onRefreshData,
  driverRatings = []
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || null);

  // Dynamic En-Route Proximity & Multi-Point Journey Simulation State
  const [enRouteOpportunity, setEnRouteOpportunity] = useState(null);
  const [isEnRouteModalOpen, setIsEnRouteModalOpen] = useState(false);
  const [isAutoDriving, setIsAutoDriving] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x or 2x
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);
  const [journeyProgressPercent, setJourneyProgressPercent] = useState(0);
  const [enRouteStatusMsg, setEnRouteStatusMsg] = useState('');
  const [isAcceptingEnRoute, setIsAcceptingEnRoute] = useState(false);
  const [acceptedNotice, setAcceptedNotice] = useState(null);
  const [enRouteHistory, setEnRouteHistory] = useState([]);
  const [liveTruckLocation, setLiveTruckLocation] = useState(null);

  // Ref tracking for notifications and timer
  const notifiedShipmentsRef = useRef(new Set());
  const autoDriveTimerRef = useRef(null);

  // Form State
  const [source, setSource] = useState('Lucknow');
  const [destination, setDestination] = useState('Varanasi');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('10:00 AM');
  const [totalCapacityKg, setTotalCapacityKg] = useState(5000);
  const [currentLoadKg, setCurrentLoadKg] = useState(2220);
  const [vehicleNumber, setVehicleNumber] = useState('UP-32-BZ-7890');
  const [vehicleType, setVehicleType] = useState('Medium LCV (14ft Container)');
  const [notes, setNotes] = useState('Scheduled container route. Clean dry bed with space for bundled cargo.');

  // Set default selected trip
  useEffect(() => {
    if (trips && trips.length > 0) {
      if (!selectedTripId || !trips.find(t => t.id === selectedTripId)) {
        setSelectedTripId(trips[0].id);
      }
    }
  }, [trips, selectedTripId]);

  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];
  const activeRoute = (currentTrip?.routes || []).find(r => r.id === currentTrip?.selectedRouteId) || currentTrip?.routes?.[0];

  // Generate dynamic smooth interpolation waypoints along active route stops
  const generateRouteWaypoints = () => {
    const stops = activeRoute?.stops || [
      { name: currentTrip?.source || 'Origin', lat: 26.8467, lng: 80.9462 },
      { name: currentTrip?.destination || 'Destination', lat: 25.3176, lng: 82.9739 }
    ];

    const waypoints = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const s1 = stops[i];
      const s2 = stops[i + 1];
      const stepsBetween = 10; // 10 fine interpolation points per segment
      for (let j = 0; j < stepsBetween; j++) {
        const ratio = j / stepsBetween;
        waypoints.push({
          lat: s1.lat + (s2.lat - s1.lat) * ratio,
          lng: s1.lng + (s2.lng - s1.lng) * ratio,
          segmentStart: s1.name,
          segmentEnd: s2.name,
          name: j === 0 ? s1.name : `En-route (${s1.name} → ${s2.name})`
        });
      }
    }
    const lastStop = stops[stops.length - 1];
    waypoints.push({
      lat: lastStop.lat,
      lng: lastStop.lng,
      segmentStart: lastStop.name,
      segmentEnd: lastStop.name,
      name: lastStop.name
    });
    return waypoints;
  };

  // Automatic Proximity Sensor: Evaluates current truck coordinates in real time
  // Triggers automatically whenever truck comes within <= 10km of an upcoming consignment
  const evaluateProximityAtCoords = async (coords) => {
    if (!currentTrip) return null;
    try {
      const res = await tripsAPI.getProximityConsignments(currentTrip.id, {
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: 10
      });

      const opportunities = res.data?.opportunities || [];
      
      // Proximity sensor rule: Choose the FIRST one that is physically within <= 10 km and not yet notified
      const newOpp = opportunities.find(o => !notifiedShipmentsRef.current.has(o.shipmentId));
      if (newOpp && newOpp.proximityDistanceKm <= 10) {
        notifiedShipmentsRef.current.add(newOpp.shipmentId);
        setEnRouteOpportunity(newOpp);
        
        const locName = newOpp.pickupLocation?.split('(')[0]?.trim() || newOpp.pickupLocation;
        setEnRouteStatusMsg(`🔔 Automatic 10km Trigger: Truck entered 10km zone of ${locName} (${newOpp.proximityDistanceKm} km away, ${newOpp.compatibilityScore}% Match)`);

        // Add to history tray with exact timestamp
        const historyItem = {
          shipmentId: newOpp.shipmentId,
          pickupLocation: newOpp.pickupLocation,
          dropLocation: newOpp.dropLocation,
          weightKg: newOpp.weightKg,
          packageType: newOpp.packageType,
          revenue: newOpp.revenue,
          compatibilityScore: newOpp.compatibilityScore,
          proximityDistanceKm: newOpp.proximityDistanceKm,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setEnRouteHistory(prev => {
          if (prev.some(h => h.shipmentId === newOpp.shipmentId)) return prev;
          return [historyItem, ...prev];
        });

        // Trigger chime audio automatically
        playNotificationChime();
        return newOpp;
      }
    } catch (err) {
      console.error('Proximity scan failed:', err);
    }
    return null;
  };

  // Start or Toggle Real-Time Auto-Drive along the route
  const handleToggleAutoDrive = () => {
    if (isAutoDriving) {
      // Pause
      setIsAutoDriving(false);
      if (autoDriveTimerRef.current) clearInterval(autoDriveTimerRef.current);
      setEnRouteStatusMsg('Auto-Drive paused. GPS sensor on standby.');
    } else {
      // Start / Resume
      setIsAutoDriving(true);
      setAcceptedNotice(null);
      const waypoints = generateRouteWaypoints();
      let step = simulationStepIndex >= waypoints.length - 1 ? 0 : simulationStepIndex;
      setSimulationStepIndex(step);

      setEnRouteStatusMsg(`🚀 Auto-Drive Active: Monitoring 10km radius along ${currentTrip?.source} → ${currentTrip?.destination}...`);

      const intervalMs = simulationSpeed === 2 ? 800 : 1400;

      autoDriveTimerRef.current = setInterval(async () => {
        if (step >= waypoints.length) {
          clearInterval(autoDriveTimerRef.current);
          setIsAutoDriving(false);
          setEnRouteStatusMsg(`🏁 Destination Reached: ${currentTrip?.destination}`);
          return;
        }

        const currentWaypoint = waypoints[step];
        const progress = Math.round((step / (waypoints.length - 1)) * 100);
        setJourneyProgressPercent(progress);
        setSimulationStepIndex(step);

        setLiveTruckLocation({
          lat: currentWaypoint.lat,
          lng: currentWaypoint.lng,
          statusText: `GPS: ${currentWaypoint.name} • ${progress}% Route Progress`
        });

        // Proximity sensor continuously monitors and automatically triggers
        await evaluateProximityAtCoords(currentWaypoint);

        step++;
      }, intervalMs);
    }
  };

  // Reset simulation to start of trip
  const handleResetSimulation = () => {
    if (autoDriveTimerRef.current) clearInterval(autoDriveTimerRef.current);
    setIsAutoDriving(false);
    setSimulationStepIndex(0);
    setJourneyProgressPercent(0);
    setLiveTruckLocation(null);
    setEnRouteOpportunity(null);
    notifiedShipmentsRef.current.clear();
    setEnRouteStatusMsg('GPS simulation reset to origin.');
  };

  // Fast forward to next upcoming cargo location along the route
  const handleFastForwardToNextCargo = async () => {
    if (!currentTrip) return;

    const candidateMatches = currentTrip.candidateMatches || [];
    const upcomingCandidates = candidateMatches.filter(
      s => !notifiedShipmentsRef.current.has(s.id) && !currentTrip.acceptedShipmentIds?.includes(s.id)
    );

    let targetShipment = upcomingCandidates[0];

    if (!targetShipment) {
      const stops = activeRoute?.stops || [
        { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
        { name: 'Nihalgarh', lat: 26.6025, lng: 81.6520 },
        { name: 'Sultanpur', lat: 26.2648, lng: 82.0727 },
        { name: 'Jaunpur', lat: 25.7464, lng: 82.6837 },
        { name: 'Varanasi', lat: 25.3176, lng: 82.9739 }
      ];
      const unvisitedStops = stops.slice(1, stops.length - 1);
      const nextStop = unvisitedStops[0] || stops[1];
      targetShipment = {
        pickupLocation: nextStop.name,
        pickupCoords: { lat: nextStop.lat, lng: nextStop.lng }
      };
    }

    const pLat = targetShipment.pickupCoords?.lat || 26.6025;
    const pLng = targetShipment.pickupCoords?.lng || 81.6520;
    const locName = targetShipment.pickupLocation?.split('(')[0]?.trim() || targetShipment.pickupLocation || 'Upcoming Hub';

    // Position truck ~9.2 km before the upcoming consignment pickup
    const approachCoord = {
      lat: pLat + 0.048,
      lng: pLng - 0.058,
      name: `Approaching ${locName} (~9.2 km ahead)`
    };

    setLiveTruckLocation({
      lat: approachCoord.lat,
      lng: approachCoord.lng,
      statusText: `🚚 Live GPS: Approaching ${locName} (9.2 km away)`
    });

    await evaluateProximityAtCoords(approachCoord);
  };

  useEffect(() => {
    return () => {
      if (autoDriveTimerRef.current) clearInterval(autoDriveTimerRef.current);
    };
  }, []);

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

  // Driver Decision: Accept En-Route Consignment
  const handleAcceptEnRouteConsignment = async () => {
    if (!currentTrip || !enRouteOpportunity) return;
    setIsAcceptingEnRoute(true);
    try {
      await tripsAPI.acceptEnRouteConsignment(currentTrip.id, enRouteOpportunity.shipmentId);
      
      const earning = enRouteOpportunity.revenue || 823;
      const pickupLoc = enRouteOpportunity.pickupLocation || 'En-Route Hub';
      const dropLoc = enRouteOpportunity.dropLocation || 'Destination';

      setAcceptedNotice({
        pickup: pickupLoc,
        drop: dropLoc,
        earning: earning,
        weight: enRouteOpportunity.weightKg || 450
      });

      setEnRouteOpportunity(null);
      setEnRouteStatusMsg(`✅ Cargo Accepted: ${pickupLoc} → ${dropLoc} (+₹${earning})`);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.3 }
      });

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      setEnRouteOpportunity(null);
      if (onRefreshData) onRefreshData();
    } finally {
      setIsAcceptingEnRoute(false);
    }
  };

  // Driver Decision: Decline / Dismiss En-Route Toast
  const handleDismissEnRouteToast = async () => {
    if (enRouteOpportunity && currentTrip) {
      try {
        await tripsAPI.declineEnRouteConsignment(currentTrip.id, enRouteOpportunity.shipmentId, 'Driver dismissed toast');
      } catch (err) {}
    }
    setEnRouteOpportunity(null);
    setEnRouteStatusMsg('Shipment dismissed. Continuing route without detour.');
    setTimeout(() => setEnRouteStatusMsg(''), 3000);
  };

  // Compute stats for current driver
  const avgRating = driverRatings.length > 0
    ? (driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length).toFixed(1)
    : (currentTrip?.driverRating || '4.85');

  const displayAvailableSpace = acceptedNotice
    ? Math.max(0, (currentTrip?.availableCapacityKg || 2780) - (acceptedNotice.weight || 450))
    : (currentTrip?.availableCapacityKg || 2780);

  const displayCurrentLoad = acceptedNotice
    ? ((currentTrip?.currentLoadKg || 2220) + (acceptedNotice.weight || 450))
    : (currentTrip?.currentLoadKg || 2220);

  return (
    <div className="space-y-6 relative">
      
      {/* 🔔 AUTOMATIC TOP-RIGHT 10 KM PROXIMITY NOTIFICATION TOAST */}
      <EnRouteToast
        opportunity={enRouteOpportunity}
        onAccept={handleAcceptEnRouteConsignment}
        onDismiss={handleDismissEnRouteToast}
        isLoading={isAcceptingEnRoute}
      />

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

      {/* 🚨 CONFIRMATION BANNER AFTER ACCEPTING EN-ROUTE CARGO */}
      {acceptedNotice && (
        <div className="bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-4.5 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Cargo Accepted Successfully
              </h3>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                Pickup added: <strong className="text-white">{acceptedNotice.pickup}</strong> • Delivery: <strong className="text-white">{acceptedNotice.drop}</strong>
              </p>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                Additional earning: ₹{acceptedNotice.earning} • Available Space updated to {displayAvailableSpace.toLocaleString()} kg
              </p>
            </div>
          </div>
          <button
            onClick={() => setAcceptedNotice(null)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold"
          >
            Dismiss Notice
          </button>
        </div>
      )}

      {/* 🚨 AUTOMATIC REAL-TIME 10KM PROXIMITY RADAR & LIVE DRIVE CONTROLS */}
      {currentTrip && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 relative">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  🟢 Real-Time Proximity Sensor: {isAutoDriving ? 'ACTIVE (DRIVING)' : 'STANDBY'}
                </span>
                {journeyProgressPercent > 0 && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-mono px-2 py-0.5 rounded-md border border-indigo-500/30">
                    Route Progress: {journeyProgressPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                «The sensor runs continuously in the background as the truck moves. It automatically detects and alerts whenever you cross within 10 km of upcoming consignments.»
              </p>
              {enRouteStatusMsg && (
                <p className="text-xs font-semibold text-amber-300 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> {enRouteStatusMsg}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
            {/* Automatic Real-Time Drive Toggle */}
            <button
              type="button"
              onClick={handleToggleAutoDrive}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all ${
                isAutoDriving
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isAutoDriving ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isAutoDriving ? 'Pause Auto-Drive' : 'Start Auto-Drive & Sensor'}</span>
            </button>

            {/* Fast-Forward to next cargo */}
            <button
              type="button"
              onClick={handleFastForwardToNextCargo}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              title="Fast Forward to Next Upcoming Consignment"
            >
              <FastForward className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Next Cargo</span>
            </button>

            {(journeyProgressPercent > 0 || liveTruckLocation) && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                title="Reset Journey to Start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Trip Form Drawer */}
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Final Destination City</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Varanasi"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. UP-32-BZ-7890"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Total Vehicle Capacity (kg)</label>
              <input
                type="number"
                value={totalCapacityKg}
                onChange={(e) => setTotalCapacityKg(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Currently Loaded Weight (kg)</label>
              <input
                type="number"
                value={currentLoadKg}
                onChange={(e) => setCurrentLoadKg(e.target.value)}
                placeholder="2220"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
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

      {/* Main Content Area */}
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
                    <p className="text-base font-bold text-sky-400 mt-0.5">{displayCurrentLoad} kg</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Available Space</p>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">{displayAvailableSpace} kg</p>
                  </div>
                </div>

                {/* Interactive Multi-Corridor Map View with 10km Proximity Buffer */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Live Route Corridor, Stops & 10 km Proximity Zone</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Active: <strong className="text-emerald-400">{currentTrip.selectedRouteId}</strong>
                    </span>
                  </div>

                  <MapView
                    routes={currentTrip.routes || []}
                    selectedRouteId={currentTrip.selectedRouteId}
                    onSelectRoute={(route) => onSelectRoute(currentTrip.id, route.id)}
                    liveTruckLocation={liveTruckLocation}
                    enRouteOpportunity={enRouteOpportunity}
                    height="340px"
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

          {/* Right Column: Recommended Shipments & Notification History (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Recommended Shipments Box (Ordered by geographical progression along the route) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>En-Route Compatible Cargo</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ordered by upcoming pickup location along the forward route
                  </p>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-mono">
                  {currentTrip?.candidateMatches?.length || 0} Matches
                </span>
              </div>

              {(!currentTrip?.candidateMatches || currentTrip.candidateMatches.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>No compatible pending shipments along this corridor.</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Use Sender Mode to post a shipment, or start Auto-Drive above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTrip.candidateMatches.map((shipment) => {
                    const isAlreadyAccepted = currentTrip.acceptedShipmentIds?.includes(shipment.id);

                    return (
                      <div
                        key={shipment.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isAlreadyAccepted
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {shipment.pickupLocation} → {shipment.dropLocation}
                              </span>
                              {shipment.matchScore && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  {shipment.matchScore} Score
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {shipment.weightKg} kg • {shipment.packageType}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-400">
                              +₹{shipment.fareEstimate?.totalFare || 900}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {shipment.detourKm ? `+${shipment.detourKm}km detour` : '0km detour'}
                            </span>
                          </div>
                        </div>

                        {/* Acceptance Controls */}
                        {isAlreadyAccepted ? (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Locked in Cargo Hold
                            </span>
                            <button
                              type="button"
                              onClick={() => onOpenPickupVerification(shipment)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium"
                            >
                              Verify Pickup OTP
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => onRejectShipment(currentTrip.id, shipment.id)}
                              className="w-1/3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[11px]"
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              onClick={() => onAcceptShipment(currentTrip.id, shipment.id)}
                              className="w-2/3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
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

            {/* En-Route Opportunities History Tray */}
            {enRouteHistory.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <span>En-Route Proximity Trigger History</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {enRouteHistory.length} Events
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {enRouteHistory.map((item, idx) => (
                    <div key={item.shipmentId || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.pickupLocation} → {item.dropLocation}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.weightKg} kg • {item.packageType}
                        </div>
                        <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5 flex items-center gap-2">
                          <span>⚡ {item.proximityDistanceKm} km away</span>
                          <span>•</span>
                          <span className="text-slate-500">Triggered at {item.timestamp || 'Just now'}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-emerald-400">+₹{item.revenue}</div>
                        <span className="text-[10px] text-amber-400">{item.compatibilityScore}% Match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
