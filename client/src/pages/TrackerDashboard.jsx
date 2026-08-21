import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  KeyRound, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  Star, 
  Lock, 
  Unlock, 
  ArrowRight, 
  DollarSign, 
  AlertCircle,
  FileText,
  Eye,
  Navigation,
  CheckCircle,
  Play
} from 'lucide-react';
import MapView from '../components/MapView';

export default function TrackerDashboard({
  shipments = [],
  trips = [],
  activeShipmentId = null,
  onSelectShipment = null,
  onOpenPickupVerification,
  onOpenDeliveryVerification,
  onOpenRatingModal,
  onUpdateShipmentStatus
}) {
  const [selectedShipmentId, setSelectedShipmentId] = useState(activeShipmentId || shipments[0]?.id || null);

  // Sync when activeShipmentId changes externally
  useEffect(() => {
    if (activeShipmentId) {
      setSelectedShipmentId(activeShipmentId);
    } else if (shipments.length > 0 && !selectedShipmentId) {
      setSelectedShipmentId(shipments[0].id);
    }
  }, [activeShipmentId, shipments]);

  const currentShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0];
  const assignedTrip = currentShipment?.assignedTripId ? trips.find(t => t.id === currentShipment.assignedTripId) : trips[0];

  const handleShipmentChange = (newId) => {
    setSelectedShipmentId(newId);
    if (onSelectShipment) onSelectShipment(newId);
  };

  // Workflow Stages
  const isBooked = !!currentShipment && currentShipment.status !== 'PENDING';
  const isPickedUp = !!currentShipment && (currentShipment.status === 'PICKED_UP' || currentShipment.status === 'IN_TRANSIT' || currentShipment.status === 'DELIVERED' || currentShipment.pickupOtpVerified);
  const isInTransit = !!currentShipment && (currentShipment.status === 'IN_TRANSIT' || currentShipment.status === 'DELIVERED');
  const isDelivered = !!currentShipment && (currentShipment.status === 'DELIVERED' || currentShipment.deliveryOtpVerified);

  const stages = [
    {
      id: 'BOOKED',
      label: '1. Booking & Escrow',
      desc: `Cargo space reserved on Truck ${assignedTrip?.vehicleNumber || 'UP-32-BZ-7890'}. ₹${currentShipment?.fareEstimate?.totalFare || 980} held securely in Escrow.`,
      isDone: isBooked,
      isActive: currentShipment?.status === 'BOOKED'
    },
    {
      id: 'PICKED_UP',
      label: '2. Pickup & Handshake',
      desc: currentShipment?.pickupOtpVerified
        ? `Driver verified pickup with OTP (${currentShipment.pickupOtp}) & photo proof.`
        : 'Driver verifies pickup OTP & uploads parcel condition proof photo.',
      isDone: isPickedUp,
      isActive: currentShipment?.status === 'PICKED_UP'
    },
    {
      id: 'IN_TRANSIT',
      label: '3. Highway Corridor Transit',
      desc: 'Truck in-transit on designated highway route with active GPS sync.',
      isDone: isInTransit,
      isActive: currentShipment?.status === 'IN_TRANSIT'
    },
    {
      id: 'DELIVERED',
      label: '4. Delivery & Escrow Release',
      desc: currentShipment?.deliveryOtpVerified
        ? `Recipient confirmed delivery OTP (${currentShipment.deliveryOtp}). ₹${currentShipment?.fareEstimate?.totalFare || 980} payout released to Driver.`
        : 'Recipient confirms parcel receipt with delivery OTP. Payment automatically released to Driver.',
      isDone: isDelivered,
      isActive: currentShipment?.status === 'DELIVERED'
    }
  ];

  const driverName = currentShipment?.driverName || assignedTrip?.driverName || 'Ramesh Verma';
  const driverPhone = currentShipment?.driverPhone || assignedTrip?.driverPhone || '+91 98390 12345';
  const vehicleNumber = assignedTrip?.vehicleNumber || 'UP-32-BZ-7890';
  const vehicleType = assignedTrip?.vehicleType || 'Medium LCV (14ft Container)';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 text-2xl font-bold">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Live Shipment & Escrow Tracker</h1>
              <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Escrow Handshake
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end cryptographic OTP verification • Immutable pickup and delivery proof logs
            </p>
          </div>
        </div>

        {/* Quick Selection Selector */}
        {shipments.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-300">Track Shipment:</span>
            <select
              value={currentShipment?.id || ''}
              onChange={(e) => handleShipmentChange(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.pickupLocation.split(' ')[0]} → {s.dropLocation.split(' ')[0]} ({s.id}) • {s.status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Tracker Container */}
      {!currentShipment ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Shipments to Track</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Create a shipment in Sender Mode or click "Load SIH Demo" in the top bar to simulate the live parcel tracking pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Map & Live Truck Specs (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              {/* Shipment Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      {currentShipment.pickupLocation} <span className="text-emerald-400">→</span> {currentShipment.dropLocation}
                    </h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      currentShipment.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : currentShipment.status === 'IN_TRANSIT'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                        : currentShipment.status === 'PICKED_UP'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {currentShipment.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cargo: <strong className="text-slate-200">{currentShipment.packageDescription || currentShipment.packageType}</strong> ({currentShipment.weightKg} kg)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">Shipment ID</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{currentShipment.id}</span>
                </div>
              </div>

              {/* Map Rendering with dynamic route specifically for this shipment and truck */}
              <MapView
                routes={assignedTrip?.routes || []}
                selectedRouteId={assignedTrip?.selectedRouteId || 'route_A'}
                activeShipment={currentShipment}
                candidateShipments={[currentShipment]}
                height="340px"
              />

              {/* Assigned Truck & Driver Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Assigned Vehicle</p>
                  <p className="text-xs font-bold text-white mt-0.5 font-mono">{vehicleNumber}</p>
                  <p className="text-[10px] text-slate-400 truncate">{vehicleType}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Assigned Driver</p>
                  <p className="text-xs font-bold text-white mt-0.5">{driverName}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">{driverPhone}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Escrow Security</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    {currentShipment.paymentStatus === 'COMPLETED' ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Released to Driver
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> ₹{currentShipment.fareEstimate?.totalFare || 980} in Escrow
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {currentShipment.paymentStatus === 'COMPLETED' ? 'Handover Confirmed' : 'Protected until OTP release'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Step-by-Step Trust Timeline & Interactive OTP Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Interactive Trust Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cryptographic Delivery Verification Pipeline</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {stages.map((stage, idx) => (
                  <div key={stage.id} className="relative flex items-start gap-3 pl-1">
                    {/* Step Circle Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                        stage.isDone
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-900 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 ring-4 ring-slate-900'
                      }`}
                    >
                      {stage.isDone ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${stage.isDone ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {stage.label}
                        </h4>
                        {stage.isDone && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Verification Trigger Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5">
                
                {/* 1. Pickup Verification Button (Driver Side) */}
                {currentShipment.status === 'BOOKED' && !currentShipment.pickupOtpVerified && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" /> Pickup Verification Needed
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                        OTP: {currentShipment.pickupOtp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Driver must enter the sender's 4-digit pickup code (<strong className="text-amber-400 font-mono">{currentShipment.pickupOtp}</strong>) and upload a photo of the loaded cargo.
                    </p>
                    <button
                      onClick={() => onOpenPickupVerification(currentShipment)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Verify Pickup OTP & Photo Proof</span>
                    </button>
                  </div>
                )}

                {/* 2. Start Highway Transit (when cargo is loaded) */}
                {currentShipment.status === 'PICKED_UP' && (
                  <div className="p-3.5 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Pickup Handshake Complete
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        OTP {currentShipment.pickupOtp} VERIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Parcel is safely loaded on truck {vehicleNumber}. Ready to transition to highway corridor transit.
                    </p>
                    <button
                      onClick={() => onUpdateShipmentStatus && onUpdateShipmentStatus(currentShipment.id, 'IN_TRANSIT')}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Start Highway Corridor Transit</span>
                    </button>
                  </div>
                )}

                {/* 3. Delivery Verification Button (Sender / Receiver Side) */}
                {(currentShipment.status === 'PICKED_UP' || currentShipment.status === 'IN_TRANSIT') && !currentShipment.deliveryOtpVerified && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Ready for Delivery Handover
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                        Delivery OTP: {currentShipment.deliveryOtp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Receiver confirms parcel condition with delivery OTP (<strong className="text-emerald-400 font-mono">{currentShipment.deliveryOtp}</strong>). Verifying instantly releases escrow payment.
                    </p>
                    <button
                      onClick={() => onOpenDeliveryVerification(currentShipment)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Delivery OTP & Release Escrow</span>
                    </button>
                  </div>
                )}

                {/* 4. Post-Delivery Feedback / Rating Button */}
                {currentShipment.status === 'DELIVERED' && (
                  <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Delivery Complete & Escrow Released
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ₹{currentShipment.fareEstimate?.totalFare || 980} PAID
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Delivery confirmed with OTP {currentShipment.deliveryOtp}. Rate Driver {driverName} to update community trust score.
                    </p>
                    <button
                      onClick={() => onOpenRatingModal(currentShipment)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Rate Driver Experience (1 - 5 Stars)</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

            {/* Security Proof Photo Thumbnails */}
            {(currentShipment.pickupPhoto || currentShipment.deliveryPhoto) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 animate-fadeIn">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>Immutable Proof of Handover Photos</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {currentShipment.pickupPhoto && (
                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-center">
                      <img
                        src={currentShipment.pickupPhoto}
                        alt="Pickup proof"
                        className="w-full h-24 object-cover rounded-lg mb-1.5 border border-slate-800"
                      />
                      <span className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Pickup Proof (OTP: {currentShipment.pickupOtp})
                      </span>
                    </div>
                  )}

                  {currentShipment.deliveryPhoto && (
                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-center">
                      <img
                        src={currentShipment.deliveryPhoto}
                        alt="Delivery proof"
                        className="w-full h-24 object-cover rounded-lg mb-1.5 border border-slate-800"
                      />
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Delivery Proof (OTP: {currentShipment.deliveryOtp})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
