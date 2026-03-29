/**
 * Seed script — pushes demo data to Firestore.
 * Usage: node src/data/seedFirestore.mjs
 *
 * Requires a .env file with VITE_FIREBASE_* variables at the repo root.
 * Install dotenv first: npm install --save-dev dotenv
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env manually (dotenv doesn't auto-load for ESM scripts)
const envPath = resolve(__dirname, '../../.env')
let envVars = {}
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) envVars[key.trim()] = rest.join('=').trim()
  })
} catch {
  console.error('No .env file found at', envPath)
  process.exit(1)
}

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const drivers = [
  { firstName: 'Marcus', lastName: 'Johnson', employeeId: 'EMP-1042', cdlNumber: 'D620-4185-2190', cdlClass: 'A', cdlState: 'IL', cdlExpiration: daysFromNow(210), endorsements: ['H','N','T'], dateOfHire: '2019-03-15', phone: '(312) 555-0142', email: 'mjohnson@fleetguard.com', status: 'active' },
  { firstName: 'Sarah', lastName: 'Williams', employeeId: 'EMP-1078', cdlNumber: 'W450-7823-6654', cdlClass: 'A', cdlState: 'IN', cdlExpiration: daysFromNow(45), endorsements: ['H','T','X'], dateOfHire: '2020-07-22', phone: '(317) 555-0198', email: 'swilliams@fleetguard.com', status: 'active' },
  { firstName: 'David', lastName: 'Chen', employeeId: 'EMP-1103', cdlNumber: 'C280-5541-8837', cdlClass: 'B', cdlState: 'WI', cdlExpiration: daysFromNow(380), endorsements: ['P','S'], dateOfHire: '2021-01-10', phone: '(414) 555-0267', email: 'dchen@fleetguard.com', status: 'active' },
  { firstName: 'Angela', lastName: 'Martinez', employeeId: 'EMP-1055', cdlNumber: 'M670-3312-4498', cdlClass: 'A', cdlState: 'IL', cdlExpiration: daysFromNow(-15), endorsements: ['H','N'], dateOfHire: '2018-11-05', phone: '(773) 555-0334', email: 'amartinez@fleetguard.com', status: 'inactive' },
  { firstName: 'James', lastName: 'Thompson', employeeId: 'EMP-1091', cdlNumber: 'T390-6678-1123', cdlClass: 'A', cdlState: 'IN', cdlExpiration: daysFromNow(155), endorsements: ['H','T','N','X'], dateOfHire: '2020-02-18', phone: '(219) 555-0412', email: 'jthompson@fleetguard.com', status: 'active' },
  { firstName: 'Lisa', lastName: 'Patel', employeeId: 'EMP-1120', cdlNumber: 'P510-2294-7756', cdlClass: 'C', cdlState: 'WI', cdlExpiration: daysFromNow(290), endorsements: ['P'], dateOfHire: '2022-06-01', phone: '(608) 555-0589', email: 'lpatel@fleetguard.com', status: 'active' },
]

async function seed() {
  console.log('Seeding Firestore...')

  // Seed drivers and track IDs for certifications/incidents
  const driverIds = []
  for (const d of drivers) {
    const ref = await addDoc(collection(db, 'drivers'), d)
    driverIds.push(ref.id)
    console.log(`  + driver: ${d.firstName} ${d.lastName} → ${ref.id}`)
  }

  const certs = [
    { dIdx: 0, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-365), expirationDate: daysFromNow(365), notes: 'Passed with no restrictions' },
    { dIdx: 0, type: 'Hazardous Materials Endorsement', issueDate: daysFromNow(-180), expirationDate: daysFromNow(25), notes: 'Renewal pending' },
    { dIdx: 1, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-700), expirationDate: daysFromNow(-5), notes: 'EXPIRED' },
    { dIdx: 1, type: 'Tanker Endorsement', issueDate: daysFromNow(-300), expirationDate: daysFromNow(65), notes: '' },
    { dIdx: 2, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-200), expirationDate: daysFromNow(530), notes: '' },
    { dIdx: 2, type: 'Passenger Endorsement', issueDate: daysFromNow(-100), expirationDate: daysFromNow(265), notes: '' },
    { dIdx: 3, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-750), expirationDate: daysFromNow(-20), notes: 'EXPIRED' },
    { dIdx: 3, type: 'Hazardous Materials Endorsement', issueDate: daysFromNow(-500), expirationDate: daysFromNow(15), notes: 'Critical' },
    { dIdx: 4, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-300), expirationDate: daysFromNow(430), notes: '' },
    { dIdx: 4, type: 'Hazardous Materials Endorsement', issueDate: daysFromNow(-150), expirationDate: daysFromNow(85), notes: '' },
    { dIdx: 5, type: 'CDL Medical Card (DOT Physical)', issueDate: daysFromNow(-180), expirationDate: daysFromNow(550), notes: '' },
    { dIdx: 5, type: 'First Aid / CPR', issueDate: daysFromNow(-330), expirationDate: daysFromNow(35), notes: 'Schedule renewal' },
  ]

  for (const c of certs) {
    const d = drivers[c.dIdx]
    await addDoc(collection(db, 'certifications'), {
      driverId: driverIds[c.dIdx],
      driverName: `${d.firstName} ${d.lastName}`,
      type: c.type,
      issueDate: c.issueDate,
      expirationDate: c.expirationDate,
      notes: c.notes,
    })
  }
  console.log(`  + ${certs.length} certifications`)

  const incidents = [
    { dIdx: 1, date: daysFromNow(-12), type: 'Accident', severity: 'high', description: 'Rear-end collision at intersection.', location: 'Main St & 5th Ave, Indianapolis, IN', status: 'under_review', reviewNotes: 'Investigating camera footage', reviewedBy: 'Mike Torres' },
    { dIdx: 0, date: daysFromNow(-30), type: 'Moving Violation', severity: 'medium', description: 'Speeding ticket — 72 in a 55 zone.', location: 'I-94 Westbound, Lake County, IN', status: 'resolved', reviewNotes: 'Driver counseled.', reviewedBy: 'Karen Smith' },
    { dIdx: 4, date: daysFromNow(-5), type: 'Roadside Inspection', severity: 'low', description: 'Level 2 DOT inspection. Minor log book discrepancy.', location: 'Weigh Station, I-65 S, Lebanon, IN', status: 'closed', reviewNotes: 'Log book training refresher completed.', reviewedBy: 'Karen Smith' },
    { dIdx: 3, date: daysFromNow(-2), type: 'Equipment Failure', severity: 'high', description: 'Brake failure warning light on unit #TRK-2287.', location: 'US-41 Northbound, Terre Haute, IN', status: 'reported', reviewNotes: '', reviewedBy: '' },
    { dIdx: 2, date: daysFromNow(-18), type: 'Near Miss', severity: 'medium', description: 'Evasive maneuver on I-90.', location: 'I-90 Eastbound, Milwaukee, WI', status: 'resolved', reviewNotes: 'No fault assigned.', reviewedBy: 'Mike Torres' },
  ]

  for (const inc of incidents) {
    const d = drivers[inc.dIdx]
    await addDoc(collection(db, 'incidents'), {
      driverId: driverIds[inc.dIdx],
      driverName: `${d.firstName} ${d.lastName}`,
      date: inc.date,
      type: inc.type,
      severity: inc.severity,
      description: inc.description,
      location: inc.location,
      status: inc.status,
      reviewNotes: inc.reviewNotes,
      reviewedBy: inc.reviewedBy,
    })
  }
  console.log(`  + ${incidents.length} incidents`)

  console.log('Done! Firestore seeded successfully.')
  process.exit(0)
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
