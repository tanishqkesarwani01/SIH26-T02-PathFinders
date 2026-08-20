const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sih2026_loadlink_super_secret_jwt';

// Register User (Sender or Driver)
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, phone, aadhaarNumber, vehicleDetails, licenseNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newUser = {
      id: userId,
      name,
      email,
      passwordHash,
      role: role.toUpperCase(), // DRIVER | SENDER | ADMIN
      phone: phone || '+91 9800000000',
      aadhaarNumber: aadhaarNumber || 'XXXX-XXXX-1234',
      aadhaarVerified: true,
      rating: 5.0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    // If registered as Driver, create driver profile and vehicle
    if (newUser.role === 'DRIVER') {
      const driverId = `drv_${Date.now()}`;
      const vehicleId = `veh_${Date.now()}`;

      const vehicle = {
        id: vehicleId,
        driverId,
        userId,
        registrationNumber: vehicleDetails?.registrationNumber || 'UP-32-XX-0000',
        vehicleType: vehicleDetails?.vehicleType || 'Medium LCV (14ft Container)',
        capacityKg: Number(vehicleDetails?.capacityKg) || 5000,
        currentLoadKg: 0,
        availableCapacityKg: Number(vehicleDetails?.capacityKg) || 5000,
        features: ['GPS Enabled', 'Covered Container', 'FastTag']
      };
      db.createVehicle(vehicle);

      const driver = {
        id: driverId,
        userId,
        name,
        licenseNumber: licenseNumber || 'UP32-2024-001234',
        vehicleId,
        status: 'VERIFIED',
        experienceYears: 5
      };
      db.createDriver(driver);
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userWithoutPass } = newUser;

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: userWithoutPass
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login User
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userWithoutPass } = user;

    // Attach driver or vehicle if driver
    let driverData = null;
    if (user.role === 'DRIVER') {
      const driver = db.findDriverById(user.id);
      const vehicles = db.findVehiclesByDriver(driver?.id || user.id);
      driverData = { driver, vehicle: vehicles[0] || null };
    }

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPass,
      driverData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Aadhaar KYC Verification Simulation
router.post('/verify-aadhaar', (req, res) => {
  try {
    const { userId, aadhaarNumber, aadhaarPhoto } = req.body;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = db.updateUser(userId, {
      aadhaarNumber: aadhaarNumber || user.aadhaarNumber,
      aadhaarPhoto: aadhaarPhoto || 'verified_doc_preview.jpg',
      aadhaarVerified: true,
      verifiedAt: new Date().toISOString()
    });

    res.json({ message: 'Aadhaar / National ID verified successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify Aadhaar' });
  }
});

// Get Current User Profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
