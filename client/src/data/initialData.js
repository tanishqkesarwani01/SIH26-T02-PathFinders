export const INITIAL_USERS = [
  {
    id: 'usr_shipper_1',
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    phone: '+91 98765 43210',
    role: 'SHIPPER',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    walletBalance: 12500,
    createdBookingsCount: 4
  },
  {
    id: 'usr_driver_1',
    name: 'Gurpreet Singh',
    email: 'gurpreet@transport.in',
    phone: '+91 98112 34567',
    role: 'DRIVER',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    driverDetails: {
      licenseNumber: 'DL-0420180092144',
      vehicleNumber: 'HR 55 AH 8892',
      truckModel: 'Tata Signa 4825.TK (32ft Multi-Axle)',
      truckType: 'Heavy Closed Container',
      totalCapacityKg: 5000,
      totalVolumeM3: 45,
      rating: 4.92,
      tripsCompleted: 148,
      verified: true,
      drivingSince: 2016
    },
    walletBalance: 24850
  },
  {
    id: 'usr_driver_2',
    name: 'Vikram Jadhav',
    email: 'vikram.logistics@gmail.com',
    phone: '+91 97654 11223',
    role: 'DRIVER',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverDetails: {
      licenseNumber: 'MH-1220190038172',
      vehicleNumber: 'MH 14 GC 4019',
      truckModel: 'Eicher Pro 2049 (14ft High Deck)',
      truckType: 'Medium Covered LPT',
      totalCapacityKg: 2500,
      totalVolumeM3: 20,
      rating: 4.86,
      tripsCompleted: 89,
      verified: true,
      drivingSince: 2019
    },
    walletBalance: 18400
  },
  {
    id: 'usr_admin_1',
    name: 'Platform Operations Admin',
    email: 'admin@loadlink.com',
    phone: '+91 80000 12345',
    role: 'ADMIN',
    city: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    walletBalance: 852000
  }
];

export const INITIAL_TRIPS = [
  {
    id: 'trip_101',
    driverId: 'usr_driver_1',
    driverName: 'Gurpreet Singh',
    driverPhone: '+91 98112 34567',
    driverRating: 4.92,
    driverAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    vehicleNumber: 'HR 55 AH 8892',
    truckModel: 'Tata Signa 4825.TK (32ft Container)',
    truckType: 'Heavy Closed Container',
    
    origin: 'Delhi NCR',
    destination: 'Mumbai',
    // Ordered corridor intermediate waypoints
    waypoints: [
      { name: 'Delhi NCR', eta: 'Today 06:00 PM', completed: true },
      { name: 'Jaipur', eta: 'Today 11:30 PM', completed: false },
      { name: 'Udaipur', eta: 'Tomorrow 07:00 AM', completed: false },
      { name: 'Ahmedabad', eta: 'Tomorrow 01:30 PM', completed: false },
      { name: 'Vadodara', eta: 'Tomorrow 04:30 PM', completed: false },
      { name: 'Surat', eta: 'Tomorrow 08:00 PM', completed: false },
      { name: 'Mumbai', eta: 'Day 3 04:00 AM', completed: false }
    ],
    currentWaypointIndex: 1, // Currently approaching Jaipur
    departureDate: '2026-08-20',
    departureTime: '18:00',
    
    totalWeightCapacityKg: 5000,
    availableWeightKg: 2800, // remaining space
    totalVolumeM3: 45,
    availableVolumeM3: 24,  // remaining space
    
    baseRatePerKm: 3.20,
    pricePerKg: 3.50,
    status: 'ACTIVE_ON_ROAD', // 'SCHEDULED', 'ACTIVE_ON_ROAD', 'COMPLETED'
    notes: 'Empty return trip after unloading electronics in Delhi. Secure waterproof locked container with GPS telemetry.',
    features: ['Realtime GPS', 'Waterproof Container', 'Helper Available', 'Fast Highway Corridor']
  },
  {
    id: 'trip_102',
    driverId: 'usr_driver_2',
    driverName: 'Vikram Jadhav',
    driverPhone: '+91 97654 11223',
    driverRating: 4.86,
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehicleNumber: 'MH 14 GC 4019',
    truckModel: 'Eicher Pro 2049 (14ft Deck)',
    truckType: 'Medium Covered LPT',
    
    origin: 'Mumbai',
    destination: 'Bengaluru',
    waypoints: [
      { name: 'Mumbai', eta: 'Today 08:00 PM', completed: false },
      { name: 'Pune', eta: 'Today 11:45 PM', completed: false },
      { name: 'Hyderabad', eta: 'Tomorrow 10:00 AM', completed: false },
      { name: 'Bengaluru', eta: 'Tomorrow 09:00 PM', completed: false }
    ],
    currentWaypointIndex: 0,
    departureDate: '2026-08-20',
    departureTime: '20:00',
    
    totalWeightCapacityKg: 2500,
    availableWeightKg: 1650,
    totalVolumeM3: 20,
    availableVolumeM3: 12.5,
    
    baseRatePerKm: 3.10,
    pricePerKg: 3.80,
    status: 'SCHEDULED',
    notes: 'Half empty deck heading south. Perfect for small machinery, boxed goods, or personal relocation items.',
    features: ['Tarpaulin Covered', 'Tail-lift Facility', 'Express Route']
  },
  {
    id: 'trip_103',
    driverId: 'usr_driver_1',
    driverName: 'Rajinder Pal',
    driverPhone: '+91 98450 67890',
    driverRating: 4.95,
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehicleNumber: 'UP 78 BT 5512',
    truckModel: 'Ashok Leyland BOSS 1215 HB',
    truckType: 'Heavy Open Body Deck',
    
    origin: 'Kolkata',
    destination: 'Delhi NCR',
    waypoints: [
      { name: 'Kolkata', eta: 'Today 04:00 PM', completed: true },
      { name: 'Varanasi', eta: 'Tomorrow 05:00 AM', completed: false },
      { name: 'Lucknow', eta: 'Tomorrow 12:30 PM', completed: false },
      { name: 'Agra', eta: 'Tomorrow 07:00 PM', completed: false },
      { name: 'Delhi NCR', eta: 'Day 3 01:00 AM', completed: false }
    ],
    currentWaypointIndex: 1,
    departureDate: '2026-08-20',
    departureTime: '16:00',
    
    totalWeightCapacityKg: 4000,
    availableWeightKg: 3200,
    totalVolumeM3: 35,
    availableVolumeM3: 28,
    
    baseRatePerKm: 2.90,
    pricePerKg: 3.20,
    status: 'ACTIVE_ON_ROAD',
    notes: 'NH-19 Grand Trunk Road corridor. Going largely empty after jute delivery.',
    features: ['Heavy Duty Tiedowns', 'Industrial Cargo Friendly']
  },
  {
    id: 'trip_104',
    driverId: 'usr_driver_2',
    driverName: 'Manoj Reddy',
    driverPhone: '+91 94401 23456',
    driverRating: 4.88,
    driverAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    vehicleNumber: 'KA 01 MJ 7721',
    truckModel: 'Tata Ace Gold EV',
    truckType: 'Mini Light Commercial (SCV)',
    
    origin: 'Bengaluru',
    destination: 'Chennai',
    waypoints: [
      { name: 'Bengaluru', eta: 'Tomorrow 06:00 AM', completed: false },
      { name: 'Chennai', eta: 'Tomorrow 02:00 PM', completed: false }
    ],
    currentWaypointIndex: 0,
    departureDate: '2026-08-21',
    departureTime: '06:00',
    
    totalWeightCapacityKg: 850,
    availableWeightKg: 650,
    totalVolumeM3: 6.5,
    availableVolumeM3: 5.0,
    
    baseRatePerKm: 3.50,
    pricePerKg: 4.10,
    status: 'SCHEDULED',
    notes: 'Direct expressway sprint. Zero emissions green corridor.',
    features: ['Electric Green EV', 'Same Day Delivery', 'Fragile Safe']
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bkg_801',
    tripId: 'trip_101',
    shipperId: 'usr_shipper_1',
    shipperName: 'Rahul Sharma',
    shipperPhone: '+91 98765 43210',
    driverId: 'usr_driver_1',
    driverName: 'Gurpreet Singh',
    driverPhone: '+91 98112 34567',
    vehicleNumber: 'HR 55 AH 8892',
    
    pickupCity: 'Jaipur',
    dropoffCity: 'Ahmedabad',
    pickupAddress: 'Plot 42, Sitapura Industrial Area, Jaipur',
    dropoffAddress: 'Warehouse 9B, Changodar GIDC, Ahmedabad',
    
    cargoDescription: '2 Pallets of Automobile Spare Parts',
    category: 'industrial',
    weightKg: 350,
    volumeM3: 2.8,
    
    distanceKm: 660,
    totalFare: 3840,
    platformFee: 284,
    driverEarnings: 3556,
    escrowStatus: 'HELD_IN_ESCROW', // 'HELD_IN_ESCROW', 'RELEASED_TO_DRIVER', 'REFUNDED'
    
    pickupOtp: '4821',
    deliveryOtp: '9103',
    status: 'CONFIRMED', // 'CONFIRMED', 'PICKED_UP_IN_TRANSIT', 'DELIVERED', 'CANCELLED'
    
    createdAt: '2026-08-20T10:30:00Z',
    pickupVerifiedAt: null,
    deliveryVerifiedAt: null,
    proofNote: '',
    carbonSavedKg: 41.5
  },
  {
    id: 'bkg_802',
    tripId: 'trip_103',
    shipperId: 'usr_shipper_1',
    shipperName: 'Rahul Sharma',
    shipperPhone: '+91 98765 43210',
    driverId: 'usr_driver_1',
    driverName: 'Rajinder Pal',
    driverPhone: '+91 98450 67890',
    vehicleNumber: 'UP 78 BT 5512',
    
    pickupCity: 'Varanasi',
    dropoffCity: 'Lucknow',
    pickupAddress: 'Shop 14, Chowk Market, Varanasi',
    dropoffAddress: 'Gomti Nagar Extension, Lucknow',
    
    cargoDescription: '6 Cartons of Banarasi Handloom Textiles',
    category: 'textiles',
    weightKg: 120,
    volumeM3: 1.2,
    
    distanceKm: 310,
    totalFare: 1890,
    platformFee: 140,
    driverEarnings: 1750,
    escrowStatus: 'RELEASED_TO_DRIVER',
    
    pickupOtp: '3319',
    deliveryOtp: '7742',
    status: 'DELIVERED',
    
    createdAt: '2026-08-19T08:00:00Z',
    pickupVerifiedAt: '2026-08-19T11:20:00Z',
    deliveryVerifiedAt: '2026-08-19T18:45:00Z',
    proofNote: 'Delivered at Gomti Nagar shop in perfect sealed condition. Received by Mr. Alok.',
    carbonSavedKg: 6.7
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg_1',
    bookingId: 'bkg_801',
    senderId: 'usr_shipper_1',
    senderName: 'Rahul Sharma',
    text: 'Hi Gurpreet ji, I booked 350kg spare parts for pickup at Sitapura Jaipur.',
    timestamp: '2026-08-20T10:35:00Z'
  },
  {
    id: 'msg_2',
    bookingId: 'bkg_801',
    senderId: 'usr_driver_1',
    senderName: 'Gurpreet Singh',
    text: 'Namaste Rahul ji! I have received your instant booking. I will reach Jaipur bypass by 11:30 PM tonight. Please keep the pickup OTP ready.',
    timestamp: '2026-08-20T10:38:00Z'
  }
];
