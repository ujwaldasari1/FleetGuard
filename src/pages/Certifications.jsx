import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import { canEdit, certStatus, formatDate, CERT_TYPES } from '../utils/helpers'
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react'

export default function Certifications() {
  const {
    role,
    drivers,
    certifications,
    addCertification,
    updateCertification,
    deleteCertification,
    loading,
  } = useRole()

  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    driverId: '',
    driverName: '',
    type: CERT_TYPES[0],
    issueDate: '',
    expirationDate: '',
    notes: '',
  })

  const editable = canEdit(role)

  const enriched = certifications.map((c) => ({ ...c, ...certStatus(c.expirationDate) }))

  const filtered = enriched.filter((c) => {
    if (statusFilter !== 'All' && c.label !== statusFilter) return false
    if (typeFilter !== 'All' && c.type !== typeFilter) return false
    return true
  })

  const certTypes = [...new Set(certifications.map((c) => c.type))].sort()
  const statusOptions = ['All', 'Valid', 'Expiring Soon', 'Warning', 'Critical', 'Expired']

  const openAdd = () => {
    setEditing(null)
    setForm({
      driverId: drivers[0]?.id || '',
      driverName: drivers[0] ? `${drivers[0].firstName} ${drivers[0].lastName}` : '',
      type: CERT_TYPES[0],
      issueDate: '',
      expirationDate: '',
      notes: '',
    })
    setShowModal(true)
  }

  const openEdit = (cert) => {
    setEditing(cert.id)
    setForm({
      driverId: cert.driverId,
      driverName: cert.driverName,
      type: cert.type,
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate,
      notes: cert.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this certification?')) {
      await deleteCertification(id)
    }
  }

  const handleDriverChange = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId)
    setForm((f) => ({
      ...f,
      driverId,
      driverName: driver ? `${driver.firstName} ${driver.lastName}` : '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await updateCertification(editing, form)
    } else {
      await addCertification(form)
    }
    setShowModal(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-500 text-sm">{certifications.length} certifications tracked</p>
        </div>
        {editable && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus size={18} /> Add Certification
          </button>
        )}
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
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
        >
          <option>All</option>
          {certTypes.map((t) => (
            <option key={t}>{t}</option>
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
                <th className="px-4 py-3 font-medium">Certification</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Days Left</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {editable && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.driverName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.issueDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.expirationDate)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {c.days < 0 ? `${Math.abs(c.days)} overdue` : c.days}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.color}`}>
                      {c.label}
                    </span>
                  </td>
                  {editable && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={editable ? 7 : 6} className="px-4 py-8 text-center text-gray-400">
                    No certifications match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editing ? 'Edit Certification' : 'Add Certification'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      {d.firstName} {d.lastName} ({d.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                >
                  {CERT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={form.expirationDate}
                    onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-medium"
                >
                  {editing ? 'Save Changes' : 'Add Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
