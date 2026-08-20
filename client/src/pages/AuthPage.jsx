import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Phone,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onAuthSuccess }) {
  const { allUsers, switchUser, registerUser } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState('SHIPPER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [totalCapacityKg, setTotalCapacityKg] = useState('3000');

  const handleQuickLogin = (userId) => {
    switchUser(userId);
    if (onAuthSuccess) onAuthSuccess();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    registerUser({
      name,
      email,
      phone,
      role,
      vehicleNumber,
      truckModel,
      totalCapacityKg
    });

    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">LoadLink Access Portal</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Choose a pre-configured role to immediately explore the system or register a new custom profile.
        </p>
      </div>

      {/* 1-Click Persona Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Instant 1-Click Demo Profiles</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any persona to log in</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleQuickLogin(u.id)}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/50 p-4 rounded-2xl text-left transition transform hover:-translate-y-0.5 shadow-xl group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700 group-hover:border-emerald-400 transition"
                />
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    u.role === 'DRIVER'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : u.role === 'ADMIN'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {u.role}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-300 transition">
                    {u.name}
                  </h3>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>{u.email}</p>
                <p className="text-emerald-400 font-mono font-semibold">Wallet: ₹{(u.walletBalance || 0).toLocaleString()}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold group-hover:text-white">
                <span>Access Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Register / Login Box */}
      <div className="bg-slate-850 p-6 rounded-3xl border border-slate-750 shadow-2xl max-w-lg mx-auto text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Create Custom Account</h2>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setRole('SHIPPER')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                role === 'SHIPPER' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Shipper
            </button>
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                role === 'DRIVER' ? 'bg-amber-600 text-white' : 'text-slate-400'
              }`}
            >
              Truck Driver
            </button>
          </div>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div>
            <label className="text-slate-400 block mb-1">Full Name:</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Email:</label>
              <input
                type="email"
                placeholder="ramesh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Phone Number:</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {role === 'DRIVER' && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Truck & Fleet Details</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vehicle Reg No. (e.g. GJ 01 AB 9988)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="bg-slate-850 border border-slate-750 rounded-lg p-2 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Truck Model (e.g. Eicher 14ft)"
                  value={truckModel}
                  onChange={(e) => setTruckModel(e.target.value)}
                  className="bg-slate-850 border border-slate-750 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition mt-2"
          >
            Create Account & Enter Platform
          </button>
        </form>
      </div>

    </div>
  );
}
