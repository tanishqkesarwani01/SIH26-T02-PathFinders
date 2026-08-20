const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit a Driver Rating & Review
router.post('/', (req, res) => {
  try {
    const { shipmentId, driverId, senderId, senderName, rating, comment } = req.body;

    if (!driverId || !rating) {
      return res.status(400).json({ error: 'Driver ID and rating score (1-5) are required' });
    }

    const ratingVal = Math.min(5, Math.max(1, Number(rating)));
    const ratingRecord = {
      id: `rat_${Date.now()}`,
      shipmentId: shipmentId || null,
      driverId,
      senderId: senderId || 'usr_anonymous',
      senderName: senderName || 'Verified Shipper',
      rating: ratingVal,
      comment: comment || 'Smooth delivery and verified OTP verification.',
      createdAt: new Date().toISOString()
    };

    db.createRating(ratingRecord);

    // Update Driver Profile's Average Rating
    const allDriverRatings = db.getRatings(driverId);
    const avgScore = Number((allDriverRatings.reduce((sum, r) => sum + r.rating, 0) / allDriverRatings.length).toFixed(2));

    const driverUser = db.findUserById(driverId) || db.getUsers().find(u => u.role === 'DRIVER');
    if (driverUser) {
      db.updateUser(driverUser.id, {
        rating: avgScore,
        ratingCount: allDriverRatings.length
      });
    }

    res.status(201).json({
      message: 'Driver rated successfully. Thank you for building platform trust!',
      rating: ratingRecord,
      driverAverageRating: avgScore
    });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get all ratings for a driver
router.get('/:driverId', (req, res) => {
  try {
    const ratings = db.getRatings(req.params.driverId);
    res.json({ count: ratings.length, ratings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

module.exports = router;
