import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Navigation, 
  Activity, 
  Award, 
  Clock, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Zap, 
  TrendingDown,
  Lock,
  Search,
  Users,
  Compass,
  FileCheck,
  Building2,
  Play
} from 'lucide-react';

export default function LandingPage({
  onNavigate,
  trips = [],
  shipments = [],
  stats = {},
  onSeedDemo,
  onOpenLegal
}) {
  const [searchOrigin, setSearchOrigin] = useState('Agra');
  const [searchDestination, setSearchDestination] = useState('Prayagraj');

  // Pre-configured popular corridors for quick exploration
  const popularCorridors = [
    { from: 'Agra', to: 'Prayagraj', distance: '472 km', duration: '7.5 hrs', highway: 'NH19 / Purvanchal Connector' },
    { from: 'Delhi', to: 'Lucknow', distance: '485 km', duration: '6.5 hrs', highway: 'Yamuna & Agra-Lucknow Exp' },
    { from: 'Lucknow', to: 'Varanasi', distance: '310 km', duration: '5.8 hrs', highway: 'NH731 / Purvanchal Exp' },
    { from: 'Kanpur', to: 'Gorakhpur', distance: '350 km', duration: '6.2 hrs', highway: 'NH27 East-West Arterial' }
  ];

  // Find matching trips for the currently selected corridor
  const matchingTrips = useMemo(() => {
    if (!searchOrigin || !searchDestination) return [];
    const orig = searchOrigin.toLowerCase();
    const dest = searchDestination.toLowerCase();
    return trips.filter(t => 
      t.source?.toLowerCase().includes(orig) && 
      t.destination?.toLowerCase().includes(dest)
    );
  }, [searchOrigin, searchDestination, trips]);

  const handleSelectQuickCorridor = (from, to) => {
    setSearchOrigin(from);
    setSearchDestination(to);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Network Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
              <Truck className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">LoadLink</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Mesh
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Highway Freight Consolidation & Route Engine</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#corridors" className="hover:text-emerald-400 transition-colors">Corridors</a>
            <a href="#technology" className="hover:text-emerald-400 transition-colors">Technology</a>
            <a href="#live-fleet" className="hover:text-emerald-400 transition-colors">Live Capacity</a>
            <a href="#trust" className="hover:text-emerald-400 transition-colors">Trust & Escrow</a>
          </nav>

          {/* Action Portals Group */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('driver')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Driver Portal</span>
            </button>

            <button
              onClick={() => onNavigate('sender')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Package className="w-3.5 h-3.5 text-sky-400" />
              <span>Shipper Portal</span>
            </button>

            <button
              onClick={() => onNavigate('driver')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/80">
        
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-slate-300 text-xs font-semibold mb-6 shadow-xl backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold">Intelligent Highway Bundling</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">10 km Real-Road Sensor Radius</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Monetize Empty Truck Beds. <br className="hidden sm:inline" />
            Ship Freight Along Highway Corridors.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminating deadhead miles across Uttar Pradesh and New Delhi NCR. Match partial freight to returning commercial trucks in real-time, optimize alternative routes (A/B/C), and secure payments through two-step OTP escrow.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('driver')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all hover:shadow-emerald-500/30 active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Enter Driver Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('sender')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span>Book Consignment Space</span>
            </button>

            <button
              onClick={() => onNavigate('tracker')}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 font-semibold text-sm border border-slate-800 flex items-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Live OTP Tracker</span>
            </button>

            {onSeedDemo && (
              <button
                onClick={onSeedDemo}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 hover:from-indigo-900/60 hover:to-purple-900/60 text-purple-300 font-semibold text-sm border border-purple-500/30 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Quick Scenario Demo</span>
              </button>
            )}
          </div>

          {/* Core Platform Features Showcase */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 backdrop-blur group shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                3-Way Corridor Engine
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates recommended, alternative, and bypass highway routes for maximum truck capacity utilization.
              </p>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900 transition-all duration-300 backdrop-blur group shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                10km Proximity Sensor
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous radar stops truck telemetry 10km before pickup to alert drivers of instant en-route cargo.
              </p>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/50 hover:bg-slate-900 transition-all duration-300 backdrop-blur group shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                Strict Photo & OTP Proof
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ensures exact cargo photo verification and dual-factor cryptographic OTP proof before delivery completion.
              </p>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 backdrop-blur group shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                Automated Escrow Vault
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guarantees payment safety by holding shipper funds in escrow until verified recipient handover.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Live Corridor Route Checker */}
      <section id="corridors" className="py-16 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Instant Freight Corridor Explorer</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Check Empty Bed Capacity Across Live Highway Routes
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Powered by real-world OpenStreetMap and OSRM routing. Our engine detects multiple alternative routes with named intermediate hubs.
            </p>
          </div>

          {/* Quick Corridor Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-slate-400">Popular Routes:</span>
            {popularCorridors.map((c) => (
              <button
                key={`${c.from}-${c.to}`}
                onClick={() => handleSelectQuickCorridor(c.from, c.to)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  searchOrigin === c.from && searchDestination === c.to
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
                }`}
              >
                <span>{c.from} ➔ {c.to}</span>
                <span className="text-[10px] opacity-75 font-mono">({c.distance})</span>
              </button>
            ))}
          </div>

          {/* Route Card Preview */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Route Endpoints */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Origin City (Pickup)</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <input 
                      type="text" 
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                      placeholder="e.g. Agra, Delhi, Lucknow"
                      className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination City (Dropoff)</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <input 
                      type="text" 
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      placeholder="e.g. Prayagraj, Varanasi, Gorakhpur"
                      className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Corridor Intelligence Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Selected Corridor</span>
                  <span className="text-emerald-400 font-bold">{searchOrigin} ➔ {searchDestination}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Alternative Corridors Available</span>
                  <span className="text-slate-200 font-semibold font-mono">Route A, B, & C</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">En-Route Proximity Sensor</span>
                  <span className="text-teal-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    10 km Corridor Mesh
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Active Return Trucks Matching</span>
                  <span className="text-amber-400 font-bold">{matchingTrips.length > 0 ? `${matchingTrips.length} Available` : 'Open for Posting'}</span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-3 flex flex-col justify-center">
                <button
                  onClick={() => onNavigate('sender')}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Ship Goods on this Route</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('driver')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>I am a Driver: Post Return Trip</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* The 4 Architectural Pillars of the Platform */}
      <section id="technology" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Engine Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Purpose-Built for the Realities of Indian Highway Logistics
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Generic map tools fail when applied to commercial freight. Our proprietary engine combines dynamic highway corridor detection with zero-detour proximity sensor logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Dynamic Route A, B, C Engine
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real OSRM highway paths for any city pair in Uttar Pradesh & NCR. Identifies intermediate hub cities along expressways and computes true road curvature.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Road-following OSRM polyline</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-105 transition-transform">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  10 km En-Route Proximity Sensor
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous sensor continuously scans 10 km along the truck's forward travel vector. Alerts drivers of upcoming parcels right before arriving in the city.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-teal-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero out-of-corridor detour</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Aadhaar Trust & KYC Shield
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every driver partner is verified with verified Aadhaar identity and vehicle commercial registration. Earns green trust badges to assure cargo safety.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-sky-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified driver rating index</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Two-Step OTP Escrow Handshake
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Shipper payment is locked securely in escrow upon match. Transferred to driver automatically only after verified pickup OTP and recipient handover OTP.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-amber-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Guaranteed payment security</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Live Fleet Capacity Section */}
      <section id="live-fleet" className="py-20 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">Live Freight Mesh</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Active Trucks Scheduled on Network</h2>
            </div>
            <button
              onClick={() => onNavigate('driver')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 self-start"
            >
              <span>View All Fleet Schedules in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(trips.length > 0 ? trips.slice(0, 3) : [
              {
                id: 'preview_1',
                vehicleNumber: 'UP-32-BZ-7890',
                status: 'SCHEDULED',
                source: 'Agra',
                destination: 'Prayagraj',
                vehicleType: '14ft Container (Eicher Pro)',
                totalCapacityKg: 5000,
                currentLoadKg: 2200,
                departureTime: '11:00 AM',
                departureDate: 'Today'
              },
              {
                id: 'preview_2',
                vehicleNumber: 'DL-1L-AA-4432',
                status: 'AVAILABLE',
                source: 'Delhi NCR',
                destination: 'Lucknow',
                vehicleType: '20ft Multi-Axle Heavy',
                totalCapacityKg: 9000,
                currentLoadKg: 3400,
                departureTime: '02:30 PM',
                departureDate: 'Today'
              },
              {
                id: 'preview_3',
                vehicleNumber: 'UP-65-AT-1029',
                status: 'EN_ROUTE',
                source: 'Lucknow',
                destination: 'Varanasi',
                vehicleType: 'Medium LCV (Tata 407)',
                totalCapacityKg: 4000,
                currentLoadKg: 1850,
                departureTime: '09:15 AM',
                departureDate: 'Today'
              }
            ]).map((trip) => {
              const capTotal = trip.totalCapacityKg || 5000;
              const capUsed = trip.currentLoadKg || 0;
              const capFree = Math.max(0, capTotal - capUsed);
              const percentUsed = Math.min(100, Math.round((capUsed / capTotal) * 100));

              return (
                <div key={trip.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition-all space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      {trip.vehicleNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {trip.status}
                    </span>
                  </div>

                  {/* Route Corridor */}
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <span>{trip.source}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <span>{trip.destination}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{trip.vehicleType}</p>
                  </div>

                  {/* Capacity Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Free Payload Space</span>
                      <span className="text-emerald-400 font-bold">{capFree} kg Available</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                        style={{ width: `${percentUsed}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>{capUsed} kg booked</span>
                      <span>Total: {capTotal} kg</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Departure</span>
                      <span>{trip.departureTime || '10:00 AM'}, {trip.departureDate || 'Today'}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('sender')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                    >
                      Book Space
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Role Gateways (Choose How to Enter the App) */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Dedicated Dashboards</span>
            <h2 className="text-3xl font-extrabold text-white">Select Your Workflow to Enter Platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Driver Role Card */}
            <div 
              onClick={() => onNavigate('driver')}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                Commercial Driver Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Post your planned routes, compare corridors A/B/C, bundle pending parcels automatically, and run the 10km GPS sensor.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Driver Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Shipper Role Card */}
            <div 
              onClick={() => onNavigate('sender')}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Consignor & Shipper Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Create partial freight shipments, calculate dynamic weight fares, match verified trucks, and lock funds into escrow.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Shipper Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Tracker Role Card */}
            <div 
              onClick={() => onNavigate('tracker')}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                Real-Time OTP Tracker
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Inspect active deliveries, execute digital pickup/delivery OTP verification, review drivers, and track escrow release.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Tracker Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Trust & Security Banner */}
      <section id="trust" className="py-16 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Compromise on Cargo Safety</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Every Route Verified. Every Rupee Protected.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                From Aadhaar KYC verification of vehicle drivers to GPS journey tracking and automated escrow payment release, LoadLink builds the trust infrastructure required for shared freight.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => onNavigate('driver')}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
              >
                Launch Main Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white">LoadLink</span>
                <span className="text-slate-500 ml-2 hidden sm:inline">• Shared Freight Network & Route Optimizer</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium sm:ml-4 sm:border-l sm:border-slate-800 sm:pl-4">
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => onOpenLegal('terms')} className="hover:text-emerald-400 transition-colors">Terms & Conditions</button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>UP & NCR Corridor</span>
            <span>•</span>
            <span>Smart Escrow</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
