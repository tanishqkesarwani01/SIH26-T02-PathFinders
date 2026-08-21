"use strict";
const express = require("express");
const { getDb } = require("../db");
const { authenticate } = require("./auth");
const router = express.Router();

router.get("/shipment/:shipmentId", (req, res) => {
  try { res.json(getDb().prepare("SELECT * FROM payments WHERE shipment_id=?").get(req.params.shipmentId) || null); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/my", authenticate, (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT p.*,s.weight_kg,s.package_type,s.status as shipment_status,pa.city as pickup_city,da.city as drop_city FROM payments p JOIN shipments s ON s.id=p.shipment_id JOIN addresses pa ON pa.id=s.pickup_address_id JOIN addresses da ON da.id=s.drop_address_id WHERE s.sender_id=? ORDER BY p.paid_at DESC").all(req.userId);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/earnings", authenticate, (req, res) => {
  try {
    const db = getDb();
    const driver = db.prepare("SELECT * FROM drivers WHERE user_id=?").get(req.userId);
    if (!driver) return res.status(403).json({ error: "Driver only" });
    const rows = db.prepare("SELECT p.*,s.weight_kg,s.package_type,s.status as shipment_status,pa.city as pickup_city,da.city as drop_city FROM payments p JOIN shipments s ON s.id=p.shipment_id JOIN assignments a ON a.shipment_id=s.id JOIN trips t ON t.id=a.trip_id JOIN addresses pa ON pa.id=s.pickup_address_id JOIN addresses da ON da.id=s.drop_address_id WHERE t.driver_id=? ORDER BY p.paid_at DESC").all(driver.id);
    const totalEarned = rows.filter(e=>e.payment_status==="completed").reduce((s,e)=>s+e.amount,0);
    const pendingEscrow = rows.filter(e=>e.payment_status==="held_in_escrow").reduce((s,e)=>s+e.amount,0);
    res.json({ earnings: rows, totalEarned, pendingEscrow });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
