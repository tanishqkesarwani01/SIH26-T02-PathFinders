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
      bookings: [],
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
      bookings: [],
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

  // Bookings
  getBookings() { return this.data.bookings || []; }
  findBookingById(id) { return this.getBookings().find(b => b.id === id); }
  createBooking(booking) {
    if (!this.data.bookings) this.data.bookings = [];
    this.data.bookings.unshift(booking);
    this.save();
    return booking;
  }
  updateBooking(id, updates) {
    if (!this.data.bookings) this.data.bookings = [];
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.bookings[idx];
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

  // Demo Seed helper: 3 Distinct Corridors (Lucknow->Varanasi, Prayagraj->New Delhi, Gorakhpur->Meerut)
  seedDemoScenario() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('demo123', salt);

    // 1. Driver Profiles (3 Distinct Drivers)
    const driverRamesh = {
      id: 'usr_drv_ramesh',
      name: 'Ramesh Verma',
      email: 'ramesh.driver@loadlink.com',
      passwordHash,
      role: 'DRIVER',
      phone: '+91 98390 12345',
      aadhaarNumber: 'XXXX-XXXX-8921',
      aadhaarVerified: true,
      rating: 4.85,
      ratingCount: 38,
      createdAt: new Date().toISOString()
    };

    const driverHarish = {
      id: 'usr_drv_harish',
      name: 'Harish Chandra Yadav',
      email: 'harish.driver@loadlink.com',
      passwordHash,
      role: 'DRIVER',
      phone: '+91 94152 66780',
      aadhaarNumber: 'XXXX-XXXX-3419',
      aadhaarVerified: true,
      rating: 4.92,
      ratingCount: 54,
      createdAt: new Date().toISOString()
    };

    const driverBalwant = {
      id: 'usr_drv_balwant',
      name: 'Balwant Singh',
      email: 'balwant.driver@loadlink.com',
      passwordHash,
      role: 'DRIVER',
      phone: '+91 98381 99234',
      aadhaarNumber: 'XXXX-XXXX-7612',
      aadhaarVerified: true,
      rating: 4.88,
      ratingCount: 42,
      createdAt: new Date().toISOString()
    };

    // 2. Sender Profiles
    const senderPriya = {
      id: 'usr_snd_priya',
      name: 'Priya Sharma (Retail Goods)',
      email: 'priya@textiles.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 94150 98765',
      aadhaarNumber: 'XXXX-XXXX-4532',
      aadhaarVerified: true,
      rating: 4.9,
      ratingCount: 14,
      createdAt: new Date().toISOString()
    };

    const senderRajesh = {
      id: 'usr_snd_rajesh',
      name: 'Rajesh Mishra (Auto Spares)',
      email: 'rajesh.spares@gmail.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 94150 77890',
      aadhaarNumber: 'XXXX-XXXX-7714',
      aadhaarVerified: true,
      rating: 4.8,
      ratingCount: 11,
      createdAt: new Date().toISOString()
    };

    const senderVikram = {
      id: 'usr_snd_vikram',
      name: 'Vikram Singh (ElectroHub)',
      email: 'vikram@electrohub.in',
      passwordHash,
      role: 'SENDER',
      phone: '+91 97920 44321',
      aadhaarNumber: 'XXXX-XXXX-6712',
      aadhaarVerified: true,
      rating: 4.8,
      ratingCount: 9,
      createdAt: new Date().toISOString()
    };

    const senderAmitabh = {
      id: 'usr_snd_amitabh',
      name: 'Amitabh Sen (Industrial Glassware)',
      email: 'amitabh.sen@ananyaglass.in',
      passwordHash,
      role: 'SENDER',
      phone: '+91 98180 55123',
      aadhaarNumber: 'XXXX-XXXX-9104',
      aadhaarVerified: true,
      rating: 4.95,
      ratingCount: 22,
      createdAt: new Date().toISOString()
    };

    const senderSunil = {
      id: 'usr_snd_sunil',
      name: 'Sunil Chaurasia (Leather & Footwear Exports)',
      email: 'sunil@chaurasialeather.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 94151 22345',
      aadhaarNumber: 'XXXX-XXXX-3382',
      aadhaarVerified: true,
      rating: 4.85,
      ratingCount: 17,
      createdAt: new Date().toISOString()
    };

    const senderManish = {
      id: 'usr_snd_manish',
      name: 'Manish Agarwal (Auto Die-Castings)',
      email: 'manish@agarwalfoundry.in',
      passwordHash,
      role: 'SENDER',
      phone: '+91 98370 11982',
      aadhaarNumber: 'XXXX-XXXX-5521',
      aadhaarVerified: true,
      rating: 4.75,
      ratingCount: 8,
      createdAt: new Date().toISOString()
    };

    const senderDevendra = {
      id: 'usr_snd_devendra',
      name: 'Devendra Pandey (Terai Agro Mills)',
      email: 'devendra@terairice.in',
      passwordHash,
      role: 'SENDER',
      phone: '+91 98392 33411',
      aadhaarNumber: 'XXXX-XXXX-6619',
      aadhaarVerified: true,
      rating: 4.9,
      ratingCount: 19,
      createdAt: new Date().toISOString()
    };

    const senderRamakant = {
      id: 'usr_snd_ramakant',
      name: 'Ramakant Tiwari (Wooden Handicrafts)',
      email: 'ramakant@ayodhyacrafts.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 94501 88920',
      aadhaarNumber: 'XXXX-XXXX-1943',
      aadhaarVerified: true,
      rating: 4.85,
      ratingCount: 13,
      createdAt: new Date().toISOString()
    };

    const senderFarhan = {
      id: 'usr_snd_farhan',
      name: 'Farhan Ansari (Cane & Bamboo Works)',
      email: 'farhan@rohilkhandcane.com',
      passwordHash,
      role: 'SENDER',
      phone: '+91 94122 77810',
      aadhaarNumber: 'XXXX-XXXX-8820',
      aadhaarVerified: true,
      rating: 4.8,
      ratingCount: 7,
      createdAt: new Date().toISOString()
    };

    // 3. Vehicles (3 Distinct Commercial Vehicles)
    const vehicle1 = {
      id: 'veh_up32_7890',
      driverId: 'drv_ramesh',
      userId: 'usr_drv_ramesh',
      registrationNumber: 'UP-32-BZ-7890',
      vehicleType: 'Medium LCV (14ft Container - Tata 1109)',
      capacityKg: 5000,
      currentLoadKg: 1800,
      availableCapacityKg: 3200,
      features: ['GPS Realtime', 'Waterproof Container', 'FastTag Enabled']
    };

    const vehicle2 = {
      id: 'veh_up70_4521',
      driverId: 'drv_harish',
      userId: 'usr_drv_harish',
      registrationNumber: 'UP-70-ET-4521',
      vehicleType: 'Heavy Multi-Axle (24ft Container - BharatBenz)',
      capacityKg: 12000,
      currentLoadKg: 4500,
      availableCapacityKg: 7500,
      features: ['GPS Telematics', 'Heavy Axle Bed', 'FastTag Enabled', 'Tarpaulin Cover']
    };

    const vehicle3 = {
      id: 'veh_up53_3108',
      driverId: 'drv_balwant',
      userId: 'usr_drv_balwant',
      registrationNumber: 'UP-53-CK-3108',
      vehicleType: 'Intermediate LCV (17ft Open High Deck - Ashok Leyland)',
      capacityKg: 7500,
      currentLoadKg: 2600,
      availableCapacityKg: 4900,
      features: ['GPS Realtime', 'High Side Deck', 'FastTag Enabled', 'Tailgate Lift']
    };

    // 4. Driver Records
    const driverRecord1 = {
      id: 'drv_ramesh',
      userId: 'usr_drv_ramesh',
      name: 'Ramesh Verma',
      licenseNumber: 'UP32-2018-0098421',
      vehicleId: 'veh_up32_7890',
      status: 'VERIFIED',
      experienceYears: 7
    };

    const driverRecord2 = {
      id: 'drv_harish',
      userId: 'usr_drv_harish',
      name: 'Harish Chandra Yadav',
      licenseNumber: 'UP70-2016-0043190',
      vehicleId: 'veh_up70_4521',
      status: 'VERIFIED',
      experienceYears: 10
    };

    const driverRecord3 = {
      id: 'drv_balwant',
      userId: 'usr_drv_balwant',
      name: 'Balwant Singh',
      licenseNumber: 'UP53-2017-0076211',
      vehicleId: 'veh_up53_3108',
      status: 'VERIFIED',
      experienceYears: 8
    };

    // 5. Trips (3 Distinct Routes with 3 Alternative Corridors Each)
    const trip1 = {
      id: 'trip_lko_vns_01',
      driverId: 'drv_ramesh',
      driverUserId: 'usr_drv_ramesh',
      driverName: 'Ramesh Verma',
      driverPhone: '+91 98390 12345',
      driverRating: 4.85,
      vehicleId: 'veh_up32_7890',
      vehicleNumber: 'UP-32-BZ-7890',
      vehicleType: 'Medium LCV (14ft Container - Tata 1109)',
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
          name: 'Route A: Direct NH731 / Purvanchal Corridor',
          corridor: 'Lucknow → Nihalgarh → Sultanpur → Jaunpur → Varanasi',
          distanceKm: 310,
          estimatedDurationHours: 6.0,
          stops: [
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'source' },
            { name: 'Nihalgarh', lat: 26.6025, lng: 81.6520, type: 'hub' },
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
          corridor: 'Lucknow → Raebareli → Prayagraj → Varanasi',
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
          corridor: 'Lucknow → Ayodhya → Akbarpur → Varanasi',
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
      acceptedShipmentIds: ['shp_lko_vns_101'],
      notes: 'Scheduled container route. Clean dry bed with space for bundled cartons and parcels.',
      createdAt: new Date().toISOString()
    };

    const trip2 = {
      id: 'trip_pry_del_02',
      driverId: 'drv_harish',
      driverUserId: 'usr_drv_harish',
      driverName: 'Harish Chandra Yadav',
      driverPhone: '+91 94152 66780',
      driverRating: 4.92,
      vehicleId: 'veh_up70_4521',
      vehicleNumber: 'UP-70-ET-4521',
      vehicleType: 'Heavy Multi-Axle (24ft Container - BharatBenz)',
      source: 'Prayagraj',
      destination: 'New Delhi',
      departureDate: new Date(Date.now() + 3600000 * 4).toISOString().split('T')[0],
      departureTime: '08:00 AM',
      totalCapacityKg: 12000,
      currentLoadKg: 4500,
      availableCapacityKg: 7500,
      selectedRouteId: 'route_A',
      routes: [
        {
          id: 'route_A',
          name: 'Route A: Yamuna & Agra-Lucknow Expressway Corridor',
          corridor: 'Prayagraj → Kanpur → Etawah → Agra → Greater Noida → New Delhi',
          distanceKm: 665,
          estimatedDurationHours: 9.5,
          stops: [
            { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
            { name: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'hub' },
            { name: 'Etawah', lat: 26.7855, lng: 79.0154, type: 'hub' },
            { name: 'Agra', lat: 27.1767, lng: 78.0081, type: 'hub' },
            { name: 'Greater Noida', lat: 28.4744, lng: 77.5040, type: 'hub' },
            { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
          ],
          color: '#10b981',
          isRecommended: true
        },
        {
          id: 'route_B',
          name: 'Route B: Grand Trunk Road / NH19 Corridor',
          corridor: 'Prayagraj → Fatehpur → Kanpur → Aligarh → Bulandshahr → New Delhi',
          distanceKm: 685,
          estimatedDurationHours: 10.5,
          stops: [
            { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
            { name: 'Fatehpur', lat: 25.9284, lng: 80.8130, type: 'hub' },
            { name: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'hub' },
            { name: 'Aligarh', lat: 27.8974, lng: 78.0880, type: 'hub' },
            { name: 'Bulandshahr', lat: 28.4070, lng: 77.8498, type: 'hub' },
            { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
          ],
          color: '#3b82f6',
          isRecommended: false
        },
        {
          id: 'route_C',
          name: 'Route C: Central Awadh & Rohilkhand Bypass',
          corridor: 'Prayagraj → Raebareli → Lucknow → Bareilly → Moradabad → New Delhi',
          distanceKm: 730,
          estimatedDurationHours: 11.5,
          stops: [
            { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'source' },
            { name: 'Raebareli', lat: 26.2236, lng: 81.2409, type: 'hub' },
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'hub' },
            { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
            { name: 'Moradabad', lat: 28.8386, lng: 78.7733, type: 'hub' },
            { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'destination' }
          ],
          color: '#f59e0b',
          isRecommended: false
        }
      ],
      status: 'SCHEDULED',
      acceptedShipmentIds: ['shp_pry_del_201'],
      notes: 'Heavy multi-axle freight carrier. High-capacity container bed suitable for palletized consignments.',
      createdAt: new Date().toISOString()
    };

    const trip3 = {
      id: 'trip_gkp_mrt_03',
      driverId: 'drv_balwant',
      driverUserId: 'usr_drv_balwant',
      driverName: 'Balwant Singh',
      driverPhone: '+91 98381 99234',
      driverRating: 4.88,
      vehicleId: 'veh_up53_3108',
      vehicleNumber: 'UP-53-CK-3108',
      vehicleType: 'Intermediate LCV (17ft Open High Deck - Ashok Leyland)',
      source: 'Gorakhpur',
      destination: 'Meerut',
      departureDate: new Date(Date.now() + 3600000 * 5).toISOString().split('T')[0],
      departureTime: '09:15 AM',
      totalCapacityKg: 7500,
      currentLoadKg: 2600,
      availableCapacityKg: 4900,
      selectedRouteId: 'route_A',
      routes: [
        {
          id: 'route_A',
          name: 'Route A: Express Corridor via Purvanchal & Bareilly',
          corridor: 'Gorakhpur → Ayodhya → Lucknow → Bareilly → Moradabad → Meerut',
          distanceKm: 690,
          estimatedDurationHours: 10.2,
          stops: [
            { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
            { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
            { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'hub' },
            { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
            { name: 'Moradabad', lat: 28.8386, lng: 78.7733, type: 'hub' },
            { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
          ],
          color: '#10b981',
          isRecommended: true
        },
        {
          id: 'route_B',
          name: 'Route B: Northern Highway NH27 / NH730 via Basti & Sitapur',
          corridor: 'Gorakhpur → Basti → Gonda → Sitapur → Bareilly → Meerut',
          distanceKm: 715,
          estimatedDurationHours: 11.0,
          stops: [
            { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
            { name: 'Basti', lat: 26.7963, lng: 82.7483, type: 'hub' },
            { name: 'Gonda', lat: 27.1340, lng: 81.9619, type: 'hub' },
            { name: 'Sitapur', lat: 27.5683, lng: 80.6829, type: 'hub' },
            { name: 'Bareilly', lat: 28.3670, lng: 79.4304, type: 'hub' },
            { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
          ],
          color: '#3b82f6',
          isRecommended: false
        },
        {
          id: 'route_C',
          name: 'Route C: Central Awadh & Western NCR Link via Hardoi',
          corridor: 'Gorakhpur → Ayodhya → Barabanki → Hardoi → Hapur → Meerut',
          distanceKm: 745,
          estimatedDurationHours: 11.8,
          stops: [
            { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, type: 'source' },
            { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, type: 'hub' },
            { name: 'Barabanki', lat: 26.9274, lng: 81.1834, type: 'hub' },
            { name: 'Hardoi', lat: 27.3956, lng: 80.1317, type: 'hub' },
            { name: 'Hapur', lat: 28.7306, lng: 77.7759, type: 'hub' },
            { name: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'destination' }
          ],
          color: '#f59e0b',
          isRecommended: false
        }
      ],
      status: 'SCHEDULED',
      acceptedShipmentIds: ['shp_gkp_mrt_301'],
      notes: 'Intermediate LCV route. High deck with waterproof tarpaulin protection for agricultural and manufactured goods.',
      createdAt: new Date().toISOString()
    };

    // 6. Shipments (3 Shipments for Each Route - 1 Booked Baseline + 2 En-Route Corridors)

    // Route 1 Shipments (Lucknow -> Varanasi)
    const shipmentLko1 = {
      id: 'shp_lko_vns_101',
      senderId: 'usr_snd_priya',
      senderName: 'Priya Sharma (Retail Goods)',
      senderPhone: '+91 94150 98765',
      pickupLocation: 'Lucknow (Transport Nagar)',
      pickupCoords: { lat: 26.7794, lng: 80.8872, name: 'Lucknow' },
      dropLocation: 'Varanasi (Lanka Gate)',
      dropCoords: { lat: 25.2818, lng: 82.9995, name: 'Varanasi' },
      distanceKm: 310,
      weightKg: 1200,
      packageType: 'Clothing & Textiles',
      packageDescription: '15 Boxes of Cotton Kurtis & Banarasi Fabrics',
      pickupTimeWindow: 'Today 10:00 AM - 12:00 PM',
      deliveryDeadline: 'Today 06:00 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 620,
        weightFee: 1200,
        packageMultiplier: 1.0,
        totalFare: 1870
      },
      status: 'BOOKED',
      assignedTripId: 'trip_lko_vns_01',
      driverId: 'drv_ramesh',
      driverName: 'Ramesh Verma',
      driverPhone: '+91 98390 12345',
      pickupOtp: '4819',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '7302',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'ESCROW_HELD',
      createdAt: new Date().toISOString()
    };

    const shipmentLko2 = {
      id: 'shp_lko_vns_102',
      senderId: 'usr_snd_rajesh',
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
        totalFare: 820
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

    const shipmentLko3 = {
      id: 'shp_lko_vns_103',
      senderId: 'usr_snd_vikram',
      senderName: 'Vikram Singh (ElectroHub)',
      senderPhone: '+91 97920 44321',
      pickupLocation: 'Jaunpur (Polytechnic Chauraha)',
      pickupCoords: { lat: 25.7464, lng: 82.6837, name: 'Jaunpur' },
      dropLocation: 'Varanasi (Cantonment Freight Yard)',
      dropCoords: { lat: 25.3280, lng: 82.9850, name: 'Varanasi' },
      distanceKm: 62,
      weightKg: 350,
      packageType: 'Electronics & Appliances',
      packageDescription: '8 Solar Inverters & Storage Batteries',
      pickupTimeWindow: 'Today 03:00 PM - 05:00 PM',
      deliveryDeadline: 'Today 08:30 PM',
      fareEstimate: {
        baseFee: 50,
        distanceFee: 124,
        weightFee: 350,
        packageMultiplier: 1.15,
        totalFare: 650
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

    // Route 2 Shipments (Prayagraj -> New Delhi)
    const shipmentPry1 = {
      id: 'shp_pry_del_201',
      senderId: 'usr_snd_amitabh',
      senderName: 'Amitabh Sen (Industrial Glassware)',
      senderPhone: '+91 98180 55123',
      pickupLocation: 'Prayagraj (Naini Industrial Area)',
      pickupCoords: { lat: 25.3900, lng: 81.8600, name: 'Prayagraj' },
      dropLocation: 'New Delhi (Okhla Industrial Area)',
      dropCoords: { lat: 28.5355, lng: 77.2750, name: 'New Delhi' },
      distanceKm: 665,
      weightKg: 3200,
      packageType: 'Glassware & Fragile',
      packageDescription: '40 Pallets of Heavy Borosilicate Industrial Glassware',
      pickupTimeWindow: 'Today 08:00 AM - 10:00 AM',
      deliveryDeadline: 'Tomorrow 08:00 AM',
      fareEstimate: {
        baseFee: 100,
        distanceFee: 2660,
        weightFee: 3200,
        packageMultiplier: 1.35,
        totalFare: 8400
      },
      status: 'BOOKED',
      assignedTripId: 'trip_pry_del_02',
      driverId: 'drv_harish',
      driverName: 'Harish Chandra Yadav',
      driverPhone: '+91 94152 66780',
      pickupOtp: '3194',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '6582',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'ESCROW_HELD',
      createdAt: new Date().toISOString()
    };

    const shipmentPry2 = {
      id: 'shp_pry_del_202',
      senderId: 'usr_snd_sunil',
      senderName: 'Sunil Chaurasia (Leather & Footwear Exports)',
      senderPhone: '+91 94151 22345',
      pickupLocation: 'Kanpur (Jajmau Leather Complex)',
      pickupCoords: { lat: 26.4350, lng: 80.3950, name: 'Kanpur' },
      dropLocation: 'Agra (Sikandra Transport Hub)',
      dropCoords: { lat: 27.2200, lng: 77.9400, name: 'Agra' },
      distanceKm: 275,
      weightKg: 1400,
      packageType: 'Leather & Finished Goods',
      packageDescription: '25 Cartons of Finished Leather Jackets & Saddlery',
      pickupTimeWindow: 'Today 12:00 PM - 02:00 PM',
      deliveryDeadline: 'Today 09:00 PM',
      fareEstimate: {
        baseFee: 80,
        distanceFee: 1100,
        weightFee: 1400,
        packageMultiplier: 1.1,
        totalFare: 3100
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '4421',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '7730',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const shipmentPry3 = {
      id: 'shp_pry_del_203',
      senderId: 'usr_snd_manish',
      senderName: 'Manish Agarwal (Auto Die-Castings)',
      senderPhone: '+91 98370 11982',
      pickupLocation: 'Agra (Foundry Nagar)',
      pickupCoords: { lat: 27.2000, lng: 78.0500, name: 'Agra' },
      dropLocation: 'Greater Noida (Ecotech Industrial Park)',
      dropCoords: { lat: 28.4600, lng: 77.5100, name: 'Greater Noida' },
      distanceKm: 165,
      weightKg: 1100,
      packageType: 'Heavy Machinery & Metal Castings',
      packageDescription: '18 Wooden Crates of Automotive Cast Iron Flanges',
      pickupTimeWindow: 'Today 04:00 PM - 06:00 PM',
      deliveryDeadline: 'Tomorrow 10:00 AM',
      fareEstimate: {
        baseFee: 80,
        distanceFee: 660,
        weightFee: 1100,
        packageMultiplier: 1.2,
        totalFare: 2600
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '8219',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '1943',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Route 3 Shipments (Gorakhpur -> Meerut)
    const shipmentGkp1 = {
      id: 'shp_gkp_mrt_301',
      senderId: 'usr_snd_devendra',
      senderName: 'Devendra Pandey (Terai Agro Mills)',
      senderPhone: '+91 98392 33411',
      pickupLocation: 'Gorakhpur (GIDA Industrial Hub)',
      pickupCoords: { lat: 26.7400, lng: 83.3100, name: 'Gorakhpur' },
      dropLocation: 'Meerut (Partapur Industrial Estate)',
      dropCoords: { lat: 28.9300, lng: 77.6500, name: 'Meerut' },
      distanceKm: 690,
      weightKg: 2200,
      packageType: 'Agricultural Produce & Seeds',
      packageDescription: '50 Sacks of Premium Terai Kalanamak Rice',
      pickupTimeWindow: 'Today 09:00 AM - 11:00 AM',
      deliveryDeadline: 'Tomorrow 11:00 AM',
      fareEstimate: {
        baseFee: 90,
        distanceFee: 2070,
        weightFee: 2200,
        packageMultiplier: 1.15,
        totalFare: 5600
      },
      status: 'BOOKED',
      assignedTripId: 'trip_gkp_mrt_03',
      driverId: 'drv_balwant',
      driverName: 'Balwant Singh',
      driverPhone: '+91 98381 99234',
      pickupOtp: '7204',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '9135',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'ESCROW_HELD',
      createdAt: new Date().toISOString()
    };

    const shipmentGkp2 = {
      id: 'shp_gkp_mrt_302',
      senderId: 'usr_snd_ramakant',
      senderName: 'Ramakant Tiwari (Wooden Handicrafts)',
      senderPhone: '+91 94501 88920',
      pickupLocation: 'Ayodhya (Naya Ghat Bypass)',
      pickupCoords: { lat: 26.7922, lng: 82.1998, name: 'Ayodhya' },
      dropLocation: 'Lucknow (Chinhat Transport Yard)',
      dropCoords: { lat: 26.8800, lng: 81.0100, name: 'Lucknow' },
      distanceKm: 135,
      weightKg: 850,
      packageType: 'Handicrafts & Timber Artifacts',
      packageDescription: '12 Crates of Carved Teakwood Temple Artifacts',
      pickupTimeWindow: 'Today 11:00 AM - 01:00 PM',
      deliveryDeadline: 'Today 07:00 PM',
      fareEstimate: {
        baseFee: 60,
        distanceFee: 405,
        weightFee: 850,
        packageMultiplier: 1.15,
        totalFare: 1750
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '5132',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '8471',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const shipmentGkp3 = {
      id: 'shp_gkp_mrt_303',
      senderId: 'usr_snd_farhan',
      senderName: 'Farhan Ansari (Cane & Bamboo Works)',
      senderPhone: '+91 94122 77810',
      pickupLocation: 'Bareilly (Clutterbuckganj Industrial Area)',
      pickupCoords: { lat: 28.3800, lng: 79.3800, name: 'Bareilly' },
      dropLocation: 'Moradabad (Brassware Corridor)',
      dropCoords: { lat: 28.8386, lng: 78.7733, name: 'Moradabad' },
      distanceKm: 88,
      weightKg: 700,
      packageType: 'Furniture & Cane Works',
      packageDescription: '16 Sets of Handwoven Cane & Bamboo Patio Chairs',
      pickupTimeWindow: 'Today 03:00 PM - 05:00 PM',
      deliveryDeadline: 'Tonight 10:00 PM',
      fareEstimate: {
        baseFee: 60,
        distanceFee: 264,
        weightFee: 700,
        packageMultiplier: 1.15,
        totalFare: 1450
      },
      status: 'PENDING',
      assignedTripId: null,
      driverId: null,
      pickupOtp: '3902',
      pickupOtpVerified: false,
      pickupPhoto: null,
      deliveryOtp: '6284',
      deliveryOtpVerified: false,
      deliveryPhoto: null,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 7. Payments (Escrow Held for the 3 Baseline Booked Shipments)
    const payment1 = {
      id: 'pay_demo_01',
      shipmentId: 'shp_lko_vns_101',
      senderId: 'usr_snd_priya',
      driverId: 'drv_ramesh',
      amount: 1870,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    };

    const payment2 = {
      id: 'pay_demo_02',
      shipmentId: 'shp_pry_del_201',
      senderId: 'usr_snd_amitabh',
      driverId: 'drv_harish',
      amount: 8400,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    };

    const payment3 = {
      id: 'pay_demo_03',
      shipmentId: 'shp_gkp_mrt_301',
      senderId: 'usr_snd_devendra',
      driverId: 'drv_balwant',
      amount: 5600,
      currency: 'INR',
      paymentStatus: 'ESCROW_HELD',
      paidAt: new Date().toISOString()
    };

    // 8. Trip-Shipment Assignments
    const assignment1 = {
      id: 'asg_demo_01',
      tripId: 'trip_lko_vns_01',
      shipmentId: 'shp_lko_vns_101',
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    };

    const assignment2 = {
      id: 'asg_demo_02',
      tripId: 'trip_pry_del_02',
      shipmentId: 'shp_pry_del_201',
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    };

    const assignment3 = {
      id: 'asg_demo_03',
      tripId: 'trip_gkp_mrt_03',
      shipmentId: 'shp_gkp_mrt_301',
      assignedAt: new Date().toISOString(),
      acceptanceStatus: 'ACCEPTED'
    };

    // 9. Status Logs
    const statusLog1 = {
      id: 'log_demo_01',
      shipmentId: 'shp_lko_vns_101',
      timestamp: new Date().toISOString(),
      status: 'BOOKED',
      location: 'Lucknow Transport Nagar',
      notes: 'Shipment confirmed and locked in Driver Ramesh trip route.'
    };

    const statusLog2 = {
      id: 'log_demo_02',
      shipmentId: 'shp_pry_del_201',
      timestamp: new Date().toISOString(),
      status: 'BOOKED',
      location: 'Prayagraj Naini Industrial Area',
      notes: 'Shipment confirmed and locked in Driver Harish trip route.'
    };

    const statusLog3 = {
      id: 'log_demo_03',
      shipmentId: 'shp_gkp_mrt_301',
      timestamp: new Date().toISOString(),
      status: 'BOOKED',
      location: 'Gorakhpur GIDA Industrial Hub',
      notes: 'Shipment confirmed and locked in Driver Balwant trip route.'
    };

    // 10. Platform Ratings
    const ratings = [
      {
        id: 'rat_sample_01',
        shipmentId: 'shp_past_001',
        driverId: 'drv_ramesh',
        senderId: 'usr_snd_priya',
        senderName: 'Priya Sharma',
        rating: 5,
        comment: 'Very professional driver. Timely pickup at Lucknow and verified OTP smoothly.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'rat_sample_02',
        shipmentId: 'shp_past_002',
        driverId: 'drv_harish',
        senderId: 'usr_snd_amitabh',
        senderName: 'Amitabh Sen',
        rating: 5,
        comment: 'Exceptional reliability on Prayagraj-Delhi run, fragile glassware delivered with zero breakage.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'rat_sample_03',
        shipmentId: 'shp_past_003',
        driverId: 'drv_balwant',
        senderId: 'usr_snd_devendra',
        senderName: 'Devendra Pandey',
        rating: 5,
        comment: 'Excellent heavy load handling for Gorakhpur agro freight, always on schedule.',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ];

    this.data = {
      users: [
        driverRamesh, driverHarish, driverBalwant,
        senderPriya, senderRajesh, senderVikram,
        senderAmitabh, senderSunil, senderManish,
        senderDevendra, senderRamakant, senderFarhan
      ],
      drivers: [driverRecord1, driverRecord2, driverRecord3],
      vehicles: [vehicle1, vehicle2, vehicle3],
      trips: [trip1, trip2, trip3],
      shipments: [
        shipmentLko1, shipmentLko2, shipmentLko3,
        shipmentPry1, shipmentPry2, shipmentPry3,
        shipmentGkp1, shipmentGkp2, shipmentGkp3
      ],
      assignments: [assignment1, assignment2, assignment3],
      shipment_status_logs: [statusLog1, statusLog2, statusLog3],
      payments: [payment1, payment2, payment3],
      ratings,
      messages: []
    };

    this.save();
    return this.data;
  }
}

module.exports = new Database();
