import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  Truck, 
  PackageCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLogistics } from '../context/LogisticsContext';

export default function OtpHandshakeModal({ isOpen, onClose, booking, mode = 'pickup', onCompleted }) {
  const { verifyPickupOtp, verifyDeliveryOtp } = useLogistics();

  const [otp, setOtp] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const isPickupMode = mode === 'pickup';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (otp.length !== 4) {
        throw new Error('Please enter a valid 4-digit numeric OTP.');
      }

      if (isPickupMode) {
        verifyPickupOtp(booking.id, otp);
      } else {
        verifyDeliveryOtp(booking.id, otp, proofNote);
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setIsSuccess(true);
      if (onCompleted) onCompleted();
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">
                {isPickupMode ? 'Cargo Loaded & Verified!' : 'Delivery Complete & Payout Released!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isPickupMode
                  ? 'Truck status is now In-Transit. Live GPS telemetry updated.'
                  : `₹${booking.driverEarnings.toLocaleString()} has been directly deposited into your driver wallet.`}
              </p>
            </div>

            {!isPickupMode && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-center">
                <span className="text-[11px] text-emerald-300 font-medium block">Net Payout Released:</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{booking.driverEarnings.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Transaction ID: TXN_{booking.id.toUpperCase()}</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="text-center pb-2 border-b border-slate-800">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                isPickupMode ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-500/20 text-teal-400'
              }`}>
                {isPickupMode ? <KeyRound className="w-6 h-6" /> : <PackageCheck className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-bold text-white">
                {isPickupMode ? 'Verify Cargo Pickup OTP' : 'Verify Consignee Delivery OTP'}
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {isPickupMode
                  ? `Ask Shipper (${booking.shipperName}) for their 4-digit Pickup OTP.`
                  : `Ask Receiver at ${booking.dropoffCity} for their 4-digit Delivery OTP.`}
              </p>
            </div>

            {/* Booking Snippet */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Shipment:</span>
                <span className="text-white font-bold">{booking.cargoDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weight & Vol:</span>
                <span className="text-slate-200">{booking.weightKg} kg • {booking.volumeM3} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="text-emerald-400 font-semibold">{booking.pickupCity} ➔ {booking.dropoffCity}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-1.5 text-center">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Enter 4-Digit Handshake OTP
              </label>
              <input
                type="text"
                maxLength="4"
                placeholder="• • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.5em] bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-white focus:outline-none"
                required
                autoFocus
              />
              <p className="text-[10px] text-slate-500">
                (Demo Hint: {isPickupMode ? `Shipper's OTP is ${booking.pickupOtp}` : `Receiver's OTP is ${booking.deliveryOtp}`})
              </p>
            </div>

            {/* Proof note for delivery mode */}
            {!isPickupMode && (
              <div>
                <label className="text-slate-400 block mb-1">Proof of Delivery Note / Consignee Remarks:</label>
                <input
                  type="text"
                  placeholder="e.g. Delivered in intact sealed boxes to warehouse gate 2"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white"
                />
              </div>
            )}

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`w-2/3 py-2.5 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center space-x-1.5 ${
                  isPickupMode
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isPickupMode ? 'Confirm Pickup' : 'Verify & Release Payout'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
