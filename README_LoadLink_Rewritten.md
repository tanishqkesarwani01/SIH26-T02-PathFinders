# 🚚 LoadLink — Smart Freight Sharing & Route Optimization

> **Making the vehicles already on the road work smarter.**

**LoadLink** is a prototype built by **Team PathFinders** for our college's Internal Smart India Hackathon 2026.

It represents our proposed solution to a logistics problem: loading vehicles may travel with unused capacity while small shippers need affordable transportation. LoadLink aims to connect available vehicle capacity with compatible shipments and make better use of journeys that are already happening.

## 🔗 Live Demo & Repository

- 🌐 **Live Frontend:** https://sih-26-t02-path-finders.vercel.app/
- ⚙️ **Production Backend:** https://sih26-t02-pathfinders.onrender.com/
- 💻 **GitHub:** https://github.com/tanishqkesarwani01/SIH26-T02-PathFinders

---

## 📌 Problem

In freight transportation, a loading vehicle can complete a trip with unused capacity or return without carrying additional cargo. At the same time, small businesses and individual shippers may need to send smaller consignments without booking an entire vehicle.

This creates an opportunity to use existing vehicle journeys more efficiently.

LoadLink addresses this by combining:

- 🚚 Available vehicle capacity
- 📦 Shipment requirements
- 🗺️ Route and corridor information
- 💰 Potential additional earnings
- ⏱️ Travel time and distance
- 📍 Real-time shipment opportunities along the journey

---

## 💡 Our Solution

LoadLink is a **freight-sharing and route-optimization prototype** with two major ideas:

### 1. 🧠 Smart Route Recommendation

Suppose a loading vehicle is travelling from **Lucknow → Varanasi** and has multiple possible routes, such as:

- Route A — via Prayagraj
- Route B — via Sultanpur
- Route C — via Akbarpur

Different routes can have different distances, travel times, cargo opportunities and earning potential.

LoadLink evaluates available route and shipment opportunities and recommends a suitable route based on factors such as:

- Route overlap
- Available vehicle capacity
- Potential revenue
- Detour distance
- Expected delay

The objective is to help the driver choose a route that can provide better earning potential while avoiding unnecessary travel.

---

### 2. 📍 10 km En-Route Proximity Radar

The standout feature of our prototype is the **10 km proximity-based shipment alert system**.

The system continuously checks the vehicle's forward journey for compatible shipment opportunities.

#### Example

A vehicle is travelling:

**Lucknow → Varanasi**

A shipper has listed a shipment:

**Sultanpur → Jaunpur**

When the vehicle approaches Sultanpur and the shipment is within the configured **10 km proximity range**, the driver receives an alert.

The alert provides information such as:

- 📍 Distance to pickup
- 📦 Cargo details
- ⚖️ Shipment weight
- 🛣️ Pickup → Drop location
- 💰 Estimated additional earnings
- ✅ Accept Cargo
- ❌ Dismiss

The driver can decide whether to accept the shipment and utilize available vehicle capacity.

The proximity system works throughout the journey, allowing relevant shipment opportunities to be discovered as the vehicle moves.

---

## ⚙️ How the Proximity Radar Works

The prototype does not depend on hardcoded city names.

It uses the vehicle's forward route corridor and geographical calculations to determine whether a shipment pickup is relevant to the current journey.

### Detection logic

1. The vehicle has a planned route represented as a route polyline.
2. Candidate shipment pickup locations are evaluated against that route.
3. Vector projection is used to determine the pickup's position relative to the route.
4. Haversine distance is used for geographical distance calculations.
5. The system checks whether the pickup is within the configured proximity range.
6. Shipments are prioritized according to their geographical order along the forward route.
7. When a relevant shipment enters the detection range, an automatic alert is generated.

The prototype also demonstrates automatic background triggering, a visual notification, an audio alert and a trigger history.

---

## 🚛 Core Features

### Route & Cargo Matching
- Multi-corridor route evaluation
- Route-overlap based matching
- Available-capacity evaluation
- Cargo bundling
- Match scoring based on route, utilization, revenue, detour and delay

### 📍 Proximity Radar
- 10 km en-route shipment detection
- Route-aware proximity calculation
- Sequential pickup prioritization
- Automatic alerts while travelling
- Distance, cargo and earning information
- Accept / dismiss actions
- Trigger history

### 📦 Shipment Management
- Shipment creation
- Vehicle-space booking
- Live shipment tracking
- Pickup and delivery status
- Dynamic vehicle and cargo information

### 🔐 Verification & Delivery
- Pickup OTP verification
- Delivery OTP verification
- Photo proof at pickup and delivery
- Delivery verification before payment release
- Driver rating and feedback

### 💰 Dynamic Pricing
The prototype includes a transparent fare calculation based on:

**Fare = Base Fee + Distance Component + Weight Component × Category Multiplier**

The current prototype demonstrates the pricing model for shipment estimation.

---

## 🧩 Prototype Architecture

```text
                     ┌─────────────────────┐
                     │      Shipper        │
                     │  Creates Shipment   │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │      LoadLink       │
                     │  Matching Engine    │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
       Route Evaluation    Capacity Match    Proximity Radar
              │                 │                 │
              └─────────────────┼─────────────────┘
                                ▼
                     ┌─────────────────────┐
                     │       Driver        │
                     │ Accept / Dismiss    │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Shipment Tracking   │
                     │ OTP + Photo Proof   │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Delivery & Payment  │
                     └─────────────────────┘
```

---

## 🧠 Algorithms Used

### Vector Polyline Projection
Used to determine the position of a shipment pickup relative to the vehicle's planned route.

### Haversine Geodesic Distance
Used for geographical distance calculations between coordinates.

### Greedy Cargo Bundling
Candidate shipments are evaluated against remaining vehicle capacity to improve space utilization without exceeding the configured capacity.

### Match Score

The prototype uses a weighted matching concept:

```text
MatchScore =
    w1(RouteOverlap)
  + w2(UtilizationGain)
  + w3(Revenue)
  - w4(DetourDistance)
  - w5(Delay)
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Maps | Leaflet, React-Leaflet, OpenStreetMap |
| Backend | Node.js, Express.js |
| Real-time | Socket.IO |
| Database | SQLite / `node:sqlite` |
| Algorithms | Vector Projection, Haversine Distance, Greedy Cargo Optimization |
| Deployment | Vercel + Render |

---

## 📁 Project Structure

```text
SIH_26/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

### Important Services

- `matchingEngine.js` — route/cargo matching
- `pricingEngine.js` — fare calculation
- `routingService.js` — routing-related logic
- `api.js` — frontend API client
- `socket.js` — real-time communication

---

## 🔌 Main API Areas

### Authentication
```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-aadhaar
```

### Trips & Matching
```text
GET  /api/trips
GET  /api/trips/:id
POST /api/trips
POST /api/trips/:id/select-route
GET  /api/trips/:id/proximity-consignments
POST /api/trips/:id/accept-enroute-consignment
POST /api/trips/:id/decline-enroute-consignment
```

### Shipments
```text
GET  /api/shipments
POST /api/shipments
GET  /api/shipments/fare-estimate
POST /api/shipments/:id/book-trip
POST /api/shipments/:id/verify-pickup
POST /api/shipments/:id/verify-delivery
PATCH /api/shipments/:id/status
```

### Ratings & Demo
```text
POST /api/ratings
GET  /api/ratings/:driverId
POST /api/demo/seed
POST /api/demo/reset
GET  /api/demo/stats
```

---

## 🧪 Demo Flow

The prototype includes a demonstration scenario for the **Lucknow → Varanasi** corridor.

1. Reset the system to a clean state.
2. Load the demo corridor scenario.
3. Open Driver Mode.
4. Compare the available route options.
5. Start the simulated drive and proximity radar.
6. As the vehicle approaches shipment locations, observe automatic alerts.
7. Accept an en-route shipment.
8. Open the Tracker.
9. Verify pickup using OTP + photo proof.
10. Verify delivery using OTP + photo proof.
11. Observe payment release and driver rating.

This flow demonstrates the complete journey from **route selection → en-route cargo discovery → shipment acceptance → tracking → verified delivery**.

---

## 🚀 Running Locally

### Backend

```bash
cd server
npm install
node src/index.js
```

Backend:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The Vite development configuration proxies `/api` requests to the backend.

---

## 🌐 Deployment

### Frontend
Deployed on **Vercel**

https://sih-26-t02-path-finders.vercel.app/

### Backend
Deployed on **Render**

https://sih26-t02-pathfinders.onrender.com/

---

## 🎯 What This Prototype Demonstrates

LoadLink demonstrates how existing loading vehicles can potentially be utilized more efficiently by combining:

**Route Optimization + Cargo Matching + Real-Time Proximity Detection + Shipment Tracking**

The prototype is intended to demonstrate our proposed solution and its workflow. It is not presented as a production-ready logistics platform.

---

## 👥 Team

**Team PathFinders**

- Tanishq Kesarwani — Team Lead
- Ekanand Modanwal
- Sumangal Shukla
- Khushi Yadav
- Ayush Kumar
- Raunak Srivastava

---

## 📜 Hackathon Context

**Smart India Hackathon 2026 — Internal Hackathon**

LoadLink was developed as our team's prototype and represents our proposed approach to the logistics and transportation problem addressed during the internal hackathon.

---

> **“We are not adding more vehicles to the road — we are making the vehicles already on the road work smarter.”** 🚛
