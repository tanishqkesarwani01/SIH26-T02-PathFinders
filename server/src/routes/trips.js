const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateCandidateRoutes, matchTripRoutes } = require('../services/matchingEngine');

// Create a new Driver Trip
router.post('/', (req, res) => {
  try {
    const {
      driverId,
      driverUserId,
      driverName,
      driverPhone,
      source,
      destination,
      departureDate,
      departureTime,
      totalCapacityKg,
      currentLoadKg,
      vehicleNumber,
      vehicleType,
      notes
    } = req.body;

    if (!source || !destination || !totalCapacityKg) {
      return res.status(400).json({ error: 'Source, destination, and total capacity are required' });
    }

    const totalCap = Number(totalCapacityKg) || 5000;
    const curLoad = Number(currentLoadKg) || 0;
    const availCap = Math.max(0, totalCap - curLoad);

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const candidateRoutes = generateCandidateRoutes(source, destination);

    const newTrip = {
      id: tripId,
      driverId: driverId || 'drv_manual',
      driverUserId: driverUserId || null,
      driverName: driverName || 'Driver Partner',
      driverPhone: driverPhone || '+91 9800000000',
      driverRating: 4.9,
      vehicleNumber: vehicleNumber || 'UP-32-TR-1001',
      vehicleType: vehicleType || 'Medium LCV',
      source,
      destination,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      departureTime: departureTime || '10:00 AM',
      totalCapacityKg: totalCap,
      currentLoadKg: curLoad,
      availableCapacityKg: availCap,
      selectedRouteId: candidateRoutes[0]?.id || 'route_A',
      routes: candidateRoutes,
      status: 'SCHEDULED',
      acceptedShipmentIds: [],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    db.createTrip(newTrip);
    res.status(201).json({ message: 'Trip created successfully', trip: newTrip });
  } catch (err) {
    console.error('Trip create error:', err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// List all trips
router.get('/', (req, res) => {
  try {
    const trips = db.getTrips();
    res.json({ count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get Trip Details with Intelligent Multi-Route Matching Evaluator
router.get('/:id', (req, res) => {
  try {
    const trip = db.findTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const allShipments = db.getShipments();
    const evaluatedRoutes = matchTripRoutes(trip, allShipments);

    // Also get currently booked/accepted shipments for this trip
    const bookedShipments = allShipments.filter(s => s.assignedTripId === trip.id);

    res.json({
      trip,
      evaluatedRoutes,
      bookedShipments,
      selectedRoute: evaluatedRoutes.find(r => r.id === trip.selectedRouteId) || evaluatedRoutes[0]
    });
  } catch (err) {
    console.error('Trip fetch error:', err);
    res.status(500).json({ error: 'Failed to load trip details' });
  }
});

// Driver selects active corridor route (Route A, B, or C)
router.post('/:id/select-route', (req, res) => {
  try {
    const { routeId } = req.body;
    const trip = db.findTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updated = db.updateTrip(trip.id, { selectedRouteId: routeId });
    res.json({ message: `Active corridor updated to ${routeId}`, trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to select route' });
  }
});

// Driver accepts a shipment into their vehicle capacity
router.post('/:id/accept-shipment', (req, res) => {
  try {
    const { shipmentId } = req.body;
    const trip = db.findTripById(req.params.id);
    const shipment = db.findShipmentById(shipmentId);

    if (!trip || !shipment) {
      return res.status(404).json({ error: 'Trip or Shipment not found' });
    }

    if (shipment.weightKg > trip.availableCapacityKg) {
      return res.status(400).json({ error: 'Shipment weight exceeds available truck capacity' });
    }

    // Update shipment
    const updatedShipment = db.updateShipment(shipment.id, {
      status: 'BOOKED',
      assignedTripId: trip.id,
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      paymentStatus: 'ESCROW_HELD'
    });

    // Update trip capacity & accepted list
    const newCurrentLoad = (trip.currentLoadKg || 0) + shipment.weightKg;
    const newAvail = Math.max(0, trip.totalCapacityKg - newCurrentLoad);
    const acceptedIds = [...(trip.acceptedShipmentIds || []), shipment.id];

    const updatedTrip = db.updateTrip(trip.id, {
      currentLoadKg: newCurrentLoad,
      availableCapacityKg: newAvail,
      acceptedShipmentIds: acceptedIds
    });

    // Create assignment & status log
    db.createAssignment({
      id: `asg_${Date.now()}`,
      tripId: trip.id,
      shipmentId: shipment.id,
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    });

    db.createStatusLog({
      shipmentId: shipment.id,
      status: 'BOOKED',
      location: trip.source,
      notes: `Driver ${trip.driverName} accepted the shipment for corridor delivery.`
    });

    res.json({
      message: 'Shipment accepted into truck cargo hold',
      trip: updatedTrip,
      shipment: updatedShipment
    });
  } catch (err) {
    console.error('Accept shipment error:', err);
    res.status(500).json({ error: 'Failed to accept shipment' });
  }
});

// Driver rejects or dismisses a shipment match
router.post('/:id/reject-shipment', (req, res) => {
  try {
    const { shipmentId } = req.body;
    res.json({ message: 'Shipment dismissed from recommendations', shipmentId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dismiss shipment' });
  }
});

// Update trip journey status (SCHEDULED -> IN_TRANSIT -> COMPLETED)
router.post('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const trip = db.findTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updated = db.updateTrip(trip.id, { status });

    // If trip started transit, update accepted shipments
    if (status === 'IN_TRANSIT') {
      const shipments = db.getShipments().filter(s => s.assignedTripId === trip.id && s.status === 'PICKED_UP');
      for (const s of shipments) {
        db.updateShipment(s.id, { status: 'IN_TRANSIT' });
        db.createStatusLog({
          shipmentId: s.id,
          status: 'IN_TRANSIT',
          location: trip.source,
          notes: 'Truck departed on designated highway corridor.'
        });
      }
    }

    res.json({ message: `Trip status updated to ${status}`, trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip status' });
  }
});

module.exports = router;
