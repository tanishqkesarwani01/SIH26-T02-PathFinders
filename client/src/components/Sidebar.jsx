import React from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Sparkles,
  Database,
  BarChart3,
  Globe,
  ArrowLeft,
  Home
} from 'lucide-react';

export default function Sidebar({ 
  activeMode, 
  setActiveMode, 
  isCollapsed, 
  setIsCollapsed,
  driverStats = null,
  onOpenAadhaarModal
}) {
  const navItems = [
    {
      id: 'driver',
      label: 'Driver Mode',
      subtitle: 'Post trips, optimize routes A/B/C, cargo bundling',
      icon: Truck,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
    },
    {
      id: 'sender',
      label: 'Sender Mode',
      subtitle: 'Create shipments, fare calculator, match trucks',
      icon: Package,
      color: 'text-sky-400',
      activeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300'
    },
    {
      id: 'tracker',
      label: 'Shipment Tracker',
      subtitle: 'Live OTP verification, escrow release, reviews',
      icon: MapPin,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
    },
    {
      id: 'admin',
      label: 'System & Demo Hub',
      subtitle: 'Platform analytics, entity entry, Demo scenario',
      icon: Layers,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
    }
  ];

  return (
    <aside 
      className={`relative bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transition-all duration-300 flex flex-col z-20 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed ? (
          <div 
            onClick={() => setActiveMode('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Return to Public Landing Page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">LoadLink</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">Live</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Shared Freight & Route Optimization</p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setActiveMode('landing')}
            className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
            title="Return to Public Landing Page"
          >
            <Truck className="w-5 h-5 text-slate-950 font-bold" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* TOP-LEFT OPTION: Direct Return to Landing Page Button */}
      <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/40">
        <button
          onClick={() => setActiveMode('landing')}
          className={`w-full flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all group shadow-sm ${
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2 text-xs font-semibold'
          }`}
          title="Go back to Public Landing Page"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">← Landing Page</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-300 font-mono">Home</span>
            </div>
          )}
        </button>
      </div>

      {/* Mode Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        <div className={`px-2 mb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Select Mode'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all group ${
                isActive
                  ? `${item.activeBg} shadow-sm`
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-950/60' : 'bg-slate-800/40 group-hover:bg-slate-800'} transition-colors`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Identity Badge */}
      <div className="p-3 border-t border-slate-800">
        {!isCollapsed ? (
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Escrow Trust</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                100% SECURE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Aadhaar KYC • Pickup OTP Handshake • Escrow Wallet Release
            </p>
            <button
              onClick={onOpenAadhaarModal}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Aadhaar ID</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAadhaarModal}
            className="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 transition-colors"
            title="Verify Aadhaar ID"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* BOTTOM-LEFT OPTION: Dedicated High-Contrast Return to Landing Page Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <button
          onClick={() => setActiveMode('landing')}
          className={`w-full flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 hover:text-white transition-all group shadow-md ${
            isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5 text-xs font-bold'
          }`}
          title="Return to Public Landing Page (Home)"
        >
          <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">← Back to Landing Page</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Home</span>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-between px-1">
            <span>Zero Deadhead Logistics</span>
            <span className="text-emerald-500 font-mono font-semibold">LoadLink</span>
          </div>
        )}
      </div>
    </aside>
  );
}
