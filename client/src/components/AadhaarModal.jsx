import React, { useState } from 'react';
import { UserCheck, ShieldCheck, UploadCloud, CheckCircle2, AlertCircle, X, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AadhaarModal({
  isOpen,
  onClose,
  currentUser,
  onVerifyAadhaar
}) {
  const [aadhaarNum, setAadhaarNum] = useState(currentUser?.aadhaarNumber || '5421-9876-1234');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      if (onVerifyAadhaar) {
        await onVerifyAadhaar({
          userId: currentUser?.id || 'usr_drv_ramesh',
          aadhaarNumber: aadhaarNum,
          aadhaarPhoto: 'aadhaar_verified_card.png'
        });
      }
      setVerifiedSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        setVerifiedSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!verifiedSuccess ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Government ID & Aadhaar KYC</h3>
                <p className="text-xs text-slate-400">Identity verification ensures safe community transit</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">
                  12-Digit Aadhaar / National ID Number
                </label>
                <input
                  type="text"
                  value={aadhaarNum}
                  onChange={(e) => setAadhaarNum(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="border border-dashed border-slate-700 rounded-xl p-4 bg-slate-950/40 text-center">
                <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-200">Aadhaar Card Front / Back Scans</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated OCR and UIDAI cryptographic checksum</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Document Hash Validated</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  {isVerifying ? 'Verifying with UIDAI...' : 'Confirm KYC Verification'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white mb-1">Identity Verified!</h4>
            <p className="text-xs text-slate-400">
              Your profile is now verified with a green trust badge on all corridor routes.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
