import React, { useState } from 'react';
import { Star, MessageSquare, X, CheckCircle, ThumbsUp, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverRatingModal({
  isOpen,
  onClose,
  shipment,
  driverName = 'Driver Partner',
  driverId = null,
  onSubmitRating
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onSubmitRating) {
        await onSubmitRating({
          shipmentId: shipment?.id || null,
          driverId: driverId || shipment?.driverId || 'drv_ramesh',
          rating,
          comment: comment.trim() || 'Timely delivery and verified OTP verification.'
        });
      }
      setIsSubmitted(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setComment('');
      }, 1500);
    } catch (err) {
      console.error('Rating failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2.5">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Rate Driver Experience</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                How was your shared transit experience with <span className="text-emerald-400 font-semibold">{driverName}</span>?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Selection */}
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-center text-xs font-semibold text-amber-400">
                {rating === 5 && '★★★★★ Outstanding Service & Secure Handover'}
                {rating === 4 && '★★★★☆ Very Good and Reliable'}
                {rating === 3 && '★★★☆☆ Average Experience'}
                {rating === 2 && '★★☆☆☆ Room for Improvement'}
                {rating === 1 && '★☆☆☆☆ Poor Service'}
              </div>

              {/* Comment Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Optional Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share a short review on driving safety, OTP coordination, and timeliness..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white mb-1">Rating Recorded!</h4>
            <p className="text-xs text-slate-400">
              Thank you for verifying and building trust in the community network.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
