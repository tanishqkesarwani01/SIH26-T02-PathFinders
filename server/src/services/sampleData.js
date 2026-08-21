"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { getDb } = require("../db");

const CITIES = {
  "New Delhi":   { lat: 28.6139, lng: 77.2090, state: "Delhi" },
  "Gurugram":    { lat: 28.4595, lng: 77.0266, state: "Haryana" },
  "Agra":        { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
  "Jaipur":      { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  "Mathura":     { lat: 27.4924, lng: 77.6737, state: "Uttar Pradesh" },
  "Alwar":       { lat: 27.5530, lng: 76.6346, state: "Rajasthan" },
  "Mumbai":      { lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  "Pune":        { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  "Nashik":      { lat: 19.9975, lng: 73.7898, state: "Maharashtra" },
  "Surat":       { lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  "Faridabad":   { lat: 28.4089, lng: 77.3178, state: "Haryana" },
  "Noida":       { lat: 28.5355, lng: 77.3910, state: "Uttar Pradesh" },
  "Chandigarh":  { lat: 30.7333, lng: 76.7794, state: "Punjab" },
  "Ludhiana":    { lat: 30.9010, lng: 75.8573, state: "Punjab" },
};

function createAddr(db, city) {
  const c = CITIES[city];
  const existing = db.prepare("SELECT id FROM addresses WHERE city=?").get(city);
  if (existing) return existing.id;
  const id = uuidv4();
  db.prepare("INSERT INTO addresses (id,city,state,lat,lng) VALUES (?,?,?,?,?)").run(id, city, c.state, c.lat, c.lng);
  return id;
}

async function generateSampleData() {
  const db = getDb();

  const makeUser = async (name, email, pass, phone, role) => {
    const ex = db.prepare("SELECT id FROM users WHERE email=?").get(email);
    if (ex) return ex.id;
    const hash = await bcrypt.hash(pass, 10);
    const id = uuidv4();
    db.prepare("INSERT INTO users (id,name,email,password_hash,phone,role) VALUES (?,?,?,?,?,?)").run(id, name, email, hash, phone, role);
    return id;
  };

  const adminId  = await makeUser("Admin User",       "admin@velocitylogistics.in",  "admin123",  "9999999999", "admin");
  const d1UserId = await makeUser("Ravi Kumar",        "ravi@velocitylogistics.in",   "driver123", "9876543210", "driver");
  const d2UserId = await makeUser("Suresh Sharma",     "suresh@velocitylogistics.in", "driver123", "9876543220", "driver");
  const s1Id     = await makeUser("Priya Gupta",       "priya@example.in",            "sender123", "9876500001", "sender");
  const s2Id     = await makeUser("Aditya Mehta",      "aditya@example.in",           "sender123", "9876500002", "sender");

  const ensureDriver = (userId, license) => {
    const ex = db.prepare("SELECT id FROM drivers WHERE user_id=?").get(userId);
    if (ex) return ex.id;
    const id = uuidv4();
    db.prepare("INSERT INTO drivers (id,user_id,license_number,is_verified,avg_rating,total_ratings) VALUES (?,?,?,?,?,?)").run(id, userId, license, 1, 4.7, 23);
    return id;
  };
  const dId1 = ensureDriver(d1UserId, "DL-2345-2019");
  const dId2 = ensureDriver(d2UserId, "HR-1122-2020");

  const ensureVehicle = (driverId, regNo, type, cap) => {
    const ex = db.prepare("SELECT id FROM vehicles WHERE driver_id=? AND registration_number=?").get(driverId, regNo);
    if (ex) return ex.id;
    const id = uuidv4();
    db.prepare("INSERT INTO vehicles (id,driver_id,registration_number,vehicle_type,capacity_kg) VALUES (?,?,?,?,?)").run(id, driverId, regNo, type, cap);
    return id;
  };
  const v1 = ensureVehicle(dId1, "DL-01-AB-1234", "Container", 5000);
  const v2 = ensureVehicle(dId2, "HR-26-CD-5678", "Mini Van",  1500);

  const delhiId   = createAddr(db, "New Delhi");
  const jaipurId  = createAddr(db, "Jaipur");
  const agraId    = createAddr(db, "Agra");
  const gurugramId= createAddr(db, "Gurugram");
  const mathuraId = createAddr(db, "Mathura");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const exTrip = db.prepare("SELECT id FROM trips WHERE driver_id=? AND source_address_id=?").get(dId1, delhiId);
  let tripId1;
  if (!exTrip) {
    tripId1 = uuidv4();
    db.prepare("INSERT INTO trips (id,driver_id,vehicle_id,source_address_id,dest_address_id,departure_datetime,available_capacity_kg,total_capacity_kg,route_name) VALUES (?,?,?,?,?,?,?,?,?)").run(tripId1, dId1, v1, delhiId, jaipurId, tomorrow.toISOString(), 5000, 5000, "New Delhi - Jaipur Express");
  }

  const jaipur2 = createAddr(db, "Jaipur");
  const exShip = db.prepare("SELECT id FROM shipments WHERE sender_id=?").get(s1Id);
  if (!exShip) {
    const otp1 = Math.floor(100000 + Math.random() * 900000).toString();
    const otp1d = Math.floor(100000 + Math.random() * 900000).toString();
    db.prepare("INSERT INTO shipments (id,sender_id,pickup_address_id,drop_address_id,weight_kg,package_type,scheduled_pickup,required_delivery,fare_amount,pickup_otp,delivery_otp) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(uuidv4(), s1Id, gurugramId, jaipur2, 350, "Electronics", new Date(tomorrow.getTime()-3600000).toISOString(), new Date(tomorrow.getTime()+18*3600000).toISOString(), 820, otp1, otp1d);
  }
  const jaipur3 = createAddr(db, "Jaipur");
  const exShip2 = db.prepare("SELECT id FROM shipments WHERE sender_id=?").get(s2Id);
  if (!exShip2) {
    const otp2 = Math.floor(100000 + Math.random() * 900000).toString();
    const otp2d = Math.floor(100000 + Math.random() * 900000).toString();
    db.prepare("INSERT INTO shipments (id,sender_id,pickup_address_id,drop_address_id,weight_kg,package_type,scheduled_pickup,required_delivery,fare_amount,pickup_otp,delivery_otp) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(uuidv4(), s2Id, mathuraId, jaipur3, 200, "Textiles", new Date(tomorrow.getTime()-1800000).toISOString(), new Date(tomorrow.getTime()+20*3600000).toISOString(), 620, otp2, otp2d);
  }

  return {
    message: "Sample Delhi-Jaipur logistics corridor generated successfully",
    credentials: [
      { role: "admin",  email: "admin@velocitylogistics.in",  password: "admin123"  },
      { role: "driver", email: "ravi@velocitylogistics.in",   password: "driver123" },
      { role: "driver", email: "suresh@velocitylogistics.in", password: "driver123" },
      { role: "sender", email: "priya@example.in",            password: "sender123" },
      { role: "sender", email: "aditya@example.in",           password: "sender123" },
    ],
  };
}

async function wipeDatabase() {
  const db = getDb();
  db.exec("DELETE FROM ratings; DELETE FROM payments; DELETE FROM shipment_status_logs; DELETE FROM assignments; DELETE FROM shipments; DELETE FROM trips; DELETE FROM vehicles; DELETE FROM drivers; DELETE FROM addresses; DELETE FROM users;");
  return { message: "Database wiped successfully. All data removed." };
}

module.exports = { generateSampleData, wipeDatabase, CITIES };
