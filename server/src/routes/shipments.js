const express = require('express');
const router = express.Router();
const db = require('../db');
const { calculateFare } = require('../services/pricingEngine');
const { getCityCoords, isShipmentAlongRoute, haversineDistance } = require('../services/matchingEngine');

// Helper to generate 4-digit OTP
function generate4DigitOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Quick Fare Calculation API
router.get('/fare-estimate', (req, res) => {
  try {
    const { distanceKm, weightKg, packageType } = req.query;
    const result = calculateFare(distanceKm, weightKg, packageType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate fare' });
  }
});

// Create new Shipment Request (Sender)
router.post('/', (req, res) => {
  try {
    const {
      senderId,
      senderName,
      senderPhone,
      pickupLocation,
      dropLocation,
      weightKg,
      packageType,
      packageDescription,
      pickupTimeWindow,
      deliveryDeadline,
      distanceKm: customDist
    } = req.body;

    if (!pickupLocation || !dropLocation || !weightKg) {
      return res.status(400).json({ error: 'Pickup location, drop location, and weight are required' });
    }

    const pCoords = getCityCoords(pickupLocation);
    const dCoords = getCityCoords(dropLocation);
    const calculatedDist = customDist ? Number(customDist) : Math.max(25, haversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng) * 1.25);
    const fareEstimate = calculateFare(calculatedDist, weightKg, packageType);

    const pickupOtp = generate4DigitOtp();
    const deliveryOtp = generate4DigitOtp();
    const shipmentId = `shp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newShipment = {
      id: shipmentId,
      senderId: senderId || 'usr_snd_anonymous',
      senderName: senderName || 'Business Shipper',
      senderPhone: senderPhone || '+91 9800000000',
      pickupLocation,
      pickupCoords: pCoords,
      dropLocation,
      dropCoords: dCoords,
      distanceKm: calculatedDist,
      weightKg: Number(weightKg),
      packageType: packageType || 'Standard / General',
      packageDescription: packageDescription || 'Commercial cargo',
      pickupTimeWindow: pickupTimeWindow || 'Within 4 Hours',
      deliveryDeadline: deliveryDeadline || 'Same Day Evening',
      fareEstimate,
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      driverName: null,
      driverPhone: null,
      pickupOtp,
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp,
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    db.createShipment(newShipment);

    db.createStatusLog({
      shipmentId,
      status: 'PENDING',
      location: pickupLocation,
      notes: 'Shipment created and awaiting driver corridor match.'
    });

    res.status(201).json({
      message: 'Shipment request created successfully',
      shipment: newShipment
    });
  } catch (err) {
    console.error('Create shipment error:', err);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// List all shipments (with optional filters)
router.get('/', (req, res) => {
  try {
    const { senderId, status } = req.query;
    let shipments = db.getShipments();

    if (senderId) {
      shipments = shipments.filter(s => s.senderId === senderId);
    }
    if (status) {
      shipments = shipments.filter(s => s.status === status);
    }

    res.json({ count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get Single Shipment Details & Tracking Log & Matching Trips
router.get('/:id', (req, res) => {
  try {
    const shipment = db.findShipmentById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const logs = db.getStatusLogs(shipment.id);
    const assignedTrip = shipment.assignedTripId ? db.findTripById(shipment.assignedTripId) : null;
    const payment = db.findPaymentByShipment(shipment.id);

    // Find available trips that match this shipment
    const allTrips = db.getTrips().filter(t => t.status === 'SCHEDULED' && t.availableCapacityKg >= shipment.weightKg);
    const matchingTrips = allTrips.map(trip => {
      const activeRoute = (trip.routes || []).find(r => r.id === trip.selectedRouteId) || trip.routes?.[0];
      const matchCheck = activeRoute ? isShipmentAlongRoute(activeRoute, shipment) : { compatible: true, detourKm: 5 };
      return {
        trip,
        activeRoute,
        isCompatible: matchCheck.compatible,
        detourKm: matchCheck.detourKm || 0
      };
    }).filter(m => m.isCompatible);

    res.json({
      shipment,
      logs,
      assignedTrip,
      payment,
      matchingTrips
    });
  } catch (err) {
    console.error('Shipment fetch error:', err);
    res.status(500).json({ error: 'Failed to load shipment details' });
  }
});

// Sender reserves / books a slot on an active truck trip
router.post('/:id/book-trip', (req, res) => {
  try {
    const { tripId } = req.body;
    const shipment = db.findShipmentById(req.params.id);
    const trip = db.findTripById(tripId);

    if (!shipment || !trip) {
      return res.status(404).json({ error: 'Shipment or Trip not found' });
    }

    if (trip.availableCapacityKg < shipment.weightKg) {
      return res.status(400).json({ error: 'Insufficient available capacity in this truck' });
    }

    // Update shipment state
    const updatedShipment = db.updateShipment(shipment.id, {
      status: 'BOOKED',
      assignedTripId: trip.id,
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      paymentStatus: 'ESCROW_HELD'
    });

    // Update trip capacity
    const newCurrentLoad = (trip.currentLoadKg || 0) + shipment.weightKg;
    const newAvail = Math.max(0, trip.totalCapacityKg - newCurrentLoad);
    const acceptedIds = [...(trip.acceptedShipmentIds || []), shipment.id];

    const updatedTrip = db.updateTrip(trip.id, {
      currentLoadKg: newCurrentLoad,
      availableCapacityKg: newAvail,
      acceptedShipmentIds: acceptedIds
    });

    // Create payment in Escrow
    const payment = {
      id: `pay_${Date.now()}`,
      shipmentId: shipment.id,
      senderId: shipment.senderId,
      driverId: trip.driverId,
      amount: shipment.fareEstimate?.totalFare || 500,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    };
    db.createPayment(payment);

    // Create status log
    db.createStatusLog({
      shipmentId: shipment.id,
      status: 'BOOKED',
      location: shipment.pickupLocation,
      notes: `Space booked with Driver ${trip.driverName} (${trip.vehicleNumber}). ₹${payment.amount} held safely in Escrow.`
    });

    res.json({
      message: 'Truck space successfully booked! Payment secured in escrow.',
      shipment: updatedShipment,
      trip: updatedTrip,
      payment
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to book truck slot' });
  }
});

// Pickup Verification: Driver enters Sender's Pickup OTP + uploads parcel condition photo
router.post('/:id/verify-pickup', (req, res) => {
  try {
    const { enteredOtp, photoData } = req.body;
    const shipment = db.findShipmentById(req.params.id);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    if (shipment.pickupOtp !== String(enteredOtp).trim()) {
      return res.status(400).json({ error: 'Invalid Pickup OTP. Please ask the sender for the 4-digit code.' });
    }

    const updated = db.updateShipment(shipment.id, {
      pickupOtpVerified: true,
      pickupPhoto: photoData || shipment.pickupPhoto || 'parcel_pickup_verified.jpg',
      status: 'PICKED_UP'
    });

    db.createStatusLog({
      shipmentId: shipment.id,
      status: 'PICKED_UP',
      location: shipment.pickupLocation,
      notes: 'Pickup OTP verified & parcel loaded into truck cargo hold.'
    });

    res.json({
      message: 'Pickup verified successfully! Status changed to PICKED_UP.',
      shipment: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify pickup' });
  }
});

// Delivery Verification: Sender/Receiver enters Delivery OTP + uploads handover photo -> Payment Released
router.post('/:id/verify-delivery', (req, res) => {
  try {
    const { enteredOtp, photoData } = req.body;
    const shipment = db.findShipmentById(req.params.id);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    if (shipment.deliveryOtp !== String(enteredOtp).trim()) {
      return res.status(400).json({ error: 'Invalid Delivery OTP. Please enter the 4-digit delivery security code.' });
    }

    const updated = db.updateShipment(shipment.id, {
      deliveryOtpVerified: true,
      deliveryPhoto: photoData || shipment.deliveryPhoto || 'parcel_delivery_proof.jpg',
      status: 'DELIVERED',
      paymentStatus: 'COMPLETED'
    });

    // Release Escrow Payment to Driver
    const payment = db.findPaymentByShipment(shipment.id);
    if (payment) {
      db.updatePayment(payment.id, {
        paymentStatus: 'COMPLETED',
        releasedAt: new Date().toISOString()
      });
    }

    db.createStatusLog({
      shipmentId: shipment.id,
      status: 'DELIVERED',
      location: shipment.dropLocation,
      notes: 'Delivery OTP verified & handover complete. ₹' + (shipment.fareEstimate?.totalFare || 'fare') + ' released to driver wallet.'
    });

    res.json({
      message: 'Delivery confirmed! Escrow payment has been released to the driver.',
      shipment: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify delivery' });
  }
});

module.exports = router;
