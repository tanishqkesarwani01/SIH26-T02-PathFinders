
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/:bookingId', authMiddleware, (req, res) => {
  const messages = db.getMessages(req.params.bookingId);
  res.json({ messages });
});

router.post('/', authMiddleware, (req, res) => {
  const { bookingId, text } = req.body;
  if (!bookingId || !text) {
    return res.status(400).json({ error: 'Booking ID and message text required' });
  }

  const newMsg = {
    id: msg_,
    bookingId,
    senderId: req.user.id,
    senderName: req.user.name,
    text,
    timestamp: new Date().toISOString()
  };

  db.createMessage(newMsg);
  res.status(201).json({ message: newMsg });
});

module.exports = router;
