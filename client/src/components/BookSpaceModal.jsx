import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Weight, 
  Box, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Truck,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CARGO_CATEGORIES, calculateFreightQuote } from '../utils/pricingEngine';
import { calculateDistanceKm } from '../data/cities';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';

export default function BookSpaceModal({ isOpen, onClose, trip, initialQuery = {}, onBookingSuccess }) {
  const { bookSpaceInstantly } = useLogistics();
  const { user } = useAuth();

  const waypoints = trip?.waypoints?.map(w => w.name || w) || [];

  const [pickupCity, setPickupCity] = useState('');
  const [dropoffCity, setDropoffCity] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [weightKg, setWeightKg] = useState(50);
  const [volumeM3, setVolumeM3] = useState(0.4);
  const [isExpress, setIsExpress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'upi' | 'card'

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync initial waypoints
  useEffect(() => {
    if (trip && waypoints.length >= 2) {
      setPickupCity(initialQuery.origin || waypoints[0]);
      setDropoffCity(initialQuery.destination || waypoints[waypoints.length - 1]);
      if (initialQuery.weightKg) setWeightKg(Number(initialQuery.weightKg));
      setBookingConfirmed(null);
      setErrorMessage('');
    }
  }, [trip, initialQuery]);

  // Dynamic Quote Calculation
  const quote = useMemo(() => {
    if (!pickupCity || !dropoffCity) return null;
    const dist = calculateDistanceKm(pickupCity, dropoffCity);
    return calculateFreightQuote({
      origin: pickupCity,
      destination: dropoffCity,
      weightKg: Number(weightKg) || 10,
      volumeM3: Number(volumeM3) || 0.1,
      category,
      isExpress,
      customDistance: dist
    });
  }, [pickupCity, dropoffCity, weightKg, volumeM3, category, isExpress]);

  if (!isOpen || !trip) return null;

  const handleInstantConfirm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (!cargoDescription.trim()) {
        throw new Error('Please enter a brief cargo description (e.g. 3 boxes of textiles).');
      }

      if (Number(weightKg) > trip.availableWeightKg) {
        throw new Error(`Weight exceeds truck's available capacity (${trip.availableWeightKg} kg max).`);
      }

      if (Number(volumeM3) > trip.availableVolumeM3) {
        throw new Error(`Volume exceeds truck's available capacity (${trip.availableVolumeM3} m³ max).`);
      }

      // Execute Instant Booking & Escrow Hold
      const booking = bookSpaceInstantly({
        tripId: trip.id,
        pickupCity,
        dropoffCity,
        pickupAddress,
        dropoffAddress,
        cargoDescription,
        category,
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        isExpress
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setBookingConfirmed(booking);
      if (onBookingSuccess) onBookingSuccess(booking);
    } catch (err) {
      setErrorMessage(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Confirmation State */}
        {bookingConfirmed ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Instant Space Reserved</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Booking #{bookingConfirmed.id} Confirmed!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your payment of <strong className="text-emerald-400">₹{bookingConfirmed.totalFare.toLocaleString()}</strong> is securely held in Platform Escrow.
              </p>
            </div>

            {/* OTP Handshake Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pickup OTP (Give to Driver)</span>
                <div className="text-3xl font-mono font-extrabold text-amber-400 tracking-widest my-1">
                  {bookingConfirmed.pickupOtp}
                </div>
                <span className="text-[10px] text-slate-500">Provide when driver inspects & loads cargo</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Delivery OTP (Give at Dropoff)</span>
                <div className="text-3xl font-mono font-extrabold text-teal-400 tracking-widest my-1">
                  {bookingConfirmed.deliveryOtp}
                </div>
                <span className="text-[10px] text-slate-500">Provide when receiver gets goods safely</span>
              </div>

            </div>

            {/* Carrier Summary */}
            <div className="bg-slate-800/60 p-4 rounded-xl text-left border border-slate-700/60 max-w-md mx-auto text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Truck:</span>
                <span className="text-white font-bold">{bookingConfirmed.truckModel} ({bookingConfirmed.vehicleNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Contact:</span>
                <span className="text-emerald-400 font-bold">{bookingConfirmed.driverName} ({bookingConfirmed.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route Segment:</span>
                <span className="text-white font-medium">{bookingConfirmed.pickupCity} ➔ {bookingConfirmed.dropoffCity}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
              >
                Go to My Shipments Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form State */
          <form onSubmit={handleInstantConfirm} className="space-y-5">
            
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Instant Truck Space Booking</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Book Capacity on {trip.driverName}'s Truck
              </h2>
              <p className="text-xs text-slate-400">
                Corridor: {trip.origin} ➔ {trip.destination} • {trip.availableWeightKg} kg space remaining
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Corridor Pickup & Dropoff Selection */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                1. Select Route Segment along Driver's Waypoints
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Pickup Waypoint:</label>
                  <select
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    {waypoints.map((wp, i) => (
                      <option key={i} value={wp}>{wp} (Stop {i + 1})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Dropoff Waypoint:</label>
                  <select
                    value={dropoffCity}
                    onChange={(e) => setDropoffCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    {waypoints.map((wp, i) => (
                      <option key={i} value={wp}>{wp} (Stop {i + 1})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exact Street Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Pickup local address / landmark"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Dropoff local address / consignee"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Step 2: Cargo Details & Dimensions */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                2. Cargo Dimensions & Weight
              </label>

              <div>
                <input
                  type="text"
                  placeholder="Cargo description (e.g. 4 boxes of machinery spare parts)"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cargo Type:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CARGO_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Weight (kg): <span className="text-emerald-400 font-bold">max {trip.availableWeightKg}kg</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={trip.availableWeightKg}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Volume */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Volume (m³): <span className="text-teal-400 font-bold">max {trip.availableVolumeM3}m³</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={trip.availableVolumeM3}
                    value={volumeM3}
                    onChange={(e) => setVolumeM3(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Dynamic Price Calculation Breakdown */}
            {quote && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Dynamic Pricing Breakdown</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Estimated Transit: {quote.distanceKm} km
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base Freight ({quote.distanceKm}km):</span>
                    <span>₹{quote.distanceCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weight Surcharge ({weightKg}kg):</span>
                    <span>₹{quote.weightCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volumetric Freight ({volumeM3}m³):</span>
                    <span>₹{quote.volumeCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Handling & Surcharge:</span>
                    <span>₹{quote.handlingFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Escrow Fee (8%):</span>
                    <span>₹{quote.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5%):</span>
                    <span>₹{quote.gst}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Escrow Payable:</span>
                    <span className="text-2xl font-extrabold text-emerald-400">₹{quote.totalFare.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Save {quote.userSavingsPercent}% vs Full Truck
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">🌱 {quote.carbonSavedKg} kg CO₂ offset</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Escrow Payment Selection */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Escrow Security & Payment Method</span>
                </span>
                <span className="text-[10px] text-slate-500">Funds released only after Delivery OTP</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethod === 'wallet'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-[11px]">Instant Wallet</p>
                  <p className="text-[10px] text-slate-400 font-normal">Bal: ₹{(user?.walletBalance || 0).toLocaleString()}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-[11px]">Instant UPI / QR</p>
                  <p className="text-[10px] text-slate-400 font-normal">GPay / PhonePe / Paytm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-[11px]">Card / NetBanking</p>
                  <p className="text-[10px] text-slate-400 font-normal">All Indian banks</p>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Reserving Space...' : `Pay ₹${quote ? quote.totalFare.toLocaleString() : '---'} & Book Instantly`}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
