import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AdminDemoBar from './components/AdminDemoBar';
import DriverDashboard from './pages/DriverDashboard';
import SenderDashboard from './pages/SenderDashboard';
import TrackerDashboard from './pages/TrackerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrustVerificationModal from './components/TrustVerificationModal';
import DriverRatingModal from './components/DriverRatingModal';
import AadhaarModal from './components/AadhaarModal';
import { tripsAPI, shipmentsAPI, ratingsAPI, demoAPI, authAPI } from './services/api';

export default function App() {
  const [activeMode, setActiveMode] = useState('driver'); // 'driver' | 'sender' | 'tracker' | 'admin'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Core Platform Data State
  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTrackerShipmentId, setActiveTrackerShipmentId] = useState(null);

  // Modals
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    type: 'pickup', // 'pickup' | 'delivery'
    shipment: null
  });

  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    shipment: null
  });

  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);

  // Fetch all initial data
  const refreshAllData = async () => {
    try {
      const [tripsRes, shipmentsRes, statsRes] = await Promise.all([
        tripsAPI.getTrips(),
        shipmentsAPI.getShipments(),
        demoAPI.getStats()
      ]);

      const rawTrips = tripsRes.data.trips || [];
      const rawShipments = shipmentsRes.data.shipments || [];

      // For each trip, compute candidate matches from backend trip details if available
      const enrichedTrips = await Promise.all(
        rawTrips.map(async (trip) => {
          try {
            const detailRes = await tripsAPI.getTripById(trip.id);
            const evalRoute = detailRes.data.selectedRoute || detailRes.data.evaluatedRoutes?.[0];
            return {
              ...trip,
              routes: detailRes.data.evaluatedRoutes || trip.routes,
              selectedRouteId: trip.selectedRouteId || evalRoute?.id || 'route_A',
              candidateMatches: evalRoute?.bundledShipments || []
            };
          } catch (e) {
            return trip;
          }
        })
      );

      setTrips(enrichedTrips);
      setShipments(rawShipments);
      setStats(statsRes.data);

      // Fetch sample ratings
      const ratingsRes = await ratingsAPI.getDriverRatings('drv_ramesh');
      setRatings(ratingsRes.data.ratings || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Demo Handlers
  const handleSeedDemo = async () => {
    setIsLoading(true);
    try {
      await demoAPI.seedScenario();
      await refreshAllData();
      setActiveMode('driver');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDb = async () => {
    setIsLoading(true);
    try {
      await demoAPI.resetDatabase();
      setTrips([]);
      setShipments([]);
      setRatings([]);
      setStats({ totalTrips: 0, totalShipments: 0, totalWeightMovedKg: 0, totalRevenueGenerated: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Driver Actions
  const handleCreateTrip = async (tripData) => {
    try {
      await tripsAPI.createTrip(tripData);
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRoute = async (tripId, routeId) => {
    try {
      await tripsAPI.selectRoute(tripId, routeId);
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptShipment = async (tripId, shipmentId) => {
    try {
      await tripsAPI.acceptShipment(tripId, shipmentId);
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectShipment = async (tripId, shipmentId) => {
    try {
      await tripsAPI.rejectShipment(tripId, shipmentId);
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
    try {
      await tripsAPI.updateTripStatus(tripId, status);
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Sender Actions
  const handleCreateShipment = async (shipmentData) => {
    try {
      const res = await shipmentsAPI.createShipment(shipmentData);
      await refreshAllData();
      setActiveTrackerShipmentId(res.data.shipment?.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookTripSlot = async (shipmentId, tripId) => {
    try {
      await shipmentsAPI.bookTrip(shipmentId, tripId);
      await refreshAllData();
      setActiveTrackerShipmentId(shipmentId);
      setActiveMode('tracker');
    } catch (err) {
      console.error(err);
    }
  };

  // Verification & Trust Handlers
  const handleVerifyPickupSuccess = async (shipmentId, enteredOtp, photoData) => {
    await shipmentsAPI.verifyPickup(shipmentId, enteredOtp, photoData);
    await refreshAllData();
  };

  const handleVerifyDeliverySuccess = async (shipmentId, enteredOtp, photoData) => {
    await shipmentsAPI.verifyDelivery(shipmentId, enteredOtp, photoData);
    await refreshAllData();
  };

  const handleSubmitRating = async (ratingData) => {
    await ratingsAPI.submitRating(ratingData);
    await refreshAllData();
  };

  const handleVerifyAadhaar = async (aadhaarData) => {
    await authAPI.verifyAadhaar(aadhaarData);
    await refreshAllData();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Collapsible Vertical Sidebar */}
      <Sidebar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenAadhaarModal={() => setIsAadhaarModalOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Demo & System Toolbar */}
        <AdminDemoBar
          onSeedDemo={handleSeedDemo}
          onResetDb={handleResetDb}
          stats={stats}
          isLoading={isLoading}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {activeMode === 'driver' && (
            <DriverDashboard
              trips={trips}
              onCreateTrip={handleCreateTrip}
              onSelectRoute={handleSelectRoute}
              onAcceptShipment={handleAcceptShipment}
              onRejectShipment={handleRejectShipment}
              onUpdateTripStatus={handleUpdateTripStatus}
              onOpenPickupVerification={(shp) =>
                setVerificationModal({ isOpen: true, type: 'pickup', shipment: shp })
              }
              driverRatings={ratings}
              onRefreshData={refreshAllData}
            />
          )}

          {activeMode === 'sender' && (
            <SenderDashboard
              shipments={shipments}
              trips={trips}
              onCreateShipment={handleCreateShipment}
              onBookTripSlot={handleBookTripSlot}
              onNavigateToTracker={(shpId) => {
                setActiveTrackerShipmentId(shpId);
                setActiveMode('tracker');
              }}
            />
          )}

          {activeMode === 'tracker' && (
            <TrackerDashboard
              shipments={shipments}
              trips={trips}
              activeShipmentId={activeTrackerShipmentId}
              onSelectShipment={(shpId) => setActiveTrackerShipmentId(shpId)}
              onOpenPickupVerification={(shp) =>
                setVerificationModal({ isOpen: true, type: 'pickup', shipment: shp })
              }
              onOpenDeliveryVerification={(shp) =>
                setVerificationModal({ isOpen: true, type: 'delivery', shipment: shp })
              }
              onOpenRatingModal={(shp) =>
                setRatingModal({ isOpen: true, shipment: shp })
              }
              onUpdateShipmentStatus={async (shpId, status) => {
                try {
                  await shipmentsAPI.updateStatus(shpId, status);
                  await refreshAllData();
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          )}


          {activeMode === 'admin' && (
            <AdminDashboard
              stats={stats}
              trips={trips}
              shipments={shipments}
              onSeedDemo={handleSeedDemo}
              onResetDb={handleResetDb}
              onCreateManualDriver={async (driverData) => {
                await authAPI.register(driverData);
                await refreshAllData();
              }}
              onCreateManualShipment={async (shpData) => {
                await shipmentsAPI.createShipment(shpData);
                await refreshAllData();
              }}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-6 text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">LoadLink</span>
            <span>•</span>
            <span>SIH 2026 Shared Logistics & Route Optimization Platform</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span>Dynamic Highway Corridors</span>
            <span>•</span>
            <span>Escrow OTP Handshake</span>
            <span>•</span>
            <span>Zero Deadhead Freight</span>
          </div>
        </footer>

      </div>

      {/* Trust & Verification Modal (Pickup & Delivery OTP + Photos) */}
      <TrustVerificationModal
        isOpen={verificationModal.isOpen}
        type={verificationModal.type}
        shipment={verificationModal.shipment}
        onClose={() => setVerificationModal({ isOpen: false, type: 'pickup', shipment: null })}
        onVerifySuccess={
          verificationModal.type === 'pickup'
            ? handleVerifyPickupSuccess
            : handleVerifyDeliverySuccess
        }
      />

      {/* Driver Rating & Review Modal */}
      <DriverRatingModal
        isOpen={ratingModal.isOpen}
        shipment={ratingModal.shipment}
        driverName={ratingModal.shipment?.driverName || 'Driver Partner'}
        driverId={ratingModal.shipment?.driverId}
        onClose={() => setRatingModal({ isOpen: false, shipment: null })}
        onSubmitRating={handleSubmitRating}
      />

      {/* Aadhaar KYC Verification Modal */}
      <AadhaarModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onVerifyAadhaar={handleVerifyAadhaar}
      />

    </div>
  );
}
