import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { shipmentsApi, ratingsApi } from "../api";
import MapView from "../components/MapView";
import EmptyState from "../components/EmptyState";
import { MapPin, CheckCircle2, Circle, Clock, Key, ShieldCheck, Star, Send, Camera, ArrowRight, RefreshCw } from "lucide-react";

const STEPS = [
  { key: "created", label: "Created", desc: "Shipment registered" },
  { key: "booked", label: "Booked", desc: "Driver assigned & escrow held" },
  { key: "picked_up", label: "Picked Up", desc: "Pickup OTP verified" },
  { key: "in_transit", label: "In Transit", desc: "En route to destination" },
  { key: "delivered", label: "Delivered", desc: "Delivery OTP verified & funds released" },
];

function getStepIndex(status) {
  switch (status) {
    case "pending": return 0;
    case "booked": return 1;
    case "picked_up": return 2;
    case "in_transit": return 3;
    case "delivered": return 4;
    default: return 0;
  }
}

export default function TrackerPage({ initialShipmentId }) {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(initialShipmentId || "");
  const [shipment, setShipment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const loadAll = useCallback(async () => {
    try {
      const r = await shipmentsApi.getAll({});
      setShipments(r.data);
      if (!selectedId && r.data.length > 0) {
        setSelectedId(r.data[0].id);
      }
    } catch {}
  }, [selectedId]);

  const loadDetails = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        shipmentsApi.getOne(id),
        shipmentsApi.getLogs(id),
      ]);
      setShipment(sRes.data);
      setLogs(lRes.data);
      
      // Check rating if delivered
      if (sRes.data.status === "delivered") {
        try {
          const rRes = await ratingsApi.getForShipment(id);
          setExistingRating(rRes.data);
        } catch {
          setExistingRating(null);
        }
      }
    } catch {
      showMsg("Failed to load shipment details", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (selectedId) {
      loadDetails(selectedId);
    }
  }, [selectedId, loadDetails]);

  const handleVerifyPickupOtp = async () => {
    if (!otpInput) return;
    setVerifying(true);
    try {
      await shipmentsApi.pickupOtp(shipment.id, otpInput);
      showMsg("Pickup OTP verified successfully! Shipment is now Picked Up.");
      setOtpInput("");
      await loadDetails(shipment.id);
    } catch (err) {
      showMsg(err.response?.data?.error || "Invalid OTP", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleSetInTransit = async () => {
    try {
      const midLat = ((shipment.pickup?.lat || 28.5) + (shipment.dropoff?.lat || 26.9)) / 2;
      const midLng = ((shipment.pickup?.lng || 77.0) + (shipment.dropoff?.lng || 75.8)) / 2;
      await shipmentsApi.updateLocation(shipment.id, {
        lat: midLat,
        lng: midLng,
        status: "in_transit",
      });
      showMsg("Status updated to In Transit with live GPS coordinates!");
      await loadDetails(shipment.id);
    } catch (err) {
      showMsg("Failed to update status", "error");
    }
  };

  const handleVerifyDeliveryOtp = async () => {
    if (!otpInput) return;
    setVerifying(true);
    try {
      await shipmentsApi.deliveryOtp(shipment.id, otpInput);
      showMsg("Delivery confirmed! Escrow funds released to driver.");
      setOtpInput("");
      await loadDetails(shipment.id);
      setShowRatingModal(true);
    } catch (err) {
      showMsg(err.response?.data?.error || "Invalid OTP", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      await ratingsApi.submit({
        shipment_id: shipment.id,
        rating_value: ratingStars,
        comments: ratingComment,
      });
      showMsg("Thank you! Rating submitted and driver profile updated.");
      setShowRatingModal(false);
      await loadDetails(shipment.id);
    } catch (err) {
      showMsg(err.response?.data?.error || "Failed to submit rating", "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const stepIdx = shipment ? getStepIndex(shipment.status) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Shipment Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time status, OTP verification & escrow tracking</p>
        </div>
        
        {/* Shipment Selector */}
        {shipments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tracking:</span>
            <select
              className="form-input text-xs py-2"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.pickup?.city} &rarr; {s.dropoff?.city} ({s.status}) - &#8377;{s.fare_amount}
                </option>
              ))}
            </select>
            <button onClick={() => loadDetails(selectedId)} className="text-slate-400 hover:text-white p-2">
              <RefreshCw size={16} />
            </button>
          </div>
        )}
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
          {msg.text}
        </div>
      )}

      {shipments.length === 0 ? (
        <EmptyState icon={MapPin} title="No active shipments to track" subtitle="Create or book a shipment to see live tracking" />
      ) : !shipment ? (
        <div className="text-center py-20 text-slate-400">Loading details...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Left 2 Cols: Map & Step Timeline */}
          <div className="col-span-2 space-y-6">
            {/* Map View */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-400" /> Route & GPS Telemetry
                </span>
                <span className="badge badge-in_transit text-xs">
                  {shipment.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <MapView
                srcLat={shipment.pickup?.lat}
                srcLng={shipment.pickup?.lng}
                dstLat={shipment.dropoff?.lat}
                dstLng={shipment.dropoff?.lng}
                shipmentLat={shipment.current_lat || ((shipment.pickup?.lat + shipment.dropoff?.lat) / 2)}
                shipmentLng={shipment.current_lng || ((shipment.pickup?.lng + shipment.dropoff?.lng) / 2)}
                srcLabel={`Pickup: ${shipment.pickup?.city}`}
                dstLabel={`Drop: ${shipment.dropoff?.city}`}
                height="320px"
              />
            </div>

            {/* Stepper Timeline */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Milestone Progression</h3>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 h-0.5 bg-slate-700 w-full -translate-y-1/2 -z-0" />
                <div
                  className="absolute left-0 top-1/2 h-0.5 bg-indigo-500 -translate-y-1/2 transition-all duration-500 -z-0"
                  style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((s, idx) => {
                  const isDone = idx <= stepIdx;
                  const isCurrent = idx === stepIdx;
                  return (
                    <div key={s.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-700 text-slate-600"
                      }`}>
                        {isDone ? <CheckCircle2 size={16} /> : <Circle size={12} />}
                      </div>
                      <span className={`text-xs font-semibold mt-2 ${isCurrent ? "text-indigo-400" : isDone ? "text-slate-300" : "text-slate-600"}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-500 text-center max-w-[80px] hidden sm:block">
                        {s.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Status Logs */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" /> Status & Audit Log
              </h3>
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-white">{log.status_type}</span>: {log.notes}
                      <div className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: OTP Actions & Payment Escrow */}
          <div className="space-y-6">
            {/* Escrow Card */}
            <div className="card p-5 bg-indigo-950/20 border-indigo-500/30">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Escrow Security</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">&#8377;{shipment.fare_amount}</div>
              <div className="text-xs text-slate-400">
                Payment Status: <span className="text-indigo-300 font-semibold uppercase">{shipment.payment?.payment_status?.replace("_", " ")}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {shipment.status === "delivered"
                  ? "Funds released to driver upon successful delivery verification."
                  : "Funds are securely held in escrow until the sender confirms delivery OTP."}
              </p>
            </div>

            {/* OTP Verification Boxes */}
            {/* Step: Booked -> Needs Pickup OTP */}
            {shipment.status === "booked" && (
              <div className="card p-5 border-amber-500/30">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                  <Key size={16} /> Pickup Verification
                </h4>
                <div className="p-3 bg-slate-900 rounded-xl mb-4 text-center">
                  <div className="text-xs text-slate-400 mb-1">Pickup OTP Code (Give to Driver):</div>
                  <div className="text-3xl font-mono font-bold tracking-widest text-indigo-400">{shipment.pickup_otp}</div>
                </div>

                <p className="text-xs text-slate-400 mb-2">Driver verification portal:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="form-input text-center tracking-widest font-mono text-sm py-2"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyPickupOtp}
                    disabled={verifying || otpInput.length < 6}
                    className="btn-primary text-xs px-4"
                  >
                    {verifying ? "..." : "Verify"}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Picked Up -> Transition to In Transit */}
            {shipment.status === "picked_up" && (
              <div className="card p-5 border-indigo-500/30">
                <h4 className="text-sm font-bold text-indigo-400 mb-2">Package Picked Up</h4>
                <p className="text-xs text-slate-400 mb-4">
                  The shipment has been picked up by the driver. Start transit to simulate live movement.
                </p>
                <button onClick={handleSetInTransit} className="btn-primary w-full text-xs py-2.5">
                  Update to In Transit &bull; Send Live GPS
                </button>
              </div>
            )}

            {/* Step: In Transit -> Needs Delivery OTP */}
            {(shipment.status === "in_transit" || shipment.status === "picked_up") && (
              <div className="card p-5 border-emerald-500/30">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                  <Key size={16} /> Delivery Verification & Escrow Release
                </h4>
                <div className="p-3 bg-slate-900 rounded-xl mb-4 text-center">
                  <div className="text-xs text-slate-400 mb-1">Delivery OTP Code (With Sender):</div>
                  <div className="text-3xl font-mono font-bold tracking-widest text-emerald-400">{shipment.delivery_otp}</div>
                </div>

                <p className="text-xs text-slate-400 mb-2">Confirm delivery receipt:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="form-input text-center tracking-widest font-mono text-sm py-2"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyDeliveryOtp}
                    disabled={verifying || otpInput.length < 6}
                    className="btn-success text-xs px-4"
                  >
                    {verifying ? "..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Delivered -> Rating Display */}
            {shipment.status === "delivered" && (
              <div className="card p-5">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={16} /> Delivery Completed
                </h4>
                {existingRating ? (
                  <div className="p-3 bg-slate-900 rounded-xl mt-3">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} size={14} className={st <= existingRating.rating_value ? "fill-amber-400" : "text-slate-600"} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 italic">"{existingRating.comments || "Great delivery service!"}"</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-3">Please leave feedback for your driver:</p>
                    <button onClick={() => setShowRatingModal(true)} className="btn-primary w-full text-xs py-2">
                      Rate Driver (1-5 Stars)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Delivery Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Rate Your Driver</h3>
            <p className="text-xs text-slate-400 mb-4">How was your delivery experience with the driver?</p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRatingStars(st)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={st <= ratingStars ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="form-label">Review Comment (Optional)</label>
                <textarea
                  className="form-input h-20 resize-none text-sm"
                  placeholder="On-time pickup, courteous handling, excellent communication..."
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  {submittingRating ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}