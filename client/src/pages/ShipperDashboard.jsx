import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  KeyRound, 
  ShieldCheck, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Leaf,
  PlusCircle,
  XCircle
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import RouteMap from '../components/RouteMap';
import ChatModal from '../components/ChatModal';

export default function ShipperDashboard({ onFindMoreSpace }) {
  const { bookings, trips, cancelBooking } = useLogistics();
  const { user } = useAuth();

  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);

  // Filter bookings for this shipper
  const myBookings = bookings.filter(b => b.shipperId === user?.id || b.shipperName === user?.name || user?.role === 'SHIPPER');

  const activeShipments = myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PICKED_UP_IN_TRANSIT');
  const completedShipments = myBookings.filter(b => b.status === 'DELIVERED');

  const activeTripData = trips.find(t => t.id === (selectedBookingForMap?.tripId || activeShipments[0]?.tripId));

  const totalCarbonOffset = myBookings.reduce((acc, b) => acc + (b.carbonSavedKg || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Shipper Logistics Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-400">
            Track your active cargo deliveries, view handoff OTPs, and coordinate with drivers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">CO₂ Emissions Offset</span>
            <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-end space-x-1">
              <Leaf className="w-3.5 h-3.5" />
              <span>{totalCarbonOffset.toFixed(1)} kg</span>
            </span>
          </div>

          <button
            onClick={onFindMoreSpace}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book More Space</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shipments (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Shipments Section */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Shipments In-Transit ({activeShipments.length})</span>
            </h2>

            {activeShipments.length === 0 ? (
              <div className="bg-slate-850 p-6 rounded-2xl border border-slate-750 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">No active shipments in transit right now.</p>
                <p className="text-[11px] text-slate-500">Book unused truck capacity on any highway corridor to get started.</p>
                <button
                  onClick={onFindMoreSpace}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Find Available Space
                </button>
              </div>
            ) : (
              activeShipments.map(booking => (
                <div 
                  key={booking.id}
                  className="bg-slate-850 rounded-2xl border border-slate-750 p-5 shadow-xl space-y-4 hover:border-emerald-500/40 transition"
                >
                  {/* Header: Status & ID */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-emerald-400">#{booking.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          booking.status === 'PICKED_UP_IN_TRANSIT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {booking.status === 'PICKED_UP_IN_TRANSIT' ? '🚚 In-Transit on Highway' : '⏳ Space Confirmed • Awaiting Pickup'}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white mt-1">{booking.cargoDescription}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Escrow Protected:</span>
                      <span className="text-base font-extrabold text-emerald-400">₹{booking.totalFare.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Route & Cargo details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Pickup:</span>
                      <span className="text-white font-bold">{booking.pickupCity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Dropoff:</span>
                      <span className="text-white font-bold">{booking.dropoffCity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Payload:</span>
                      <span className="text-slate-200">{booking.weightKg} kg ({booking.volumeM3} m³)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Assigned Truck:</span>
                      <span className="text-slate-200 truncate block">{booking.vehicleNumber}</span>
                    </div>
                  </div>

                  {/* PROMINENT OTP HANDSHAKE BOXES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Pickup OTP */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Pickup Verification OTP
                      </span>
                      <div className="text-2xl font-mono font-extrabold text-amber-400 tracking-widest my-0.5">
                        {booking.pickupOtp}
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {booking.pickupVerifiedAt ? '✓ Verified by driver during loading' : 'Give this 4-digit code to driver at pickup'}
                      </span>
                    </div>

                    {/* Delivery OTP */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Consignee Delivery OTP
                      </span>
                      <div className="text-2xl font-mono font-extrabold text-teal-400 tracking-widest my-0.5">
                        {booking.deliveryOtp}
                      </div>
                      <span className="text-[9px] text-slate-500">
                        Share with receiver; releases escrow upon safe delivery
                      </span>
                    </div>

                  </div>

                  {/* Actions & Driver Contact */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">Driver:</span>
                      <strong className="text-white">{booking.driverName}</strong>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-mono">{booking.driverPhone}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBookingForMap(booking)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold border border-slate-700 transition"
                      >
                        Track GPS
                      </button>

                      <button
                        onClick={() => setActiveChatBooking(booking)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Driver</span>
                      </button>

                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel booking and refund escrow?')) {
                              cancelBooking(booking.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              ))
            )}
          </div>

          {/* Completed History Section */}
          {completedShipments.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Delivered Shipments Archive ({completedShipments.length})</span>
              </h2>

              <div className="space-y-2">
                {completedShipments.map(booking => (
                  <div 
                    key={booking.id}
                    className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{booking.cargoDescription}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold">
                          Delivered ✓
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {booking.pickupCity} ➔ {booking.dropoffCity} • Carrier: {booking.driverName}
                      </p>
                      {booking.proofNote && (
                        <p className="text-[10px] text-slate-500 italic">"{booking.proofNote}"</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-200 block">₹{booking.totalFare.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-400">🌱 {booking.carbonSavedKg}kg CO₂ saved</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live GPS Tracking Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Live Shipment GPS Tracking</span>
            </h2>
            <span className="text-[11px] text-emerald-400 font-mono">Live Telemetry</span>
          </div>

          <RouteMap trip={activeTripData} height="480px" />

          {selectedBookingForMap && (
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Viewing Route For:</span>
              <p className="text-white font-bold">{selectedBookingForMap.cargoDescription}</p>
              <p className="text-emerald-400 font-semibold">
                {selectedBookingForMap.pickupCity} ➔ {selectedBookingForMap.dropoffCity}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* In-App Chat Modal */}
      <ChatModal
        isOpen={!!activeChatBooking}
        onClose={() => setActiveChatBooking(null)}
        booking={activeChatBooking}
      />

    </div>
  );
}
