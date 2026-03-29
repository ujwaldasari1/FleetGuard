export function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

export function certStatus(expirationDate) {
  const days = daysUntil(expirationDate)
  if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800', days }
  if (days <= 30) return { label: 'Critical', color: 'bg-red-100 text-red-800', days }
  if (days <= 60) return { label: 'Warning', color: 'bg-amber-100 text-amber-800', days }
  if (days <= 90) return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', days }
  return { label: 'Valid', color: 'bg-green-100 text-green-800', days }
}

export function severityColor(severity) {
  const map = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
  }
  return map[severity] || 'bg-gray-100 text-gray-800'
}

export function incidentStatusColor(status) {
  const map = {
    reported: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const CERT_TYPES = [
  'CDL Medical Card (DOT Physical)',
  'Hazardous Materials Endorsement',
  'Tanker Endorsement',
  'Doubles/Triples Endorsement',
  'Passenger Endorsement',
  'School Bus Endorsement',
  'Defensive Driving Course',
  'Smith System Training',
  'OSHA Safety Certification',
  'First Aid / CPR',
]

export const INCIDENT_TYPES = [
  'Accident',
  'Moving Violation',
  'Roadside Inspection',
  'Near Miss',
  'Equipment Failure',
  'Injury',
  'Other',
]

export const ENDORSEMENTS = ['H', 'N', 'P', 'S', 'T', 'X']

export const CDL_CLASSES = ['A', 'B', 'C']

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

export function canEdit(role) {
  return role === 'Administrator' || role === 'Safety Manager'
}
