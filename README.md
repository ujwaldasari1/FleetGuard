# FleetGuard — Driver Safety & Compliance Portal

A web application for managing commercial fleet driver safety records, certification tracking, and incident reporting. Built for the NEC Master's Residency System Development project.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS 3
- **Database:** Firebase Firestore (optional — works without it)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

## Quick Start

```bash
cd fleetguard
npm install
npm run dev
```

The app runs in **demo mode** by default using built-in seed data — no Firebase setup required.

## Firebase Setup (Optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Add a web app and copy the config
3. Enable **Firestore** in test mode
4. Create a `.env` file in the `fleetguard/` directory:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Seed demo data into Firestore:

```bash
npm run seed
```

## Roles

| Role | Dashboard | Manage Drivers | Manage Certs | Report Incidents | Review Incidents |
|------|-----------|---------------|-------------|-----------------|-----------------|
| Administrator | Yes | Yes | Yes | Yes | Yes |
| Safety Manager | Yes | Yes | Yes | Yes | Yes |
| Driver | No | View Only | View Only | Yes | No |

## Project Structure

```
src/
├── App.jsx              # Router + role gate
├── main.jsx             # Entry point
├── firebase.js          # Firebase init with fallback
├── context/RoleContext.jsx  # Global state + CRUD
├── components/
│   ├── Layout.jsx       # Sidebar + content area
│   └── Sidebar.jsx      # Navigation
├── pages/
│   ├── RoleSelector.jsx # Login screen
│   ├── Dashboard.jsx    # Stats + charts
│   ├── Drivers.jsx      # Driver CRUD
│   ├── Certifications.jsx
│   └── Incidents.jsx
├── utils/helpers.js     # Date calcs, constants
└── data/
    ├── seedData.js      # In-memory demo data
    └── seedFirestore.mjs # Firestore seed script
```
