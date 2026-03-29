import { useRole } from '../context/RoleContext'
import { certStatus, formatDate } from '../utils/helpers'
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const PIE_COLORS = ['#22C55E', '#F59E0B', '#EF4444']
const BAR_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6B7280']

export default function Dashboard() {
  const { userName, drivers, certifications, incidents, loading } = useRole()

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
  }

  const activeDrivers = drivers.filter((d) => d.status === 'active').length

  const certStatuses = certifications.map((c) => certStatus(c.expirationDate))
  const validCount = certStatuses.filter((s) => s.label === 'Valid').length
  const expiringCount = certStatuses.filter((s) => s.label === 'Expiring Soon' || s.label === 'Warning').length
  const expiredCount = certStatuses.filter((s) => s.label === 'Expired').length
  const criticalCount = certStatuses.filter((s) => s.label === 'Critical').length
  const openIncidents = incidents.filter((i) => i.status === 'reported' || i.status === 'under_review').length

  const pieData = [
    { name: 'Valid', value: validCount },
    { name: 'Warning/Expiring', value: expiringCount },
    { name: 'Critical/Expired', value: criticalCount + expiredCount },
  ]

  // Incidents by type
  const incidentTypeCounts = {}
  incidents.forEach((i) => {
    incidentTypeCounts[i.type] = (incidentTypeCounts[i.type] || 0) + 1
  })
  const barData = Object.entries(incidentTypeCounts).map(([name, count]) => ({ name, count }))

  // Urgent certs (within 30 days)
  const urgentCerts = certifications
    .map((c) => ({ ...c, ...certStatus(c.expirationDate) }))
    .filter((c) => c.days <= 30)
    .sort((a, b) => a.days - b.days)

  const stats = [
    { label: 'Active Drivers', value: activeDrivers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Valid Certs', value: validCount, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Expiring / Warning', value: expiringCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expired', value: expiredCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Open Incidents', value: openIncidents, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Certs Tracked', value: certifications.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="text-gray-500">Fleet compliance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certification Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Urgent Certs Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Urgent Certifications — Expiring Within 30 Days
        </h2>
        {urgentCerts.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No urgent certifications at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Driver</th>
                  <th className="pb-3 font-medium">Certification</th>
                  <th className="pb-3 font-medium">Expiration</th>
                  <th className="pb-3 font-medium">Days Left</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {urgentCerts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{c.driverName}</td>
                    <td className="py-3 text-gray-600">{c.type}</td>
                    <td className="py-3 text-gray-600">{formatDate(c.expirationDate)}</td>
                    <td className="py-3">
                      <span className="font-semibold text-gray-900">{c.days < 0 ? `${Math.abs(c.days)} overdue` : c.days}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.color}`}>
                        {c.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
