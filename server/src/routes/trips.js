const express = require('express');
const router = express.Router();
const db = require('../db');
const { 
  generateCandidateRoutes, 
  matchTripRoutes, 
  scanEnRouteProximityConsignments,
  getCityCoords 
} = require('../services/matchingEngine');

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

// Scan for en-route consignments within 10 km proximity radius
router.get('/:id/proximity-consignments', (req, res) => {
  try {
    const trip = db.findTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const { lat, lng, radiusKm = 10 } = req.query;
    const currentCoords = (lat && lng) 
      ? { lat: Number(lat), lng: Number(lng) }
      : getCityCoords(trip.source);

    const allShipments = db.getShipments();
    const opportunities = scanEnRouteProximityConsignments(trip, currentCoords, Number(radiusKm) || 10, allShipments);

    res.json({
      tripId: trip.id,
      scannedCoords: currentCoords,
      proximityRadiusKm: Number(radiusKm) || 10,
      count: opportunities.length,
      opportunities
    });
  } catch (err) {
    console.error('Proximity scan error:', err);
    res.status(500).json({ error: 'Failed to scan proximity consignments' });
  }
});

// Interactive Simulator: Simulate truck at ANY GPS coordinate or waypoint along the route and detect proximity consignments
router.post('/:id/simulate-enroute-opportunity', (req, res) => {
  try {
    const trip = db.findTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const { lat, lng, radiusKm = 10, locationName } = req.body;
    let truckSimCoords;

    if (lat !== undefined && lng !== undefined) {
      truckSimCoords = { lat: Number(lat), lng: Number(lng) };
    } else {
      const activeRoute = (trip.routes || []).find(r => r.id === trip.selectedRouteId) || trip.routes?.[0];
      const stops = activeRoute?.stops || [
        { name: trip.source, ...getCityCoords(trip.source) },
        { name: trip.destination, ...getCityCoords(trip.destination) }
      ];
      // Pick middle waypoint or first forward stop
      const targetStop = stops[1] || stops[0];
      truckSimCoords = {
        lat: targetStop.lat + 0.03,
        lng: targetStop.lng - 0.04
      };
    }

    const allShipments = db.getShipments();
    const opportunities = scanEnRouteProximityConsignments(trip, truckSimCoords, Number(radiusKm) || 10, allShipments);

    res.json({
      message: `🚚 Dynamic 10km Proximity Detection Active at (${truckSimCoords.lat.toFixed(4)}, ${truckSimCoords.lng.toFixed(4)})`,
      truckCurrentLocation: locationName || 'Forward Corridor',
      truckCoords: truckSimCoords,
      proximityOpportunities: opportunities
    });
  } catch (err) {
    console.error('Simulate en-route opportunity error:', err);
    res.status(500).json({ error: 'Failed to simulate en-route opportunity' });
  }
});

// Driver Choice: ACCEPT En-Route Consignment
router.post('/:id/accept-enroute-consignment', (req, res) => {
  try {
    const { shipmentId } = req.body;
    const trip = db.findTripById(req.params.id);
    const shipment = db.findShipmentById(shipmentId);

    if (!trip || !shipment) {
      return res.status(404).json({ error: 'Trip or Shipment not found' });
    }

    if (shipment.weightKg > trip.availableCapacityKg) {
      return res.status(400).json({ error: 'Not enough capacity remaining in truck for this en-route consignment' });
    }

    // 1. Update Shipment
    const updatedShipment = db.updateShipment(shipment.id, {
      status: 'BOOKED',
      assignedTripId: trip.id,
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      paymentStatus: 'ESCROW_HELD'
    });

    // 2. Update Trip space & accepted list
    const newCurrentLoad = (trip.currentLoadKg || 0) + shipment.weightKg;
    const newAvail = Math.max(0, trip.totalCapacityKg - newCurrentLoad);
    const acceptedIds = Array.from(new Set([...(trip.acceptedShipmentIds || []), shipment.id]));

    // 3. Dynamically insert pickup & drop waypoints into active route if not present
    const updatedRoutes = (trip.routes || []).map(r => {
      if (r.id !== trip.selectedRouteId && trip.selectedRouteId) return r;
      const currentStops = [...(r.stops || [])];
      const pCoords = shipment.pickupCoords || (shipment.pickup?.lat ? shipment.pickup : getCityCoords(shipment.pickupLocation));
      const dCoords = shipment.dropCoords || (shipment.drop?.lat ? shipment.drop : getCityCoords(shipment.dropLocation));

      const hasPickup = currentStops.some(s => haversineDistance(s.lat, s.lng, pCoords.lat, pCoords.lng) < 3);
      if (!hasPickup && pCoords) {
        // Insert before destination
        currentStops.splice(Math.max(1, currentStops.length - 1), 0, {
          name: shipment.pickupLocation || shipment.pickup?.name || 'En-Route Pickup',
          lat: pCoords.lat,
          lng: pCoords.lng,
          type: 'enroute_pickup'
        });
      }

      const hasDrop = currentStops.some(s => haversineDistance(s.lat, s.lng, dCoords.lat, dCoords.lng) < 3);
      if (!hasDrop && dCoords) {
        currentStops.splice(Math.max(1, currentStops.length - 1), 0, {
          name: shipment.dropLocation || shipment.drop?.name || 'En-Route Drop',
          lat: dCoords.lat,
          lng: dCoords.lng,
          type: 'enroute_drop'
        });
      }

      return { ...r, stops: currentStops };
    });

    const updatedTrip = db.updateTrip(trip.id, {
      currentLoadKg: newCurrentLoad,
      availableCapacityKg: newAvail,
      acceptedShipmentIds: acceptedIds,
      routes: updatedRoutes
    });

    // 3. Create Assignment
    db.createAssignment({
      id: `asg_enroute_${Date.now()}`,
      tripId: trip.id,
      shipmentId: shipment.id,
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    });

    // 4. Create Escrow Payment record
    db.createPayment({
      id: `pay_enroute_${Date.now()}`,
      shipmentId: shipment.id,
      senderId: shipment.senderId,
      driverId: trip.driverId,
      amount: shipment.fareEstimate?.totalFare || 900,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    });

    // 5. Create Status Log
    db.createStatusLog({
      shipmentId: shipment.id,
      status: 'BOOKED',
      location: shipment.pickupLocation,
      notes: `Driver ${trip.driverName} accepted this en-route 10km proximity pickup.`
    });

    res.json({
      message: '✅ En-route consignment accepted! Added to trip load with escrow locked.',
      trip: updatedTrip,
      shipment: updatedShipment
    });
  } catch (err) {
    console.error('Accept en-route consignment error:', err);
    res.status(500).json({ error: 'Failed to accept en-route consignment' });
  }
});

// Driver Choice: DECLINE En-Route Consignment
router.post('/:id/decline-enroute-consignment', (req, res) => {
  try {
    const { shipmentId, reason = 'Driver opted not to take en-route detour' } = req.body;
    res.json({
      message: 'Consignment declined/dismissed. Trip continues unaffected.',
      shipmentId,
      reason
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline consignment' });
  }
});

module.exports = router;

