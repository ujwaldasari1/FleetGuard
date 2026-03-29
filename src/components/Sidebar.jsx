import { NavLink } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { LayoutDashboard, Users, ShieldCheck, AlertTriangle, LogOut, Truck } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Safety Manager'] },
  { to: '/drivers', label: 'Drivers', icon: Users, roles: ['Administrator', 'Safety Manager', 'Driver'] },
  { to: '/certifications', label: 'Certifications', icon: ShieldCheck, roles: ['Administrator', 'Safety Manager', 'Driver'] },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['Administrator', 'Safety Manager', 'Driver'] },
]

export default function Sidebar() {
  const { role, userName, logout } = useRole()

  const roleBadgeColor = {
    Administrator: 'bg-blue-500',
    'Safety Manager': 'bg-green-500',
    Driver: 'bg-amber-500',
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-800 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-700">
        <div className="bg-green-500 p-2 rounded-lg">
          <Truck size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">FleetGuard</h1>
          <p className="text-xs text-navy-300">Safety & Compliance</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links
          .filter((link) => link.roles.includes(role))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-200 hover:bg-navy-700/50 hover:text-white'
                }`
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-navy-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-sm font-semibold">
            {userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${
                roleBadgeColor[role] || 'bg-gray-500'
              }`}
            >
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-navy-300 hover:text-white text-sm w-full transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
