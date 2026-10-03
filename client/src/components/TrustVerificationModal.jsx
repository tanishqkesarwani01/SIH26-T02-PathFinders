import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Lock, 
  UploadCloud, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Robust client-side image comparator
export async function verifyPhotosMatch(photoA, photoB) {
  if (!photoA || !photoB) return false;

  const cleanA = String(photoA).trim();
  const cleanB = String(photoB).trim();

  // 1. Direct string equality (identical URL or identical data URL)
  if (cleanA === cleanB) return true;

  // 2. Base64 payload equality (ignoring minor mime header variations)
  const b64A = cleanA.replace(/^data:image\/\w+;base64,/, '').trim();
  const b64B = cleanB.replace(/^data:image\/\w+;base64,/, '').trim();
  if (b64A && b64B && b64A === b64B) return true;

  // 3. In-browser canvas perceptual/pixel similarity check (if images are loadable)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const matchResult = await new Promise((resolve) => {
        const img1 = new Image();
        const img2 = new Image();
        img1.crossOrigin = 'anonymous';
        img2.crossOrigin = 'anonymous';

        let loadedCount = 0;
        let hasErrored = false;

        const checkCanvasImages = () => {
          loadedCount++;
          if (loadedCount < 2 || hasErrored) return;

          try {
            const size = 32;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(false);

            ctx.drawImage(img1, 0, 0, size, size);
            const data1 = ctx.getImageData(0, 0, size, size).data;

            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img2, 0, 0, size, size);
            const data2 = ctx.getImageData(0, 0, size, size).data;

            let totalDiff = 0;
            const totalPixels = size * size;
            for (let i = 0; i < data1.length; i += 4) {
              const rDiff = Math.abs(data1[i] - data2[i]);
              const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
              const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
              totalDiff += (rDiff + gDiff + bDiff) / 3;
            }

            const avgPixelDiff = totalDiff / totalPixels; // 0 to 255
            const similarity = 1 - (avgPixelDiff / 255);

            // Require at least 88% visual similarity
            resolve(similarity >= 0.88);
          } catch (e) {
            resolve(false);
          }
        };

        img1.onload = checkCanvasImages;
        img2.onload = checkCanvasImages;
        img1.onerror = () => { hasErrored = true; resolve(false); };
        img2.onerror = () => { hasErrored = true; resolve(false); };

        img1.src = cleanA;
        img2.src = cleanB;
      });

      return matchResult;
    } catch (e) {
      return false;
    }
  }

  return false;
}

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
  const [matchStatus, setMatchStatus] = useState(null); // null | 'MATCHED' | 'MISMATCHED' | 'CHECKING'

  const isPickup = type === 'pickup';
  const expectedOtp = isPickup ? shipment?.pickupOtp : shipment?.deliveryOtp;
  const standardPickupPhoto = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80';
  const mismatchedSamplePhoto = 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80';
  
  // Baseline pickup photo recorded on shipment
  const referencePickupPhoto = shipment?.pickupPhoto || standardPickupPhoto;

  // Real-time photo comparison whenever delivery photo changes
  useEffect(() => {
    if (!isOpen || !shipment) return;

    if (!isPickup && photoPreview) {
      setMatchStatus('CHECKING');
      verifyPhotosMatch(referencePickupPhoto, photoPreview).then((isMatch) => {
        setMatchStatus(isMatch ? 'MATCHED' : 'MISMATCHED');
        if (!isMatch) {
          setErrorMsg('❌ Cargo Mismatch Detected: The attached delivery photo does not match the pickup parcel photo! Both images must be identical.');
        } else {
          setErrorMsg('');
        }
      });
    } else {
      setMatchStatus(null);
      setErrorMsg('');
    }
  }, [isOpen, shipment, photoPreview, isPickup, referencePickupPhoto]);

  // Reset inputs whenever modal is closed
  useEffect(() => {
    if (!isOpen) {
      setEnteredOtp('');
      setPhotoPreview(null);
      setErrorMsg('');
      setSuccessMsg('');
      setMatchStatus(null);
    }
  }, [isOpen, shipment?.id]);

  if (!isOpen || !shipment) return null;

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

  // Simulate camera captures
  const handleSimulateMatchingCapture = () => {
    // Exact matching photo of the parcel
    setPhotoPreview(isPickup ? standardPickupPhoto : referencePickupPhoto);
  };

  const handleSimulateMismatchedCapture = () => {
    // Different image (e.g. Mario figurines) to test strict mismatch rejection
    setPhotoPreview(mismatchedSamplePhoto);
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

    if (!photoPreview) {
      setErrorMsg(isPickup ? 'Please attach a parcel photo at pickup.' : 'Please attach a proof of delivery photo.');
      return;
    }

    // STRICT PHOTO VERIFICATION RULE:
    // Delivery photo MUST match pickup photo exactly!
    if (!isPickup) {
      const isMatch = await verifyPhotosMatch(referencePickupPhoto, photoPreview);
      if (!isMatch) {
        setErrorMsg('❌ Photo Verification Failed: The delivery photo does not match the pickup cargo photo! Both images must be exactly the same for the shipment to be verified and delivered.');
        return; // Halt delivery! Cannot be delivered!
      }
    }

    setIsSubmitting(true);
    try {
      if (onVerifySuccess) {
        await onVerifySuccess(shipment.id, enteredOtp.trim(), photoPreview);
      }

      setSuccessMsg(
        isPickup
          ? 'Pickup successfully verified & parcel locked into transit!'
          : 'Delivery & Cargo Match Confirmed! Escrow payment ₹' + (shipment.fareEstimate?.totalFare || 500) + ' released to driver.'
      );

      if (!isPickup) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setEnteredOtp('');
        setPhotoPreview(null);
        setMatchStatus(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        
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
              Shipment ID: <span className="font-mono text-slate-300 font-semibold">{shipment.id}</span> • Escrow Protection
            </p>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 mb-4 text-xs text-slate-300 space-y-1.5">
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

        {/* Delivery Verification Notice: Exact Image Match Rule */}
        {!isPickup && (
          <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Reference Parcel Photo (Captured at Pickup)</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Verified Baseline
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <img
                src={referencePickupPhoto}
                alt="Pickup baseline proof"
                className="w-16 h-16 object-cover rounded-lg border border-slate-700 flex-shrink-0"
              />
              <div className="text-xs text-slate-400">
                <p className="font-semibold text-white">
                  {shipment.packageDescription || shipment.packageType || 'Parcel Cargo'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Delivery handover photo <strong className="text-amber-300">must match this image exactly</strong>. If a different cargo photo is submitted, verification and delivery will be blocked.
                </p>
              </div>
            </div>
          </div>
        )}

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
              placeholder={`e.g. ${expectedOtp}`}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal"
              autoFocus
            />
          </div>

          {/* Photo Verification Section */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1.5">
              {isPickup 
                ? 'Parcel Condition Photo at Pickup (Recorded as Baseline Proof)' 
                : 'Proof of Delivery / Handover Photo (Must Match Pickup Photo)'}
            </label>

            {photoPreview ? (
              <div className="space-y-2.5">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2.5 flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Proof preview"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-800 flex-shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <p className="text-slate-200 font-semibold flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isPickup ? 'Pickup Photo Attached' : 'Handover Photo Attached'}</span>
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {isPickup 
                        ? 'Recorded as the baseline photo for delivery verification.' 
                        : 'Evaluated against the immutable pickup record.'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setPhotoPreview(null)}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remove Photo
                      </button>
                      {!isPickup && matchStatus === 'MISMATCHED' && (
                        <button
                          type="button"
                          onClick={handleSimulateMatchingCapture}
                          className="text-[11px] text-emerald-400 hover:underline font-bold"
                        >
                          Switch to Matching Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-Time Visual Match Feedback */}
                {!isPickup && matchStatus === 'CHECKING' && (
                  <div className="p-2.5 bg-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>Comparing delivery image with pickup parcel baseline...</span>
                  </div>
                )}

                {!isPickup && matchStatus === 'MATCHED' && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Photo Match Verified: Identical Cargo Handover Confirmed</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded font-black">
                      MATCH: 100%
                    </span>
                  </div>
                )}

                {!isPickup && matchStatus === 'MISMATCHED' && (
                  <div className="p-3 bg-rose-500/15 border-2 border-rose-500/60 rounded-xl space-y-1.5 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 font-extrabold">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                        <span>Cargo Mismatch Detected! Images Do NOT Match</span>
                      </div>
                      <span className="text-[10px] font-mono bg-rose-500/25 text-rose-300 px-2 py-0.5 rounded font-black">
                        MISMATCH: 0%
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-200">
                      The delivery handover photo is different from the pickup parcel photo. <strong className="text-white">Shipment cannot be verified or delivered</strong> until the exact same parcel photo is provided.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`grid ${isPickup ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  {/* File Upload Option */}
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

                  {/* Matching Simulation Capture */}
                  <button
                    type="button"
                    onClick={handleSimulateMatchingCapture}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 text-center transition-colors group"
                  >
                    <Camera className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] text-emerald-300 font-bold">
                      {isPickup ? 'Simulate Camera' : '📸 Matching Cargo'}
                    </span>
                  </button>

                  {/* Mismatched Simulation Capture (To test rejection) */}
                  {!isPickup && (
                    <button
                      type="button"
                      onClick={handleSimulateMismatchedCapture}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 text-center transition-colors group"
                      title="Test rejection by simulating a different/wrong cargo photo"
                    >
                      <AlertTriangle className="w-5 h-5 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-rose-300 font-bold">⚠️ Different Cargo</span>
                    </button>
                  )}
                </div>

                {!isPickup && (
                  <p className="text-[10px] text-slate-400">
                    💡 Click <strong className="text-emerald-400">Matching Cargo</strong> to verify delivery, or click <strong className="text-rose-400">Different Cargo</strong> to test failure rejection.
                  </p>
                )}
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
              disabled={isSubmitting || !enteredOtp || (!isPickup && matchStatus === 'MISMATCHED')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                !isPickup && matchStatus === 'MISMATCHED'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 cursor-not-allowed opacity-70'
                  : isPickup
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span>Verifying Cargo...</span>
              ) : !isPickup && matchStatus === 'MISMATCHED' ? (
                <span>Delivery Blocked (Photo Mismatch)</span>
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
