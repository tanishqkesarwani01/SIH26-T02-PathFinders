import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api";
import { Zap, Trash2, ChevronDown, ChevronUp, RefreshCw, Play, Truck, Package, Shield } from "lucide-react";

const DEMO_CREDS = [
  { role: "driver", name: "Ravi Kumar (Driver)", email: "ravi@velocitylogistics.in", password: "driver123", icon: Truck },
  { role: "sender", name: "Priya Gupta (Sender)", email: "priya@example.in", password: "sender123", icon: Package },
  { role: "driver", name: "Suresh Sharma (Driver 2)", email: "suresh@velocitylogistics.in", password: "driver123", icon: Truck },
  { role: "sender", name: "Aditya Mehta (Sender 2)", email: "aditya@example.in", password: "sender123", icon: Package },
  { role: "admin", name: "Admin Portal", email: "admin@velocitylogistics.in", password: "admin123", icon: Shield },
];

export default function TesterToolbar({ onRefresh }) {
  const { user, switchToUser } = useAuth();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState("");
  const [msg, setMsg] = useState("");

  const showMsg = (m, isErr = false) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3500);
  };

  const handleLaunchLiveDemo = async () => {
    setLoading("live_demo");
    try {
      showMsg("Seeding Delhi-Jaipur corridor data...");
      await adminApi.seed();
      showMsg("Logging in as Driver (Ravi Kumar)...");
      await switchToUser("ravi@velocitylogistics.in", "driver123");
      showMsg("?? Live Demo Active! Inspect 3 route options & matching shipments.");
      if (onRefresh) onRefresh();
    } catch (e) {
      showMsg("Error: " + (e.response?.data?.error || e.message), true);
    } finally {
      setLoading("");
    }
  };

  const handleSeed = async () => {
    setLoading("seed");
    try {
      const r = await adminApi.seed();
      showMsg("? Sample data generated successfully!");
      if (!user) {
        await switchToUser("ravi@velocitylogistics.in", "driver123");
      }
      if (onRefresh) onRefresh();
    } catch (e) {
      showMsg("Error: " + (e.response?.data?.error || e.message), true);
    } finally {
      setLoading("");
    }
  };

  const handleWipe = async () => {
    if (!window.confirm("Wipe ALL data from database? This returns the app to a clean empty state.")) return;
    setLoading("wipe");
    try {
      await adminApi.wipe();
      showMsg("Database wiped to empty state.");
      localStorage.removeItem("vl_token");
      if (onRefresh) onRefresh();
      window.location.reload();
    } catch (e) {
      showMsg("Error: " + (e.response?.data?.error || e.message), true);
    } finally {
      setLoading("");
    }
  };

  const handleSwitch = async (cred) => {
    setLoading(cred.email);
    try {
      // If user login fails, automatically seed first
      try {
        await switchToUser(cred.email, cred.password);
      } catch {
        showMsg("Seeding data first...");
        await adminApi.seed();
        await switchToUser(cred.email, cred.password);
      }
      showMsg("Switched to " + cred.name);
      if (onRefresh) onRefresh();
    } catch (e) {
      showMsg("Error switching user: " + (e.response?.data?.error || e.message), true);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {open && (
        <div className="bg-slate-950/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-2.5 shadow-2xl">
          <div className="flex items-center justify-between gap-3 flex-wrap max-w-7xl mx-auto">
            {/* Left: Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <Zap size={13} className="text-indigo-400" /> Demo Lab
              </span>

              {/* 1-Click Launch Live Demo */}
              <button
                onClick={handleLaunchLiveDemo}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play size={12} className={loading === "live_demo" ? "animate-spin" : "fill-white"} />
                {loading === "live_demo" ? "Loading Demo..." : "?? Launch Live Demo"}
              </button>

              <button
                onClick={handleSeed}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
              >
                <RefreshCw size={11} className={loading === "seed" ? "animate-spin" : ""} />
                Generate Sample Corridor
              </button>

              <button
                onClick={handleWipe}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 transition-all"
              >
                <Trash2 size={11} /> Wipe DB
              </button>
            </div>

            {/* Right: User Switchers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Switch Active Role:</span>
              {DEMO_CREDS.map((c) => (
                <button
                  key={c.email}
                  onClick={() => handleSwitch(c)}
                  disabled={loading === c.email}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    user?.email === c.email
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                      : c.role === "driver"
                      ? "border-sky-500/30 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20"
                      : c.role === "sender"
                      ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "border-slate-600 text-slate-300 bg-slate-800/80 hover:bg-slate-700"
                  }`}
                >
                  {loading === c.email ? "..." : c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <div className="text-center text-xs font-semibold text-amber-300 mt-1 animate-pulse">
              {msg}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-center py-0.5 bg-slate-900/90 border-t border-slate-800 text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
      >
        {open ? <ChevronDown size={11} className="inline" /> : <ChevronUp size={11} className="inline" />}
        {" "}Demo Lab Controls
      </button>
    </div>
  );
}