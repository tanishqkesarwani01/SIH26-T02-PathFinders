import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { paymentsApi } from "../api";
import EmptyState from "../components/EmptyState";
import { CreditCard, ShieldCheck, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2 } from "lucide-react";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "driver") {
      paymentsApi.getEarnings().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    } else {
      paymentsApi.getMy().then(r => setData({ myPayments: r.data })).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  const isDriver = user?.role === "driver";

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{isDriver ? "Driver Earnings & Escrow Ledger" : "Payment & Escrow History"}</h1>
        <p className="text-slate-400 text-sm mt-0.5">Transparent milestone escrow and direct settlement records</p>
      </div>

      {isDriver && data && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-5 border-emerald-500/30 bg-emerald-950/10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Settled Earnings</span>
            <div className="text-3xl font-bold text-white mt-1">&#8377;{data.totalEarned || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Released from completed deliveries</p>
          </div>
          <div className="card p-5 border-amber-500/30 bg-amber-950/10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending in Escrow</span>
            <div className="text-3xl font-bold text-white mt-1">&#8377;{data.pendingEscrow || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting delivery OTP verification</p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400" /> Transaction Ledger
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading ledger...</div>
        ) : isDriver ? (
          data?.earnings?.length > 0 ? (
            <div className="space-y-3">
              {data.earnings.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.payment_status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {p.payment_status === "completed" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{p.pickup_city} &rarr; {p.drop_city}</div>
                      <div className="text-xs text-slate-400">{p.package_type} &bull; {p.weight_kg} kg</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">&#8377;{p.amount}</div>
                    <span className={`badge ${p.payment_status === "completed" ? "badge-completed" : "badge-pending"} text-[10px]`}>
                      {p.payment_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CreditCard} title="No transaction records" subtitle="Complete trips with accepted shipments to see earnings" />
          )
        ) : data?.myPayments?.length > 0 ? (
          <div className="space-y-3">
            {data.myPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.payment_status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {p.payment_status === "completed" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{p.pickup_city} &rarr; {p.drop_city}</div>
                    <div className="text-xs text-slate-400">{p.package_type} &bull; {p.weight_kg} kg</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">&#8377;{p.amount}</div>
                  <span className={`badge ${p.payment_status === "completed" ? "badge-completed" : "badge-pending"} text-[10px]`}>
                    {p.payment_status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CreditCard} title="No payments made yet" subtitle="Book a shipment to see escrow status here" />
        )}
      </div>
    </div>
  );
}