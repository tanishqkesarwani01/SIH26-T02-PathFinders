# LoadLink - Shared Logistics & Route Optimization Platform
### Internal Smart India Hackathon (SIH 2026) • Problem #4: Logistics & Transportation

LoadLink solves the issue of **deadhead empty-mile freight wastage** and **high individual shipping costs** by pairing senders with en-route commercial trucks that have spare cargo capacity along primary and alternative highway corridors (e.g. Lucknow → Varanasi via Sultanpur, Raebareli, Ayodhya, Prayagraj).

---

## 🚀 Key Features

1. **Collapsible 3-Mode Architecture**:
   - **Driver Mode**: Post trip routes, evaluate candidate corridor options (Route A, Route B, Route C), view compatible cargo with match scores, and bundle shipments.
   - **Sender Mode**: Create shipment requests, calculate instant transparent fares ($\text{₹50 base} + \text{₹2/km} + \text{₹1/kg} \times \text{category multiplier}$), see up to 65% cost savings vs solo mini-truck hire, and book available en-route vehicles.
   - **Shipment Tracker**: Real-time Leaflet/OSM map tracking, cryptographic OTP verification (Pickup & Delivery), immutable photo handover logs, and instant escrow payment release.
   - **System & Demo Hub**: 1-click database reset and SIH 2026 demonstration data loader.

2. **Matching & Optimization Engine**:
   - Constraint checks: Capacity feasibility, detour threshold, and time window compatibility.
   - Composite scoring formula:
     $$\text{MatchScore} = w_1(\text{RouteOverlap}) + w_2(\text{UtilizationGain}) + w_3(\text{Revenue}) - w_4(\text{DetourDistance}) - w_5(\text{Delay})$$
   - Knapsack greedy cargo bundling for truck capacity maximization.

3. **Trust & Delivery Verification**:
   - Government Aadhaar / National ID KYC.
   - 4-digit Pickup OTP + parcel condition photo proof.
   - 4-digit Delivery OTP + recipient handover photo proof.
   - Automated Escrow Wallet lock and release upon delivery.
   - Post-delivery 1-5 star driver rating & feedback system.

---

## 🛠️ Project Structure

```
loadlink-logistics/
├── client/                 # React 19 + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/     # Sidebar, MapView, Modals, AdminDemoBar
│   │   ├── pages/          # Driver, Sender, Tracker, Admin Dashboards
│   │   ├── services/       # REST API client
│   │   └── App.jsx         # App root & navigation
│   └── package.json
├── server/                 # Node.js + Express + Socket.io + Database
│   ├── src/
│   │   ├── routes/         # auth, trips, shipments, ratings, demo
│   │   ├── services/       # matchingEngine.js, pricingEngine.js
│   │   ├── db.js           # Relational schema and demo seeder
│   │   └── index.js        # Server entrypoint
│   └── package.json
└── README.md
```

---

## ⚙️ Quick Start

### 1. Start Backend Server
```bash
cd server
npm install
node src/index.js
```
*Backend runs on `http://localhost:5000`*

### 2. Start Frontend App
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Demo Instructions for SIH Jury
1. Open `http://localhost:5173`.
2. Click **"Reset to Empty"** in the top bar to show 100% clean initial state compliance.
3. Click **"Load SIH Demo (Lucknow → Varanasi)"** to load the multi-corridor route and sample candidate shipments.
4. Explore **Driver Mode** (Routes A/B/C), **Sender Mode** (Fare calculation & booking), and **Tracker Mode** (OTP verification & escrow release).
