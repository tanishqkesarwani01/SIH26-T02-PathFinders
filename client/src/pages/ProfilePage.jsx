import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ratingsApi, authApi } from "../api";
import { User, Truck, Star, ShieldCheck, CheckCircle2, Phone, Mail, Award } from "lucide-react";

export default function ProfilePage() {
  const { user, driverInfo } = useAuth();
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (driverInfo?.id) {
      ratingsApi.getForDriver(driverInfo.id).then(r => setRatings(r.data)).catch(() => {});
    }
  }, [driverInfo]);

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Profile & Credentials</h1>
        <p className="text-slate-400 text-sm mt-0.5">Account identity, verified documentation, and ratings</p>
      </div>

      {/* Main Profile Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="badge badge-completed uppercase text-xs">{user?.role}</span>
              {user?.id_verified === 1 && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={14} /> ID Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs mt-1">
              <span className="flex items-center gap-1"><Mail size={12} /> {user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1"><Phone size={12} /> {user?.phone}</span>}
            </div>
          </div>
        </div>

        {/* Driver Extra Stats */}
        {user?.role === "driver" && driverInfo && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-xs text-slate-400">Driver Rating</span>
              <div className="flex items-center gap-1 text-amber-400 text-lg font-bold mt-0.5">
                <Star size={16} className="fill-amber-400" />
                {driverInfo.avg_rating || "New"}
                <span className="text-xs text-slate-500 font-normal">({driverInfo.total_ratings || 0} reviews)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-xs text-slate-400">Registered Vehicle</span>
              <div className="text-white font-semibold text-sm mt-0.5">{driverInfo.vehicle_type || "Commercial"}</div>
              <div className="text-[11px] text-slate-500">{driverInfo.registration_number} &bull; {driverInfo.capacity_kg} kg</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-xs text-slate-400">Driving License</span>
              <div className="text-white font-semibold text-sm mt-0.5">{driverInfo.license_number}</div>
              <div className="text-[11px] text-emerald-400">Active & Verified</div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Reviews & Feedback */}
      {user?.role === "driver" && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Verified Customer Reviews ({ratings.length})
          </h3>

          {ratings.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No reviews yet. Complete deliveries to receive ratings!</div>
          ) : (
            <div className="space-y-3">
              {ratings.map(r => (
                <div key={r.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{r.sender_name || "Sender"}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} size={12} className={st <= r.rating_value ? "fill-amber-400" : "text-slate-700"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{r.comments || "Great delivery service!"}"</p>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(r.created_at).toLocaleDateString("en-IN")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}