const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data/db.json');

class Database {
  constructor() {
    this.init();
  }

  init() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
      this.resetToEmpty();
    } else {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        this.ensureSchema();
      } catch (err) {
        this.resetToEmpty();
      }
    }
  }

  ensureSchema() {
    const defaultTables = {
      users: [],
      drivers: [],
      vehicles: [],
      trips: [],
      shipments: [],
      assignments: [],
      shipment_status_logs: [],
      payments: [],
      ratings: [],
      messages: []
    };
    let modified = false;
    for (const key of Object.keys(defaultTables)) {
      if (!this.data[key]) {
        this.data[key] = [];
        modified = true;
      }
    }
    if (modified) this.save();
  }

  resetToEmpty() {
    this.data = {
      users: [],
      drivers: [],
      vehicles: [],
      trips: [],
      shipments: [],
      assignments: [],
      shipment_status_logs: [],
      payments: [],
      ratings: [],
      messages: []
    };
    this.save();
    return this.data;
  }

  save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Users
  getUsers() { return this.data.users || []; }
  findUserById(id) { return this.getUsers().find(u => u.id === id); }
  findUserByEmail(email) { return this.getUsers().find(u => u.email?.toLowerCase() === email?.toLowerCase()); }
  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Drivers
  getDrivers() { return this.data.drivers || []; }
  findDriverById(id) { return this.getDrivers().find(d => d.id === id || d.userId === id); }
  createDriver(driver) {
    this.data.drivers.push(driver);
    this.save();
    return driver;
  }
  updateDriver(id, updates) {
    const idx = this.data.drivers.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.drivers[idx] = { ...this.data.drivers[idx], ...updates };
      this.save();
      return this.data.drivers[idx];
    }
    return null;
  }

  // Vehicles
  getVehicles() { return this.data.vehicles || []; }
  findVehicleById(id) { return this.getVehicles().find(v => v.id === id); }
  findVehiclesByDriver(driverId) { return this.getVehicles().filter(v => v.driverId === driverId); }
  createVehicle(vehicle) {
    this.data.vehicles.push(vehicle);
    this.save();
    return vehicle;
  }

  // Trips
  getTrips() { return this.data.trips || []; }
  findTripById(id) { return this.getTrips().find(t => t.id === id); }
  createTrip(trip) {
    this.data.trips.unshift(trip);
    this.save();
    return trip;
  }
  updateTrip(id, updates) {
    const idx = this.data.trips.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.trips[idx] = { ...this.data.trips[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.trips[idx];
    }
    return null;
  }

  // Shipments
  getShipments() { return this.data.shipments || []; }
  findShipmentById(id) { return this.getShipments().find(s => s.id === id); }
  createShipment(shipment) {
    this.data.shipments.unshift(shipment);
    this.save();
    return shipment;
  }
  updateShipment(id, updates) {
    const idx = this.data.shipments.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.shipments[idx] = { ...this.data.shipments[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.shipments[idx];
    }
    return null;
  }

  // Assignments
  getAssignments() { return this.data.assignments || []; }
  findAssignmentById(id) { return this.getAssignments().find(a => a.id === id); }
  createAssignment(assignment) {
    this.data.assignments.unshift(assignment);
    this.save();
    return assignment;
  }
  updateAssignment(id, updates) {
    const idx = this.data.assignments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.assignments[idx] = { ...this.data.assignments[idx], ...updates };
      this.save();
      return this.data.assignments[idx];
    }
    return null;
  }

  // Status Logs
  getStatusLogs(shipmentId) {
    return (this.data.shipment_status_logs || []).filter(l => !shipmentId || l.shipmentId === shipmentId);
  }
  createStatusLog(log) {
    this.data.shipment_status_logs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...log
    });
    this.save();
    return log;
  }

  // Payments
  getPayments() { return this.data.payments || []; }
  findPaymentByShipment(shipmentId) { return this.getPayments().find(p => p.shipmentId === shipmentId); }
  createPayment(payment) {
    this.data.payments.unshift(payment);
    this.save();
    return payment;
  }
  updatePayment(id, updates) {
    const idx = this.data.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.payments[idx] = { ...this.data.payments[idx], ...updates };
      this.save();
      return this.data.payments[idx];
    }
    return null;
  }

  // Ratings
  getRatings(driverId) {
    return (this.data.ratings || []).filter(r => !driverId || r.driverId === driverId);
  }
  createRating(rating) {
    this.data.ratings.unshift(rating);
    this.save();
    return rating;
  }

  // Messages
  getMessages(shipmentId) {
    return (this.data.messages || []).filter(m => m.shipmentId === shipmentId);
  }
  createMessage(msg) {
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  // Demo Seed helper
  seedDemoScenario() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('demo123', salt);

    const driverUser = {
      id: 'usr_drv_ramesh',
      name: 'Ramesh Verma',
      email: 'ramesh.driver@loadlink.com',
      passwordHash,
      role: 'DRIVER',
      phone: '+91 9839012345',
      aadhaarNumber: 'XXXX-XXXX-8921',
      aadhaarVerified: true,
      rating: 4.85,
      ratingCount: 38,
      createdAt: new Date().toISOString()
    };

    const sender1 = {
      id: 'usr_snd_priya',
      name: 'Priya Sharma (Retail Goods)',
      email: 'priya@textiles.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 9415098765',
      aadhaarNumber: 'XXXX-XXXX-4532',
      aadhaarVerified: true,
      rating: 4.9,
      ratingCount: 14,
      createdAt: new Date().toISOString()
    };

    const sender2 = {
      id: 'usr_snd_vikram',
      name: 'Vikram Singh (ElectroHub)',
      email: 'vikram@electrohub.in',
      passwordHash,
      role: 'SENDER',
      phone: '+91 9792044321',
      aadhaarNumber: 'XXXX-XXXX-6712',
      aadhaarVerified: true,
      rating: 4.8,
      ratingCount: 9,
      createdAt: new Date().toISOString()
    };

    const vehicle = {
      id: 'veh_up32_7890',
      driverId: 'drv_ramesh',
      userId: 'usr_drv_ramesh',
      registrationNumber: 'UP-32-BZ-7890',
      vehicleType: 'Medium LCV (14ft Container)',
      capacityKg: 5000,
      currentLoadKg: 1800,
      availableCapacityKg: 3200,
      features: ['GPS Realtime', 'Waterproof Container', 'FastTag Enabled']
    };

    const driverRecord = {
      id: 'drv_ramesh',
      userId: 'usr_drv_ramesh',
      name: 'Ramesh Verma',
      licenseNumber: 'UP32-2018-0098421',
      vehicleId: 'veh_up32_7890',
      status: 'VERIFIED',
      experienceYears: 7
    };

    const tripLucknowVaranasi = {
      id: 'trip_lko_vns_01',
      driverId: 'drv_ramesh',
      driverUserId: 'usr_drv_ramesh',
      driverName: 'Ramesh Verma',
      driverPhone: '+91 9839012345',
      driverRating: 4.85,
      vehicleId: 'veh_up32_7890',
      vehicleNumber: 'UP-32-BZ-7890',
      vehicleType: 'Medium LCV (14ft Container)',
      source: 'Lucknow',
      destination: 'Varanasi',
      departureDate: new Date(Date.now() + 3600000 * 3).toISOString().split('T')[0],
      departureTime: '10:30 AM',
      totalCapacityKg: 5000,
      currentLoadKg: 1800,
      availableCapacityKg: 3200,
      selectedRouteId: 'route_A',
      routes: [
        {
          id: 'route_A',
          name: 'Route A: Direct NH31 / Purvanchal Corridor',
          corridor: 'Lucknow → Sultanpur → Jaunpur → Varanasi',
          distanceKm: 310,
          estimatedDurationHours: 6.0,
          stops: [
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
            { name: 'Sultanpur', lat: 26.2648, lng: 82.0727, type: 'hub' },
            { name: 'Jaunpur', lat: 25.7464, lng: 82.6837, type: 'hub' },
            { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
          ],
          color: '#10b981',
          isRecommended: true
        },
        {
          id: 'route_B',
          name: 'Route B: Southern Highway via Raebareli & Prayagraj',
          corridor: 'Lucknow → Raebareli → Prayagraj (Allahabad) → Varanasi',
          distanceKm: 335,
          estimatedDurationHours: 6.8,
          stops: [
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
            { name: 'Raebareli', lat: 26.2236, lng: 81.2409, type: 'hub' },
            { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'hub' },
            { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
          ],
          color: '#3b82f6',
          isRecommended: false
        },
        {
          id: 'route_C',
          name: 'Route C: Northern Heritage via Ayodhya & Akbarpur',
          corridor: 'Lucknow → Ayodhya (Faizabad) → Akbarpur → Varanasi',
          distanceKm: 355,
          estimatedDurationHours: 7.2,
          stops: [
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
            { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
            { name: 'Akbarpur', lat: 26.4355, lng: 82.5414, type: 'hub' },
            { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'destination' }
          ],
          color: '#f59e0b',
          isRecommended: false
        }
      ],
      status: 'SCHEDULED',
      acceptedShipmentIds: ['shp_demo_101'],
      notes: 'Scheduled container route. Clean dry bed with space for bundled cartons and parcels.',
      createdAt: new Date().toISOString()
    };

    // 1. Initial Booked Baseline Shipment
    const shipment1 = {
      id: 'shp_demo_101',
      senderId: 'usr_snd_priya',
      senderName: 'Priya Sharma (Retail Goods)',
      senderPhone: '+91 9415098765',
      pickupLocation: 'Lucknow (Transport Nagar)',
      pickupCoords: { lat: 26.7794, lng: 80.8872, name: 'Lucknow' },
      dropLocation: 'Sultanpur (Civil Lines)',
      dropCoords: { lat: 26.2648, lng: 82.0727, name: 'Sultanpur' },
      distanceKm: 140,
      weightKg: 650,
      packageType: 'Clothing & Textiles',
      packageDescription: '15 Boxes of Cotton Kurtis & Fabrics',
      pickupTimeWindow: 'Today 10:00 AM - 12:00 PM',
      deliveryDeadline: 'Today 06:00 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 280,
        weightFee: 650,
        packageMultiplier: 1.0,
        totalFare: 980
      },
      status: 'BOOKED',
      assignedTripId: 'trip_lko_vns_01',
      driverId: 'drv_ramesh',
      driverName: 'Ramesh Verma',
      driverPhone: '+91 9839012345',
      pickupOtp: '4819',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '7302',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'ESCROW_HELD',
      createdAt: new Date().toISOString()
    };

    // 2. Shipment near Haidergarh
    const shipmentA = {
      id: 'SHIP-A-HAIDERGARH',
      senderId: 'usr_snd_haidergarh',
      senderName: 'Manoj Tiwari (Agro Supplies)',
      senderPhone: '+91 98380 44551',
      pickupLocation: 'Haidergarh (Toll Plaza Hub)',
      pickupCoords: { lat: 26.6980, lng: 81.3340, name: 'Haidergarh' },
      dropLocation: 'Sultanpur (Gole Market)',
      dropCoords: { lat: 26.2648, lng: 82.0727, name: 'Sultanpur' },
      distanceKm: 92,
      weightKg: 300,
      packageType: 'Agricultural Produce & Seeds',
      packageDescription: '8 Sacks of Certified Organic Wheat Seeds',
      pickupTimeWindow: 'Today 11:00 AM - 01:00 PM',
      deliveryDeadline: 'Today 05:00 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 184,
        weightFee: 300,
        packageMultiplier: 1.1,
        totalFare: 640
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '2941',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '8103',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 3. Shipment near Nihalgarh
    const shipmentB = {
      id: 'SHIP-B-NIHALGARH',
      senderId: 'usr_snd_nihalgarh_mishra',
      senderName: 'Rajesh Mishra (Auto Spares)',
      senderPhone: '+91 94150 77890',
      pickupLocation: 'Nihalgarh (Highway Bypass)',
      pickupCoords: { lat: 26.6025, lng: 81.6520, name: 'Nihalgarh' },
      dropLocation: 'Sultanpur (Civil Lines Hub)',
      dropCoords: { lat: 26.2648, lng: 82.0727, name: 'Sultanpur' },
      distanceKm: 58,
      weightKg: 450,
      packageType: 'Industrial Hardware & Spares',
      packageDescription: '10 Cartons of Precision Auto Components',
      pickupTimeWindow: 'Today 11:30 AM - 01:00 PM',
      deliveryDeadline: 'Today 06:00 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 116,
        weightFee: 450,
        packageMultiplier: 1.25,
        totalFare: 823
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '5812',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '7490',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 4. Shipment near Sultanpur
    const shipmentC = {
      id: 'SHIP-C-SULTANPUR',
      senderId: 'usr_snd_vikram',
      senderName: 'Vikram Singh (ElectroHub)',
      senderPhone: '+91 97920 44321',
      pickupLocation: 'Sultanpur (Amhat Bypass)',
      pickupCoords: { lat: 26.2550, lng: 82.0810, name: 'Sultanpur' },
      dropLocation: 'Jaunpur (Mandi Complex)',
      dropCoords: { lat: 25.7464, lng: 82.6837, name: 'Jaunpur' },
      distanceKm: 75,
      weightKg: 600,
      packageType: 'Electronics & Appliances',
      packageDescription: '12 Solar Inverters & Batteries',
      pickupTimeWindow: 'Today 02:00 PM - 04:00 PM',
      deliveryDeadline: 'Today 08:00 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 150,
        weightFee: 600,
        packageMultiplier: 1.15,
        totalFare: 780
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '6251',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '8914',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 5. Shipment near Jaunpur
    const shipmentD = {
      id: 'SHIP-D-JAUNPUR',
      senderId: 'usr_snd_jaunpur',
      senderName: 'Alok Gupta (Textile Exporters)',
      senderPhone: '+91 94500 88219',
      pickupLocation: 'Jaunpur (Polytechnic Chauraha)',
      pickupCoords: { lat: 25.7464, lng: 82.6837, name: 'Jaunpur' },
      dropLocation: 'Varanasi (Lanka Gate)',
      dropCoords: { lat: 25.2818, lng: 82.9995, name: 'Varanasi' },
      distanceKm: 62,
      weightKg: 200,
      packageType: 'Handloom & Carpets',
      packageDescription: '5 Bundles of Handloom Fabrics',
      pickupTimeWindow: 'Today 04:00 PM - 06:00 PM',
      deliveryDeadline: 'Today 09:30 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 124,
        weightFee: 200,
        packageMultiplier: 1.1,
        totalFare: 560
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '3381',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '9120',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 6. Non-Compatible Shipment (Towards Delhi - opposite direction/huge detour)
    const shipmentOutOfCorridor = {
      id: 'SHIP-X-DELHI',
      senderId: 'usr_snd_delhi_bound',
      senderName: 'Amit Saxena (Machinery)',
      senderPhone: '+91 98110 33442',
      pickupLocation: 'Haidergarh (Bypass)',
      pickupCoords: { lat: 26.6980, lng: 81.3340, name: 'Haidergarh' },
      dropLocation: 'Delhi (Connaught Place)',
      dropCoords: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
      distanceKm: 560,
      weightKg: 400,
      packageType: 'Heavy Machinery Part',
      packageDescription: '1 Metal Lathe Assembly',
      pickupTimeWindow: 'Today',
      deliveryDeadline: 'Tomorrow',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 1120,
        weightFee: 400,
        packageMultiplier: 1.0,
        totalFare: 1570
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '9901',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '1102',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };


    const payment1 = {
      id: 'pay_demo_01',
      shipmentId: 'shp_demo_101',
      senderId: 'usr_snd_priya',
      driverId: 'drv_ramesh',
      amount: 980,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    };

    const assignment1 = {
      id: 'asg_demo_01',
      tripId: 'trip_lko_vns_01',
      shipmentId: 'shp_demo_101',
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    };

    const statusLog1 = {
      id: 'log_demo_01',
      shipmentId: 'shp_demo_101',
      timestamp: new Date().toISOString(),
      status: 'BOOKED',
      location: 'Lucknow Transport Nagar',
      notes: 'Shipment confirmed and locked in Driver Ramesh trip route.'
    };

    this.data = {
      users: [driverUser, sender1, sender2],
      drivers: [driverRecord],
      vehicles: [vehicle],
      trips: [tripLucknowVaranasi],
      shipments: [shipment1, shipmentA, shipmentB, shipmentC, shipmentD, shipmentOutOfCorridor],
      assignments: [assignment1],
      shipment_status_logs: [statusLog1],
      payments: [payment1],

      ratings: [
        {
          id: 'rat_sample_01',
          shipmentId: 'shp_past_001',
          driverId: 'drv_ramesh',
          senderId: 'usr_snd_priya',
          senderName: 'Priya Sharma',
          rating: 5,
          comment: 'Very professional driver. Timely pickup at Lucknow and verified OTP smoothly.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ],
      messages: []
    };

    this.save();
    return this.data;
  }
}

module.exports = new Database();
