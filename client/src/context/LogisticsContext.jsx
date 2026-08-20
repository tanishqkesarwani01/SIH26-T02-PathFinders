import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TRIPS, INITIAL_BOOKINGS, INITIAL_MESSAGES } from '../data/initialData';
import { calculateFreightQuote } from '../utils/pricingEngine';
import { calculateDistanceKm, getCityByName } from '../data/cities';
import { useAuth } from './AuthContext';

const LogisticsContext = createContext();

export function LogisticsProvider({ children }) {
  const { user, updateUserWallet } = useAuth();

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('loadlink_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('loadlink_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('loadlink_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem('loadlink_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('loadlink_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('loadlink_messages', JSON.stringify(messages));
  }, [messages]);

  // Corridor & Waypoint Matching Engine
  const searchTrips = ({ origin, destination, weightKg = 0, volumeM3 = 0 }) => {
    return trips.filter(trip => {
      // 1. Capacity check
      if (weightKg > 0 && trip.availableWeightKg < Number(weightKg)) return false;
      if (volumeM3 > 0 && trip.availableVolumeM3 < Number(volumeM3)) return false;

      // If no cities specified, return all active trips
      if (!origin && !destination) return true;

      const waypoints = trip.waypoints.map(w => w.name.toLowerCase());
      const originQuery = (origin || '').toLowerCase().trim();
      const destQuery = (destination || '').toLowerCase().trim();

      // Find indices in the corridor
      const originIdx = originQuery 
        ? waypoints.findIndex(w => w.includes(originQuery) || originQuery.includes(w))
        : 0;

      const destIdx = destQuery
        ? waypoints.findIndex(w => w.includes(destQuery) || destQuery.includes(w))
        : waypoints.length - 1;

      // Check if both matched in forward transit sequence
      if (originQuery && originIdx === -1) return false;
      if (destQuery && destIdx === -1) return false;
      if (originIdx >= destIdx) return false;

      return true;
    });
  };

  // Instant Booking & Capacity Lock with Escrow Hold
  const bookSpaceInstantly = ({
    tripId,
    pickupCity,
    dropoffCity,
    pickupAddress,
    dropoffAddress,
    cargoDescription,
    category = 'general',
    weightKg = 50,
    volumeM3 = 0.5,
    isExpress = false
  }) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const weight = Number(weightKg);
    const volume = Number(volumeM3);

    if (trip.availableWeightKg < weight) {
      throw new Error(`Insufficient weight capacity. Only ${trip.availableWeightKg} kg available.`);
    }
    if (trip.availableVolumeM3 < volume) {
      throw new Error(`Insufficient volume capacity. Only ${trip.availableVolumeM3} m³ available.`);
    }

    const distanceKm = calculateDistanceKm(pickupCity, dropoffCity);
    const quote = calculateFreightQuote({
      origin: pickupCity,
      destination: dropoffCity,
      weightKg: weight,
      volumeM3: volume,
      category,
      isExpress,
      customDistance: distanceKm
    });

    // Generate secure 4-digit handoff OTPs
    const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newBookingId = `bkg_${Date.now()}`;

    const newBooking = {
      id: newBookingId,
      tripId: trip.id,
      shipperId: user?.id || 'usr_shipper_1',
      shipperName: user?.name || 'Rahul Sharma',
      shipperPhone: user?.phone || '+91 98765 43210',
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      vehicleNumber: trip.vehicleNumber,
      truckModel: trip.truckModel,

      pickupCity,
      dropoffCity,
      pickupAddress: pickupAddress || `${pickupCity} City Center Warehouse`,
      dropoffAddress: dropoffAddress || `${dropoffCity} Destination Hub`,

      cargoDescription,
      category,
      weightKg: weight,
      volumeM3: volume,

      distanceKm: quote.distanceKm,
      totalFare: quote.totalFare,
      platformFee: quote.platformFee,
      driverEarnings: quote.driverEarnings,
      escrowStatus: 'HELD_IN_ESCROW',

      pickupOtp,
      deliveryOtp,
      status: 'CONFIRMED',

      createdAt: new Date().toISOString(),
      pickupVerifiedAt: null,
      deliveryVerifiedAt: null,
      proofNote: '',
      carbonSavedKg: quote.carbonSavedKg
    };

    // Deduct available capacity from the trip immediately
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          availableWeightKg: Math.max(0, t.availableWeightKg - weight),
          availableVolumeM3: Math.max(0, Number((t.availableVolumeM3 - volume).toFixed(2)))
        };
      }
      return t;
    }));

    // Deduct escrow amount from user wallet
    if (user) {
      updateUserWallet(user.id, -quote.totalFare);
    }

    // Save booking
    setBookings(prev => [newBooking, ...prev]);

    // Initial greeting in chat
    const initialMsg = {
      id: `msg_${Date.now()}`,
      bookingId: newBookingId,
      senderId: 'system',
      senderName: 'LoadLink Dispatcher',
      text: `🚀 Space confirmed! Trip: ${pickupCity} to ${dropoffCity}. Escrow ₹${quote.totalFare} securely held. Pickup OTP: ${pickupOtp}.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, initialMsg]);

    return newBooking;
  };

  // Driver posts a new trip with flexible corridor stops
  const postNewTrip = (tripPayload) => {
    const waypointsArray = (tripPayload.waypoints || []).map((wp, idx) => ({
      name: typeof wp === 'string' ? wp : wp.name,
      eta: typeof wp === 'string' ? `Stop ${idx + 1}` : (wp.eta || `Stop ${idx + 1}`),
      completed: idx === 0
    }));

    const totalWeight = Number(tripPayload.totalWeightCapacityKg) || 3000;
    const availableWeight = Number(tripPayload.availableWeightKg) || totalWeight;
    const totalVol = Number(tripPayload.totalVolumeM3) || 25;
    const availableVol = Number(tripPayload.availableVolumeM3) || totalVol;

    const newTrip = {
      id: `trip_${Date.now()}`,
      driverId: user?.id || 'usr_driver_1',
      driverName: user?.name || 'Gurpreet Singh',
      driverPhone: user?.phone || '+91 98112 34567',
      driverRating: user?.driverDetails?.rating || 4.9,
      driverAvatar: user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      vehicleNumber: tripPayload.vehicleNumber || user?.driverDetails?.vehicleNumber || 'HR 55 AH 8892',
      truckModel: tripPayload.truckModel || user?.driverDetails?.truckModel || 'Tata Signa 4825.TK',
      truckType: tripPayload.truckType || 'Heavy Closed Container',

      origin: tripPayload.origin,
      destination: tripPayload.destination,
      waypoints: waypointsArray,
      currentWaypointIndex: 0,
      departureDate: tripPayload.departureDate || new Date().toISOString().split('T')[0],
      departureTime: tripPayload.departureTime || '12:00',

      totalWeightCapacityKg: totalWeight,
      availableWeightKg: availableWeight,
      totalVolumeM3: totalVol,
      availableVolumeM3: availableVol,

      baseRatePerKm: Number(tripPayload.baseRatePerKm) || 3.20,
      pricePerKg: Number(tripPayload.pricePerKg) || 3.50,
      status: 'SCHEDULED',
      notes: tripPayload.notes || 'Empty return space available. Realtime GPS tracked.',
      features: ['Realtime GPS', 'Waterproof Container', 'Instant Booking']
    };

    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  // Driver verifies Pickup OTP
  const verifyPickupOtp = (bookingId, inputOtp) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.pickupOtp.trim() !== inputOtp.trim()) {
      throw new Error('Invalid Pickup OTP. Please check with the shipper.');
    }

    const updatedTime = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'PICKED_UP_IN_TRANSIT',
          pickupVerifiedAt: updatedTime
        };
      }
      return b;
    }));

    // Update trip status if needed
    setTrips(prev => prev.map(t => {
      if (t.id === booking.tripId) {
        return { ...t, status: 'ACTIVE_ON_ROAD' };
      }
      return t;
    }));

    // Add status message to chat
    setMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        bookingId,
        senderId: 'system',
        senderName: 'System Verification',
        text: '✅ Cargo picked up and verified! Truck is now en-route. Live GPS tracking active.',
        timestamp: updatedTime
      }
    ]);

    return true;
  };

  // Driver verifies Delivery OTP -> Releases Escrow Payment
  const verifyDeliveryOtp = (bookingId, inputOtp, proofNote = '') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.deliveryOtp.trim() !== inputOtp.trim()) {
      throw new Error('Invalid Delivery OTP. Please ask receiver for the 4-digit code.');
    }

    const updatedTime = new Date().toISOString();

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'DELIVERED',
          escrowStatus: 'RELEASED_TO_DRIVER',
          deliveryVerifiedAt: updatedTime,
          proofNote: proofNote || 'Delivered safely and inspected by consignee.'
        };
      }
      return b;
    }));

    // Release payout into Driver's wallet!
    updateUserWallet(booking.driverId, booking.driverEarnings);

    // Add system confirmation message to chat
    setMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        bookingId,
        senderId: 'system',
        senderName: 'Escrow Settlement',
        text: `🎉 Cargo delivered successfully! Escrow payout of ₹${booking.driverEarnings.toLocaleString()} has been released to Driver ${booking.driverName}.`,
        timestamp: updatedTime
      }
    ]);

    return true;
  };

  // Simulates Driver moving along Highway waypoints
  const advanceTripWaypoint = (tripId) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const nextIdx = Math.min(t.waypoints.length - 1, t.currentWaypointIndex + 1);
        const updatedWaypoints = t.waypoints.map((w, i) => ({
          ...w,
          completed: i <= nextIdx
        }));
        return {
          ...t,
          currentWaypointIndex: nextIdx,
          waypoints: updatedWaypoints,
          status: nextIdx === t.waypoints.length - 1 ? 'COMPLETED' : 'ACTIVE_ON_ROAD'
        };
      }
      return t;
    }));
  };

  // Send in-app chat message
  const sendChatMessage = (bookingId, text) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      bookingId,
      senderId: user?.id || 'usr_shipper_1',
      senderName: user?.name || 'Rahul Sharma',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    // Simulated driver auto-response if shipper sent message
    if (user?.role === 'SHIPPER') {
      setTimeout(() => {
        const responses = [
          'Acknowledged! The cargo is secure in the locked container.',
          'Driving smoothly along the national highway, ETA on schedule.',
          'Approaching the next toll plaza, will update on arrival.',
          'Please ensure the receiver is available with the delivery OTP code.'
        ];
        const randomResp = responses[Math.floor(Math.random() * responses.length)];
        setMessages(m => [
          ...m,
          {
            id: `msg_${Date.now() + 1}`,
            bookingId,
            senderId: 'usr_driver_1',
            senderName: 'Gurpreet Singh (Driver)',
            text: randomResp,
            timestamp: new Date().toISOString()
          }
        ]);
      }, 1200);
    }
  };

  // Cancel booking and refund
  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Refund escrow to shipper
    updateUserWallet(booking.shipperId, booking.totalFare);

    // Restore truck space
    setTrips(prev => prev.map(t => {
      if (t.id === booking.tripId) {
        return {
          ...t,
          availableWeightKg: t.availableWeightKg + booking.weightKg,
          availableVolumeM3: Number((t.availableVolumeM3 + booking.volumeM3).toFixed(2))
        };
      }
      return t;
    }));

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED', escrowStatus: 'REFUNDED' } : b));
  };

  // Compute platform aggregate stats
  const platformStats = {
    totalTripsCount: trips.length,
    activeTripsCount: trips.filter(t => t.status === 'ACTIVE_ON_ROAD' || t.status === 'SCHEDULED').length,
    totalFreightTonnes: Number((bookings.reduce((acc, b) => acc + (b.weightKg || 0), 0) / 1000).toFixed(1)) + 42.8,
    totalCarbonSavedKg: Math.round(bookings.reduce((acc, b) => acc + (b.carbonSavedKg || 0), 0) + 1280),
    totalEscrowGMV: bookings.reduce((acc, b) => acc + (b.totalFare || 0), 0) + 184500,
    totalEscrowHeld: bookings.filter(b => b.escrowStatus === 'HELD_IN_ESCROW').reduce((acc, b) => acc + (b.totalFare || 0), 0)
  };

  return (
    <LogisticsContext.Provider value={{
      trips,
      bookings,
      messages,
      platformStats,
      searchTrips,
      bookSpaceInstantly,
      postNewTrip,
      verifyPickupOtp,
      verifyDeliveryOtp,
      advanceTripWaypoint,
      sendChatMessage,
      cancelBooking
    }}>
      {children}
    </LogisticsContext.Provider>
  );
}

export const useLogistics = () => useContext(LogisticsContext);
