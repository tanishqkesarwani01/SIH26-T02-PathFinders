import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Package, 
  ShieldCheck, 
  Wallet, 
  Calculator, 
  PlusCircle, 
  User, 
  ChevronDown, 
  RefreshCw, 
  Sparkles,
  MapPin
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCalculator, onOpenPostTrip }) {
  const { user, allUsers, switchUser, loginAsRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'DRIVER':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Driver / Fleet</span>;
      case 'ADMIN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin Dispatch</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Shipper</span>;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-serif">Load<span className="text-emerald-400">Link</span></span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">LTL Network</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Empty Truck Space & Corridor Sharing</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-slate-800 text-emerald-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Find Truck Space
            </button>

            <button
              onClick={() => {
                if (user?.role !== 'DRIVER') loginAsRole('DRIVER');
                setActiveTab('driver');
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'driver'
                  ? 'bg-slate-800 text-amber-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Driver Dashboard</span>
            </button>

            <button
              onClick={() => {
                if (user?.role !== 'SHIPPER') loginAsRole('SHIPPER');
                setActiveTab('shipper');
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'shipper'
                  ? 'bg-slate-800 text-emerald-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Shipments & OTP</span>
            </button>

            <button
              onClick={() => {
                if (user?.role !== 'ADMIN') loginAsRole('ADMIN');
                setActiveTab('admin');
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-purple-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>
          </nav>

          {/* Action CTAs & Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Dynamic Cost Calculator Button */}
            <button
              onClick={onOpenCalculator}
              className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
              title="Estimate cost for any distance and load"
            >
              <Calculator className="w-3.5 h-3.5 text-teal-400" />
              <span>Fare Calculator</span>
            </button>

            {/* Post Trip CTA */}
            <button
              onClick={onOpenPostTrip}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Empty Space</span>
            </button>

            {/* Role Switcher & User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 transition"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">₹{(user?.walletBalance || 0).toLocaleString()}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown for 1-Click Role Switch */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-850 rounded-xl shadow-2xl border border-slate-700 p-2 z-50 backdrop-blur-lg bg-slate-900">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">{user?.name}</p>
                    <p className="text-[11px] text-slate-400">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      {getRoleBadge(user?.role)}
                      <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>₹{(user?.walletBalance || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <p className="px-2 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Quick Switch Persona</span>
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                    </p>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          if (u.role === 'DRIVER') setActiveTab('driver');
                          else if (u.role === 'ADMIN') setActiveTab('admin');
                          else setActiveTab('shipper');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                          user?.id === u.id
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 text-left">
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full" />
                          <span className="truncate max-w-[130px]">{u.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setActiveTab('auth');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition"
                    >
                      Sign In with another account
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
