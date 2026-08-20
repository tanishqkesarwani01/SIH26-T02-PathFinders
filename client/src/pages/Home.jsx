import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Weight, 
  Box, 
  Truck, 
  ShieldCheck, 
  Zap, 
  TrendingDown, 
  Leaf, 
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  Lock
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { CITIES } from '../data/cities';
import TripCard from '../components/TripCard';
import RouteMap from '../components/RouteMap';

export default function Home({ onOpenCalculator, onSelectTripForBooking, onOpenPostTrip }) {
  const { trips, searchTrips, platformStats } = useLogistics();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [volumeM3, setVolumeM3] = useState('');
  const [selectedTripForMap, setSelectedTripForMap] = useState(trips[0] || null);

  // Search Results
  const searchResults = useMemo(() => {
    return searchTrips({
      origin,
      destination,
      weightKg: Number(weightKg) || 0,
      volumeM3: Number(volumeM3) || 0
    });
  }, [origin, destination, weightKg, volumeM3, trips]);

  const handleQuickRoute = (from, to) => {
    setOrigin(from);
    setDestination(to);
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
        
        {/* Glow orb */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Deadhead Freight Network • 40-60% Cheaper Shipping</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Send Goods in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Empty Trucks</span> Along Any Highway Route.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Connect directly with verified truck drivers traveling with unused deck capacity. Book space instantly by weight and volume, secure your funds in platform escrow, and track with OTP handshakes.
          </p>

          {/* Platform Metric Badges */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 backdrop-blur p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Active Trucks on Road</span>
              <span className="text-xl font-extrabold text-emerald-400">{platformStats.activeTripsCount} Active</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Shared Freight Moved</span>
              <span className="text-xl font-extrabold text-teal-400">{platformStats.totalFreightTonnes} Tonnes</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Average Shipper Savings</span>
              <span className="text-xl font-extrabold text-amber-400">55% Cheaper</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">CO₂ Emissions Saved</span>
              <span className="text-xl font-extrabold text-emerald-300">~{platformStats.totalCarbonSavedKg} kg</span>
            </div>
          </div>
        </div>

      </section>

      {/* Corridor Search Bar */}
      <section className="bg-slate-850 p-5 rounded-2xl border border-slate-750 shadow-2xl">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
          <Search className="w-4 h-4" />
          <span>Search Available Truck Space by Corridor & Weight</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Pickup City */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Pickup Station / City:</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Delhi or Jaipur"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dropoff City */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Dropoff Station / City:</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Mumbai or Ahmedabad"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Min. Weight (kg):</label>
            <div className="relative">
              <Weight className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
              <input
                type="number"
                placeholder="e.g. 50 kg"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Min. Volume (m³):</label>
            <div className="relative">
              <Box className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 0.5 m³"
                value={volumeM3}
                onChange={(e) => setVolumeM3(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Clear / Reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setOrigin('');
                setDestination('');
                setWeightKg('');
                setVolumeM3('');
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>

        </div>

        {/* Popular Corridors Quick Filter */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Popular Freight Corridors:</span>
          <button
            onClick={() => handleQuickRoute('Delhi NCR', 'Mumbai')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
          >
            Delhi ➔ Mumbai (via Jaipur & Ahmedabad)
          </button>
          <button
            onClick={() => handleQuickRoute('Jaipur', 'Ahmedabad')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] border border-emerald-500/30 transition"
          >
            Jaipur ➔ Ahmedabad (Intermediate Stop)
          </button>
          <button
            onClick={() => handleQuickRoute('Mumbai', 'Bengaluru')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
          >
            Mumbai ➔ Bengaluru (via Pune)
          </button>
          <button
            onClick={() => handleQuickRoute('Kolkata', 'Delhi NCR')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
          >
            Kolkata ➔ Delhi (via Varanasi & Agra)
          </button>
        </div>
      </section>

      {/* Main Grid: Interactive Map & Available Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Available Shared Trucks (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>Available Empty Truck Space ({searchResults.length} Trips Matched)</span>
            </h2>
            <span className="text-xs text-slate-400">Instant Booking Ready</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-slate-850 p-8 rounded-2xl border border-slate-750 text-center space-y-3">
              <Truck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No trucks matching your exact filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching without intermediate stops or lower the minimum weight filter to see all active highway trucks.
              </p>
              <button
                onClick={() => { setOrigin(''); setDestination(''); setWeightKg(''); setVolumeM3(''); }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                View All Active Trips
              </button>
            </div>
          ) : (
            searchResults.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onBookNow={(selectedTrip) => onSelectTripForBooking(selectedTrip, { origin, destination, weightKg })}
                onSelectForMap={(selectedTrip) => setSelectedTripForMap(selectedTrip)}
              />
            ))
          )}
        </div>

        {/* Right Column: Interactive Leaflet Live Telemetry Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span>Live Highway Telemetry Map</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono">GPS Tracked</span>
          </div>

          <RouteMap trip={selectedTripForMap} height="480px" />

          {/* Quick Dynamic Calculator Callout */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950/40 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Need a customized fare estimate?</p>
              <p className="text-[11px] text-slate-400">Calculate instant quote based on distance, weight, and volume.</p>
            </div>
            <button
              onClick={onOpenCalculator}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 transition shrink-0"
            >
              Open Calculator
            </button>
          </div>
        </div>

      </div>

      {/* How It Works Infographic */}
      <section className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-slate-100">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Simple & Secure Process</span>
          <h2 className="text-2xl font-extrabold text-white">How Empty Space Freight Sharing Works</h2>
          <p className="text-xs text-slate-400">Monetize wasted empty truck space with zero hassle and end-to-end security.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 relative space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Driver Posts Corridor</h3>
            <p className="text-xs text-slate-400">
              Truck driver schedules a trip with origin, destination, highway stops, and remaining free weight/volume.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 relative space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Sender Books Instantly</h3>
            <p className="text-xs text-slate-400">
              Ordinary person enters cargo weight and dimensions. Dynamic price calculates and payment is locked in Escrow.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 relative space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Pickup OTP Handshake</h3>
            <p className="text-xs text-slate-400">
              Driver arrives at pickup station, inspects cargo, and verifies the 4-digit Pickup OTP before hitting the highway.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 relative space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h3 className="text-sm font-bold text-white">Delivery OTP & Payout</h3>
            <p className="text-xs text-slate-400">
              Consignee inspects goods and shares Delivery OTP. Escrow instantly releases the payout to the driver's digital wallet!
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
