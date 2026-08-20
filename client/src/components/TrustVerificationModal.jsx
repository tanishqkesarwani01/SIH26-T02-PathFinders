import React, { useState } from 'react';
import { ShieldCheck, Camera, KeyRound, CheckCircle2, AlertCircle, X, Lock, UploadCloud, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TrustVerificationModal({
  isOpen,
  onClose,
  type = 'pickup', // 'pickup' | 'delivery'
  shipment,
  onVerifySuccess
}) {
  const [enteredOtp, setEnteredOtp] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !shipment) return null;

  const isPickup = type === 'pickup';
  const expectedOtp = isPickup ? shipment.pickupOtp : shipment.deliveryOtp;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCameraCapture = () => {
    // High-contrast sample placeholder snapshot for rapid demo
    setPhotoPreview(
      isPickup
        ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit verification OTP provided by the partner.');
      return;
    }

    if (enteredOtp.trim() !== String(expectedOtp).trim()) {
      setErrorMsg(`Incorrect OTP code. Expected OTP for this demo is "${expectedOtp}".`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onVerifySuccess) {
        await onVerifySuccess(shipment.id, enteredOtp.trim(), photoPreview);
      }

      setSuccessMsg(
        isPickup
          ? 'Pickup successfully verified & parcel locked into transit!'
          : 'Delivery OTP confirmed! Escrow payment ₹' + (shipment.fareEstimate?.totalFare || 500) + ' released to driver.'
      );

      if (!isPickup) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setEnteredOtp('');
        setPhotoPreview(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-xl ${isPickup ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isPickup ? 'Pickup Verification & Parcel Handshake' : 'Delivery Confirmation & Escrow Release'}
            </h3>
            <p className="text-xs text-slate-400">
              Shipment ID: <span className="font-mono text-slate-300 font-semibold">{shipment.id}</span>
            </p>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 mb-5 text-xs text-slate-300 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Cargo:</span>
            <span className="font-semibold text-white">{shipment.packageDescription || shipment.packageType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{isPickup ? 'Pickup Location:' : 'Dropoff Location:'}</span>
            <span className="font-semibold text-white">{isPickup ? shipment.pickupLocation : shipment.dropLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Escrow Value:</span>
            <span className="font-bold text-emerald-400">₹{shipment.fareEstimate?.totalFare || 980}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* OTP Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Enter 4-Digit {isPickup ? 'Pickup' : 'Delivery'} OTP</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Demo OTP: {expectedOtp}
              </span>
            </div>
            <input
              type="text"
              maxLength={4}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 4819"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal"
              autoFocus
            />
          </div>

          {/* Photo Verification */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1.5">
              {isPickup ? 'Parcel Condition Photo at Pickup (Optional Proof)' : 'Proof of Delivery / Handover Photo'}
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-3">
                <img
                  src={photoPreview}
                  alt="Proof preview"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-800"
                />
                <div className="flex-1 text-xs">
                  <p className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Encrypted and logged in immutable ledger.</p>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="mt-2 text-[11px] text-rose-400 hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/40 text-center transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[11px] text-slate-300 font-medium">Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSimulateCameraCapture}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700 hover:border-emerald-500/50 bg-slate-950/40 text-center transition-colors group"
                >
                  <Camera className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] text-slate-300 font-medium">Simulate Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !enteredOtp}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                isPickup
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>{isPickup ? 'Confirm Pickup' : 'Release Payment & Deliver'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
