# 🚚 LoadLink — Shared Logistics, Dynamic Highway Corridor Optimizer & Smart Proximity Radar
### Smart India Hackathon (SIH 2026) • Problem Statement #4: Logistics & Transportation

[![Live Frontend](https://img.shields.io/badge/Deployed%20Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sih-26-t02-path-finders.vercel.app/)
[![Production Backend](https://img.shields.io/badge/Production%20Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://sih26-t02-pathfinders.onrender.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-TailwindCSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

---

## 📌 Executive Summary & Problem Context

In traditional Indian freight logistics:
- **40%+ of commercial trucks travel empty on return journeys (deadheading)**, resulting in massive fuel wastage, heightened carbon emissions, and diminished driver profitability.
- **Small and medium businesses (SMEs) / individual senders face exorbitant shipping rates** because they are forced to book entire mini-trucks for small (50–500 kg) consignments.

**LoadLink (Team PathFinders)** resolves this inefficiency through an automated, intelligent freight sharing platform that dynamically bundles partial truckload (LTL) cargo into commercial trucks carrying spare capacity along active highway corridors (e.g. Lucknow → Varanasi via Sultanpur, Raebareli, Ayodhya, Jaunpur).

---

## 🛰️ Deep Dive: Automated 10 km En-Route Proximity Sensor & Radar Engine

The cornerstone feature of LoadLink is its **Location-Agnostic 10 km En-Route Proximity Radar**, designed to continuously scan the forward corridor of a moving truck and notify drivers in real time when compatible return cargo appears nearby.

```
       [Lucknow Origin] ━━━━━━ 🚛 Truck Moving ━━━━━━ [Haidergarh] ━━━━━━ [Sultanpur] ━━━━━━ [Jaunpur] ━━━━━━ [Varanasi Dest]
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
            Vector Polyline Projection    Distance Point ≤ 10 km
                        │                         │
                        ▼                         ▼
            🔔 Top-Right Floating Toast   🎵 Dual-Tone Audio Chime
```

### 1. Pure Geometric Vector Projection (Location-Agnostic)
- The algorithm does **NOT** rely on hardcoded city names.
- Uses vector projection along the truck's forward route polyline:
  $$\vec{v} = P_{\text{pickup}} - P_{\text{segment\_start}}, \quad \vec{u} = P_{\text{segment\_end}} - P_{\text{segment\_start}}$$
  $$t = \text{clamp}\left(\frac{\vec{v} \cdot \vec{u}}{\|\vec{u}\|^2}, 0, 1\right), \quad P_{\text{closest}} = P_{\text{segment\_start}} + t \cdot \vec{u}$$
- Calculates exact Haversine distances to determine:
  1. Distance from current truck GPS position to pickup point ($\le 10\text{ km}$).
  2. Perpendicular distance from pickup point to highway corridor ($\le 10\text{ km}$).
  3. Detour distance for destination delivery.

### 2. Sequential Route-Order Arrival Prioritization
- Evaluates candidate consignments strictly in order of **geographical arrival along the forward route** ($T_{\text{pickup1}} < T_{\text{pickup2}} < T_{\text{pickup3}}$):
  1. **Haidergarh / Nihalgarh (65 km mark)** is triggered first when truck is within 10 km.
  2. **Sultanpur (140 km mark)** is triggered next when truck approaches Sultanpur.
  3. **Jaunpur (220 km mark)** is triggered next when truck approaches Jaunpur.
- Eliminates false triggers for far-off cities down the route.

### 3. Automated Background Triggering & Sensory Alerts
- **Zero Manual Clicking Required**: Runs automatically in the background as the truck travels.
- **Top-Right Floating Notification Toast**: Glassmorphic toast appears non-intrusively in the top-right corner with:
  - Exact live distance (e.g. `⚡ 9.4 km ahead`)
  - Consignment weight & cargo description (e.g. `450 kg • Industrial Hardware & Spares`)
  - Pickup $\to$ Drop locations
  - Estimated additional earnings (e.g. `+₹823`)
  - Direct `[Accept Cargo]` and `[Dismiss]` actions
- **Web Audio API Chime**: Plays a subtle dual-tone chime ($D_5 \to A_5 \to D_6$) on detection.
- **Trigger History Tray**: Logs every detection event with precise timestamp, location, distance, and score.

---

## 🚛 Core Platform Capabilities

### 1. Multi-Corridor Route Evaluation (Routes A, B, C)
- Automatically evaluates multiple alternative route options:
  - **Route A (Highway Express)**: Fastest toll expressway route with minimal stops.
  - **Route B (Freight Corridor)**: Passes through primary commercial and industrial hubs.
  - **Route C (Local Optimized)**: Toll-free secondary state highway with high cargo density.
- **Knapsack Greedy Cargo Bundling**: Evaluates candidate shipments against remaining payload capacity, maximizing space utilization without exceeding gross vehicle weight limits:
  $$\text{MatchScore} = w_1(\text{RouteOverlap}) + w_2(\text{UtilizationGain}) + w_3(\text{Revenue}) - w_4(\text{DetourDistance}) - w_5(\text{Delay})$$

### 2. Live Shipment & Escrow Handshake Tracker
- **Dynamic Truck & Shipment Selection**: Selecting any consignment dynamically updates vehicle registration (`UP-32-BZ-7890`), vehicle type, driver contact, cargo specs, and interactive map routes.
- **Cryptographic OTP Handshake**: Unique 4-digit `pickupOtp` and `deliveryOtp` pairs per shipment.
- **Photo Proof Verification**: Pickup and delivery require camera photo snapshots. Once verified:
  - Step transitions instantly to `✓ VERIFIED`.
  - Displays immutable photo proof thumbnail in the proof gallery.
  - Releases escrow payment directly to the driver wallet (`₹ PAID`).
- **Shipper Rating System**: 1-to-5 star rating dialog with written feedback upon successful delivery.

### 3. Transparent Dynamic Fare Engine (Sender Mode)
- Transparent, predictable formula:
  $$\text{Fare} = \text{₹50 Base Fee} + (\text{₹2/km} \times \text{Distance}) + (\text{₹1/kg} \times \text{Weight}) \times \text{Category Multiplier}$$
- Senders save **up to 65%** compared to booking dedicated solo trucks.

---

## 🏗️ System Architecture & Tech Stack

```
SIH_26/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # EnRouteToast, MapView, Modals, Navbar, Sidebar
│   │   ├── pages/              # DriverDashboard, SenderDashboard, TrackerDashboard, AdminDashboard
│   │   ├── services/           # api.js (Axios REST client), socket.js (Socket.IO client)
│   │   ├── context/            # AuthContext, LogisticsContext
│   │   └── App.jsx             # Main Router, Navigation & Live State
│   ├── .env.production         # Vercel Production Environment Variables
│   ├── vite.config.js          # Vite Config with /api & /socket.io Dev Proxy
│   └── package.json
├── server/                     # Backend API & Socket Server (Node.js + Express)
│   ├── src/
│   │   ├── routes/             # auth, trips, shipments, ratings, demo
│   │   ├── services/           # matchingEngine.js, pricingEngine.js, routingService.js
│   │   ├── db.js               # SQLite Database & Schema Layer
│   │   └── index.js            # Express Entrypoint & Socket.IO Handler
│   └── package.json
└── README.md
```

### Technology Matrix
| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Leaflet / React-Leaflet, Lucide React, Canvas Confetti |
| **Backend** | Node.js (v20+), Express.js, Socket.IO, `node:sqlite` (SQLite Database) |
| **Algorithms** | Vector Polyline Projection, Haversine Geodesic Math, Knapsack Greedy Optimizer |
| **Deployment** | **Vercel** (Frontend SPA) + **Render** (Node.js Web Service Backend) |

---

## 📡 API Endpoint Reference

### 🔐 Authentication & KYC
- `POST /api/auth/register` — Register driver or sender account
- `POST /api/auth/login` — Authenticate and retrieve JWT token
- `POST /api/auth/verify-aadhaar` — Verify Aadhaar / National ID KYC

### 🚚 Trips & Corridor Matching
- `GET /api/trips` — List all active driver trips
- `GET /api/trips/:id` — Get trip details, evaluated routes (A/B/C), and candidate cargo
- `POST /api/trips` — Create new freight trip with payload capacity
- `POST /api/trips/:id/select-route` — Switch active corridor route
- `GET /api/trips/:id/proximity-consignments` — Real-time 10 km proximity scan at GPS coordinates
- `POST /api/trips/:id/accept-enroute-consignment` — Lock en-route consignment into truck capacity
- `POST /api/trips/:id/decline-enroute-consignment` — Dismiss en-route opportunity

### 📦 Shipments & Delivery Handshake
- `GET /api/shipments` — List all shipments
- `POST /api/shipments` — Create shipment request
- `GET /api/shipments/fare-estimate` — Instant dynamic fare calculation
- `POST /api/shipments/:id/book-trip` — Book available truck space
- `POST /api/shipments/:id/verify-pickup` — Verify 4-digit pickup OTP + photo proof
- `POST /api/shipments/:id/verify-delivery` — Verify 4-digit delivery OTP + photo proof & release escrow
- `PATCH /api/shipments/:id/status` — Update shipment transit status

### ⭐ Ratings & Demo Hub
- `POST /api/ratings` — Submit driver rating & review
- `GET /api/ratings/:driverId` — Fetch driver rating history
- `POST /api/demo/seed` — Seed demo multi-stop highway corridor scenario
- `POST /api/demo/reset` — Reset database to 100% clean initial state
- `GET /api/demo/stats` — Platform metrics & KPI summary

---

## ⚙️ Local Development Setup

### 1. Clone & Setup Backend
```bash
cd server
npm install
node src/index.js
```
*Backend runs on `http://localhost:5000`*

### 2. Setup & Start Frontend
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (proxies `/api` to `http://localhost:5000` automatically)*

---

## 🧪 Demonstration Flow for SIH Jury

1. **System Reset**: Click **"Reset to Empty"** in the top navigation bar to verify clean initial state compliance.
2. **Seed Corridor Scenario**: Click **"Load SIH Demo"** to initialize the Lucknow → Varanasi corridor with candidate loads (Haidergarh, Nihalgarh, Sultanpur, Jaunpur).
3. **Driver Mode & Proximity Radar**:
   - Inspect Route A (Highway Express) vs Route B (Freight Corridor).
   - Click **`▶ Start Auto-Drive & Sensor`** — watch the truck drive along the highway polyline.
   - As the truck comes within 10 km of each consignment (Haidergarh $\to$ Sultanpur $\to$ Jaunpur), the top-right alert automatically rings with dynamic distance and earnings. Click **[Accept Cargo]**.
4. **Tracker & Escrow Handshake**:
   - Navigate to the **Tracker** tab.
   - Switch between shipments to inspect vehicle registration, driver phone, cargo details, and unique OTPs.
   - Click **"Verify Pickup OTP & Photo Proof"** $\to$ take snapshot $\to$ Step 2 turns green `VERIFIED` with photo thumbnail.
   - Click **"Verify Delivery OTP & Photo Proof"** $\to$ Step 4 turns green `VERIFIED`, releases escrow payment (`₹ PAID`), and opens driver rating.

---

## 🌐 Live Deployed Application Links

- 🔗 **Production Web Application (Vercel)**:  
  👉 **[https://sih-26-t02-path-finders.vercel.app/](https://sih-26-t02-path-finders.vercel.app/)**

- 🔗 **Production Backend API (Render)**:  
  👉 **[https://sih26-t02-pathfinders.onrender.com](https://sih26-t02-pathfinders.onrender.com)**
