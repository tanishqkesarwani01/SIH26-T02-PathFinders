const express = require('express');
const router = express.Router();
const db = require('../db');

// Reset database to completely empty state
router.post('/reset', (req, res) => {
  try {
    db.resetToEmpty();
    res.json({
      message: 'Database has been reset to empty state. No preloaded users, trips, or shipments.',
      counts: {
        users: 0,
        trips: 0,
        shipments: 0,
        payments: 0,
        ratings: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Seed the SIH 2026 Lucknow -> Varanasi Demo Scenario
router.post('/seed', (req, res) => {
  try {
    const data = db.seedDemoScenario();
    res.json({
      message: 'SIH 2026 Lucknow → Varanasi demo corridor and shipments seeded successfully!',
      counts: {
        users: data.users.length,
        trips: data.trips.length,
        shipments: data.shipments.length,
        payments: data.payments.length,
        ratings: data.ratings.length
      },
      scenario: {
        driver: 'Ramesh Verma (Tata 14ft LCV - Lucknow → Varanasi)',
        routesAvailable: ['Route A: NH31 / Sultanpur', 'Route B: Raebareli / Prayagraj', 'Route C: Ayodhya / Akbarpur'],
        candidateShipments: [
          'Lucknow → Sultanpur (650 kg Textiles)',
          'Sultanpur → Varanasi (420 kg Electronics)',
          'Raebareli → Prayagraj (800 kg Hardware)'
        ]
      }
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Failed to seed demo scenario' });
  }
});

// Get Live System Overview Stats
router.get('/stats', (req, res) => {
  try {
    const users = db.getUsers();
    const trips = db.getTrips();
    const shipments = db.getShipments();
    const payments = db.getPayments();
    const ratings = db.getRatings();

    const totalWeightMovedKg = shipments
      .filter(s => s.status === 'DELIVERED' || s.status === 'IN_TRANSIT')
      .reduce((sum, s) => sum + (s.weightKg || 0), 0);

    const totalRevenueGenerated = payments
      .filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'ESCROW_HELD')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      totalUsers: users.length,
      driversCount: users.filter(u => u.role === 'DRIVER').length,
      sendersCount: users.filter(u => u.role === 'SENDER').length,
      totalTrips: trips.length,
      activeTrips: trips.filter(t => t.status === 'SCHEDULED' || t.status === 'IN_TRANSIT').length,
      totalShipments: shipments.length,
      pendingShipments: shipments.filter(s => s.status === 'PENDING').length,
      inTransitShipments: shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PICKED_UP').length,
      deliveredShipments: shipments.filter(s => s.status === 'DELIVERED').length,
      totalWeightMovedKg,
      totalRevenueGenerated,
      totalRatings: ratings.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
