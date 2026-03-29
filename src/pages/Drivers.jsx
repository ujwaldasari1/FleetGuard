import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import { canEdit, formatDate, CDL_CLASSES, US_STATES, ENDORSEMENTS } from '../utils/helpers'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const emptyForm = {
  firstName: '',
  lastName: '',
  employeeId: '',
  cdlNumber: '',
  cdlClass: 'A',
  cdlState: 'IL',
  cdlExpiration: '',
  endorsements: [],
  dateOfHire: '',
  phone: '',
  email: '',
  status: 'active',
}

export default function Drivers() {
  const { role, drivers, addDriver, updateDriver, deleteDriver, loading } = useRole()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const editable = canEdit(role)

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase()
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.employeeId.toLowerCase().includes(q) ||
      d.cdlNumber.toLowerCase().includes(q)
    )
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (driver) => {
    setEditing(driver.id)
    setForm({ ...driver })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this driver?')) {
      await deleteDriver(id)
    }
  }

  const toggleEndorsement = (e) => {
    setForm((f) => ({
      ...f,
      endorsements: f.endorsements.includes(e)
        ? f.endorsements.filter((x) => x !== e)
        : [...f.endorsements, e],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { id, ...data } = form
    if (editing) {
      await updateDriver(editing, data)
    } else {
      await addDriver(data)
    }
    setShowModal(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-500 text-sm">{drivers.length} total drivers</p>
        </div>
        {editable && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus size={18} /> Add Driver
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, employee ID, or CDL number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:border-navy-800 outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Employee ID</th>
                <th className="px-4 py-3 font-medium">CDL</th>
                <th className="px-4 py-3 font-medium">CDL Expiration</th>
                <th className="px-4 py-3 font-medium">Endorsements</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {editable && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.firstName} {d.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.employeeId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    Class {d.cdlClass} — {d.cdlState}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(d.cdlExpiration)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {d.endorsements.map((e) => (
                        <span
                          key={e}
                          className="bg-navy-100 text-navy-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  {editable && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700">
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
                    No drivers found
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    required
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL Number</label>
                  <input
                    required
                    value={form.cdlNumber}
                    onChange={(e) => setForm({ ...form, cdlNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL Class</label>
                  <select
                    value={form.cdlClass}
                    onChange={(e) => setForm({ ...form, cdlClass: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  >
                    {CDL_CLASSES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL State</label>
                  <select
                    value={form.cdlState}
                    onChange={(e) => setForm({ ...form, cdlState: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  >
                    {US_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL Expiration</label>
                  <input
                    type="date"
                    required
                    value={form.cdlExpiration}
                    onChange={(e) => setForm({ ...form, cdlExpiration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endorsements</label>
                <div className="flex gap-2 flex-wrap">
                  {ENDORSEMENTS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleEndorsement(e)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.endorsements.includes(e)
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-navy-800'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Hire</label>
                  <input
                    type="date"
                    value={form.dateOfHire}
                    onChange={(e) => setForm({ ...form, dateOfHire: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-800 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  {editing ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
