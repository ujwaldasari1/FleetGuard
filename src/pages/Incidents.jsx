import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import {
  canEdit,
  formatDate,
  severityColor,
  incidentStatusColor,
  INCIDENT_TYPES,
} from '../utils/helpers'
import { Plus, Filter, Eye, X } from 'lucide-react'

export default function Incidents() {
  const { role, userName, drivers, incidents, addIncident, updateIncident, loading } = useRole()
  const editable = canEdit(role)

  const [statusFilter, setStatusFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [showReportModal, setShowReportModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)

  const [form, setForm] = useState({
    driverId: '',
    driverName: '',
    date: '',
    type: INCIDENT_TYPES[0],
    severity: 'medium',
    location: '',
    description: '',
  })

  const [reviewForm, setReviewForm] = useState({
    status: 'under_review',
    reviewNotes: '',
    reviewedBy: '',
  })

  const filtered = incidents.filter((i) => {
    if (statusFilter !== 'All' && i.status !== statusFilter) return false
    if (severityFilter !== 'All' && i.severity !== severityFilter) return false
    return true
  })

  const openReport = () => {
    setForm({
      driverId: drivers[0]?.id || '',
      driverName: drivers[0] ? `${drivers[0].firstName} ${drivers[0].lastName}` : '',
      date: new Date().toISOString().split('T')[0],
      type: INCIDENT_TYPES[0],
      severity: 'medium',
      location: '',
      description: '',
    })
    setShowReportModal(true)
  }

  const handleDriverChange = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId)
    setForm((f) => ({
      ...f,
      driverId,
      driverName: driver ? `${driver.firstName} ${driver.lastName}` : '',
    }))
  }

  const handleReport = async (e) => {
    e.preventDefault()
    await addIncident({
      ...form,
      status: 'reported',
      reviewNotes: '',
      reviewedBy: '',
    })
    setShowReportModal(false)
  }

  const openReview = (incident) => {
    setReviewTarget(incident)
    setReviewForm({
      status: incident.status === 'reported' ? 'under_review' : incident.status,
      reviewNotes: incident.reviewNotes || '',
      reviewedBy: incident.reviewedBy || userName,
    })
    setShowReviewModal(true)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    await updateIncident(reviewTarget.id, reviewForm)
    setShowReviewModal(false)
  }

  const statusOptions = ['All', 'reported', 'under_review', 'resolved', 'closed']
  const severityOptions = ['All', 'high', 'medium', 'low']

  const statusLabel = (s) =>
    s === 'under_review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1)

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 text-sm">{incidents.length} total incidents</p>
        </div>
        <button
          onClick={openReport}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={18} /> Report Incident
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
        >
          {severityOptions.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {editable && <th className="px-4 py-3 font-medium">Review</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.driverName}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(i.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{i.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityColor(i.severity)}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{i.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${incidentStatusColor(
                        i.status
                      )}`}
                    >
                      {statusLabel(i.status)}
                    </span>
                  </td>
                  {editable && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openReview(i)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Review Incident"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={editable ? 7 : 6} className="px-4 py-8 text-center text-gray-400">
                    No incidents match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Report Incident</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  required
                  value={form.driverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. I-94 Westbound, Lake County, IN"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-medium"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Review Incident</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Incident Summary */}
            <div className="px-6 pt-4 pb-2 space-y-1 text-sm border-b bg-gray-50">
              <p>
                <span className="font-medium text-gray-700">Driver:</span> {reviewTarget.driverName}
              </p>
              <p>
                <span className="font-medium text-gray-700">Type:</span> {reviewTarget.type} —{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityColor(reviewTarget.severity)}`}>
                  {reviewTarget.severity}
                </span>
              </p>
              <p className="text-gray-600">{reviewTarget.description}</p>
            </div>

            <form onSubmit={handleReview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                >
                  <option value="reported">Reported</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                <textarea
                  rows={3}
                  value={reviewForm.reviewNotes}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                <input
                  value={reviewForm.reviewedBy}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewedBy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-medium"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
