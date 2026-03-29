import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { Truck, Shield, UserCog, User } from 'lucide-react'

const roles = [
  {
    name: 'Administrator',
    description: 'Full system access. Manage drivers, certifications, incidents, and view dashboards.',
    icon: UserCog,
    color: 'border-blue-500 hover:bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Safety Manager',
    description: 'View dashboards, manage certifications, review incidents, and oversee compliance.',
    icon: Shield,
    color: 'border-green-500 hover:bg-green-50',
    iconBg: 'bg-green-100 text-green-600',
  },
  {
    name: 'Driver',
    description: 'View your certifications and report incidents. Read-only access to driver records.',
    icon: User,
    color: 'border-amber-500 hover:bg-amber-50',
    iconBg: 'bg-amber-100 text-amber-600',
  },
]

export default function RoleSelector() {
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')
  const { login } = useRole()
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!selectedRole) {
      setError('Please select a role')
      return
    }
    login(name.trim(), selectedRole)
    navigate(selectedRole === 'Driver' ? '/drivers' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <Truck size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FleetGuard</h1>
          <p className="text-navy-300 text-lg">Driver Safety & Compliance Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:border-navy-800 outline-none transition text-gray-900"
            />
          </div>

          {/* Role Cards */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
            <div className="grid gap-3">
              {roles.map((r) => (
                <button
                  key={r.name}
                  onClick={() => {
                    setSelectedRole(r.name)
                    setError('')
                  }}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                    selectedRole === r.name
                      ? `${r.color} bg-opacity-50 ring-2 ring-offset-1 ring-navy-800 border-navy-800`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${r.iconBg}`}>
                    <r.icon size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-navy-800 hover:bg-navy-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue to FleetGuard
          </button>
        </div>

        <p className="text-center text-navy-400 text-xs mt-6">
          Demo Mode — No authentication required
        </p>
      </div>
    </div>
  )
}
