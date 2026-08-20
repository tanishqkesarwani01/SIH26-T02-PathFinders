const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const shipmentRoutes = require('./routes/shipments');
const ratingRoutes = require('./routes/ratings');
const demoRoutes = require('./routes/demo');
const db = require('./db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/demo', demoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SIH 2026 Shared Logistics & Route Optimization Platform',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-time Event Management for Live Tracking
io.on('connection', (socket) => {
  socket.on('join_tracking', (shipmentId) => {
    socket.join(`shipment_${shipmentId}`);
  });

  socket.on('driver_location_update', (data) => {
    const { shipmentId, lat, lng, locationName, timestamp } = data;
    io.to(`shipment_${shipmentId}`).emit('location_changed', {
      shipmentId,
      lat,
      lng,
      locationName,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  socket.on('status_change', (data) => {
    io.emit('shipment_status_updated', data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚚 SIH Logistics Backend server running on http://localhost:${PORT}`);
});
