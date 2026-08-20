
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { calculateFreightQuote } = require('../services/pricingService');
const { generateOtp, verifyOtp } = require('../services/otpService');
const { getCityDistance } = require('../services/routingService');

// Live Quote Calculator (Public)
router.post('/quote', (req, res) => {
  try {
    const { origin, destination, weightKg, volumeCbm, cargoType, isUrgent, vehicleType } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const quote = calculateFreightQuote({
      origin,
      destination,
      weightKg: parseFloat(weightKg) || 100,
      volumeCbm: parseFloat(volumeCbm) || 0.5,
      cargoType: cargoType || 'Standard',
      isUrgent: Boolean(isUrgent),
      vehicleType: vehicleType || 'Medium LCV'
    });

    res.json({ quote });
  } catch (err) {
    console.error('Quote calculation error', err);
    res.status(500).json({ error: 'Failed to calculate quote' });
  }
});

// Get user bookings (Driver or Shipper)
router.get('/my-bookings', authMiddleware, (req, res) => {
  const allBookings = db.getBookings();
  let userBookings;

  if (req.user.role === 'DRIVER') {
    userBookings = allBookings.filter(b => b.driverId === req.user.id);
  } else if (req.user.role === 'SHIPPER') {
    userBookings = allBookings.filter(b => b.shipperId === req.user.id);
  } else {
    // ADMIN
    userBookings = allBookings;
  }

  res.json({ bookings: userBookings });
});

// Get single booking
router.get('/:id', authMiddleware, (req, res) => {
  const booking = db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ booking });
});

// Create booking request (Shipper)
router.post('/', authMiddleware, requireRole('SHIPPER', 'ADMIN'), (req, res) => {
  try {
    const {
      tripId,
      pickupLocation,
      dropLocation,
      cargoDescription,
      cargoType,
      weightKg,
      volumeCbm,
      declaredValue,
      recipientName,
      recipientPhone
    } = req.body;

    const trip = db.findTripById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Selected truck trip not found' });
    }

    const reqWeight = parseFloat(weightKg) || 50;
    const reqVol = parseFloat(volumeCbm) || 0.5;

    if (trip.availableCapacityWeight < reqWeight) {
      return res.status(400).json({ error: Not enough weight capacity on truck. Available:  kg });
    }

    if (trip.availableCapacityVolume < reqVol) {
      return res.status(400).json({ error: Not enough volume capacity on truck. Available:  CBM });
    }

    const distance = getCityDistance(pickupLocation || trip.origin, dropLocation || trip.destination);
    const quote = calculateFreightQuote({
      origin: pickupLocation || trip.origin,
      destination: dropLocation || trip.destination,
      distanceKm: distance,
      weightKg: reqWeight,
      volumeCbm: reqVol,
      cargoType: cargoType || 'Standard',
      vehicleType: trip.vehicleType
    });

    const pickupOtp = generateOtp();
    const deliveryOtp = generateOtp();

    const newBooking = {
      id: k_,
      tripId: trip.id,
      shipperId: req.user.id,
      shipperName: req.user.name,
      shipperPhone: req.user.phone || '+91 9100000000',
      recipientName: recipientName || req.user.name,
      recipientPhone: recipientPhone || req.user.phone || '+91 9100000000',
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      pickupLocation: pickupLocation || trip.origin,
      dropLocation: dropLocation || trip.destination,
      distanceKm: distance,
      cargoDescription: cargoDescription || 'General Goods & Merchandise',
      cargoType: cargoType || 'Standard',
      weightKg: reqWeight,
      volumeCbm: reqVol,
      declaredValue: parseFloat(declaredValue) || 50000,
      calculatedPrice: quote.calculatedPrice,
      savingsVsDedicatedTruck: quote.savingsVsDedicatedTruck,
      status: 'REQUESTED', // REQUESTED -> ACCEPTED -> IN_TRANSIT -> DELIVERED
      pickupOtp,
      pickupOtpVerified: false,
      deliveryOtp,
      deliveryOtpVerified: false,
      paymentStatus: 'ESCROW_HELD',
      pickupTime: null,
      deliveryTime: null,
      proofPhotos: [],
      createdAt: new Date().toISOString()
    };

    db.createBooking(newBooking);

    // Initial coordination message
    db.createMessage({
      id: msg_,
      bookingId: newBooking.id,
      senderId: req.user.id,
      senderName: req.user.name,
      text: Hi , I have submitted a shipment request for kg from  to .,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ booking: newBooking, message: 'Booking request sent to driver' });
  } catch (err) {
    console.error('Create booking error', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Driver Accepts Booking
router.put('/:id/accept', authMiddleware, requireRole('DRIVER', 'ADMIN'), (req, res) => {
  const booking = db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const trip = db.findTripById(booking.tripId);
  if (trip) {
    // Lock capacity
    const newAvailWeight = Math.max(0, trip.availableCapacityWeight - booking.weightKg);
    const newAvailVol = Math.max(0, trip.availableCapacityVolume - booking.volumeCbm);
    db.updateTrip(trip.id, {
      availableCapacityWeight: newAvailWeight,
      availableCapacityVolume: newAvailVol
    });
  }

  const updated = db.updateBooking(booking.id, { status: 'ACCEPTED' });

  db.createMessage({
    id: msg_,
    bookingId: booking.id,
    senderId: req.user.id,
    senderName: req.user.name,
    text: Booking accepted! I will contact you before arriving at . Keep the Pickup OTP ready.,
    timestamp: new Date().toISOString()
  });

  res.json({ booking: updated, message: 'Booking accepted successfully' });
});

// Driver Rejects Booking
router.put('/:id/reject', authMiddleware, requireRole('DRIVER', 'ADMIN'), (req, res) => {
  const booking = db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const updated = db.updateBooking(booking.id, { status: 'REJECTED' });
  res.json({ booking: updated, message: 'Booking rejected' });
});

// Driver Verifies Pickup OTP
router.post('/:id/verify-pickup', authMiddleware, requireRole('DRIVER', 'ADMIN'), (req, res) => {
  const { otp } = req.body;
  const booking = db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (!verifyOtp(otp, booking.pickupOtp)) {
    return res.status(400).json({ error: 'Invalid Pickup OTP. Please ask the shipper for the correct 6-digit code.' });
  }

  const updated = db.updateBooking(booking.id, {
    status: 'IN_TRANSIT',
    pickupOtpVerified: true,
    pickupTime: new Date().toISOString()
  });

  db.createMessage({
    id: msg_,
    bookingId: booking.id,
    senderId: req.user.id,
    senderName: req.user.name,
    text: Cargo picked up and verified with Pickup OTP! Consignment is now IN TRANSIT to .,
    timestamp: new Date().toISOString()
  });

  res.json({ booking: updated, message: 'Pickup OTP verified! Shipment is now IN TRANSIT.' });
});

// Driver Verifies Delivery OTP (Handover to Recipient)
router.post('/:id/verify-delivery', authMiddleware, requireRole('DRIVER', 'ADMIN'), (req, res) => {
  const { otp, proofNotes } = req.body;
  const booking = db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (!verifyOtp(otp, booking.deliveryOtp)) {
    return res.status(400).json({ error: 'Invalid Delivery OTP. Please ask the recipient for the 6-digit delivery code.' });
  }

  const updated = db.updateBooking(booking.id, {
    status: 'DELIVERED',
    deliveryOtpVerified: true,
    deliveryTime: new Date().toISOString(),
    paymentStatus: 'RELEASED',
    proofNotes: proofNotes || 'Successfully delivered in good condition'
  });

  db.createMessage({
    id: msg_,
    bookingId: booking.id,
    senderId: req.user.id,
    senderName: req.user.name,
    text: Cargo delivered successfully and verified with Delivery OTP! Payment of ₹ released to driver wallet. Thank you!,
    timestamp: new Date().toISOString()
  });

  res.json({ booking: updated, message: 'Delivery OTP verified! Consignment completed and payment released.' });
});

module.exports = router;
