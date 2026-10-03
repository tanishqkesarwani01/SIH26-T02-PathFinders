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

// Seed the SIH 2026 3 Corridors Demo Scenario (Lucknow-Varanasi, Prayagraj-New Delhi, Gorakhpur-Meerut)
router.post('/seed', (req, res) => {
  try {
    const data = db.seedDemoScenario();
    res.json({
      message: 'SIH 2026 3 Freight Corridors (Lucknow-Varanasi, Prayagraj-New Delhi, Gorakhpur-Meerut) seeded successfully!',
      counts: {
        users: data.users.length,
        trips: data.trips.length,
        shipments: data.shipments.length,
        payments: data.payments.length,
        ratings: data.ratings.length
      },
      scenarios: [
        {
          corridor: 'Lucknow → Varanasi',
          driver: 'Ramesh Verma (Tata 14ft Container - UP-32-BZ-7890)',
          routesAvailable: ['Route A: NH731 / Purvanchal', 'Route B: Raebareli / Prayagraj', 'Route C: Ayodhya / Akbarpur'],
          shipmentsCount: 3
        },
        {
          corridor: 'Prayagraj → New Delhi',
          driver: 'Harish Chandra Yadav (BharatBenz 24ft Multi-Axle - UP-70-ET-4521)',
          routesAvailable: ['Route A: Yamuna / Agra-Lucknow Exp', 'Route B: NH19 Grand Trunk Road', 'Route C: Central Awadh Bypass'],
          shipmentsCount: 3
        },
        {
          corridor: 'Gorakhpur → Meerut',
          driver: 'Balwant Singh (Ashok Leyland 17ft High Deck - UP-53-CK-3108)',
          routesAvailable: ['Route A: Express Purvanchal-Bareilly', 'Route B: NH27 Northern Highway', 'Route C: Western NCR Link via Hardoi'],
          shipmentsCount: 3
        }
      ]
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
