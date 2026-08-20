
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const users = db.getUsers();
  const trips = db.getTrips();
  const bookings = db.getBookings();

  const totalDrivers = users.filter(u => u.role === 'DRIVER').length;
  const totalShippers = users.filter(u => u.role === 'SHIPPER').length;
  const activeTrips = trips.filter(t => t.status === 'SCHEDULED' || t.status === 'ACTIVE').length;
  
  const completedBookings = bookings.filter(b => b.status === 'DELIVERED');
  const totalGMV = bookings.reduce((sum, b) => sum + (b.calculatedPrice || 0), 0);
  const totalShipperSavings = bookings.reduce((sum, b) => sum + (b.savingsVsDedicatedTruck || 0), 0);
  const totalTonnageMovedKg = bookings.reduce((sum, b) => sum + (b.weightKg || 0), 0);
  
  // Approximate CO2 emissions prevented
  const co2PreventedKg = Math.round((totalTonnageMovedKg / 1000) * 450 * 0.15);

  res.json({
    stats: {
      totalUsers: users.length,
      totalDrivers,
      totalShippers,
      activeTrips,
      totalTrips: trips.length,
      totalBookings: bookings.length,
      completedBookingsCount: completedBookings.length,
      totalGMV,
      platformRevenue: Math.round(totalGMV * 0.12),
      totalShipperSavings,
      totalTonnageMovedKg,
      co2PreventedKg
    }
  });
});

router.get('/drivers', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const drivers = db.getUsers().filter(u => u.role === 'DRIVER');
  res.json({ drivers });
});

router.put('/drivers/:id/verify', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const { status } = req.body; // VERIFIED or REJECTED
  const updated = db.updateUser(req.params.id, { kycStatus: status || 'VERIFIED' });
  if (!updated) return res.status(404).json({ error: 'Driver not found' });
  res.json({ message: Driver KYC set to , driver: updated });
});

module.exports = router;
