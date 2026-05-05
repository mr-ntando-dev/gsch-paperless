'use client'
import { useSession } from 'next-auth/react'
import { departments } from '@/lib/departments'
import Link from 'next/link'

const stats = [
  { label: 'Total Documents', value: '1,247', change: '+12%', icon: '📄' },
  { label: 'Pending Approvals', value: '23', change: '-5%', icon: '⏳' },
  { label: 'Active Tasks', value: '45', change: '+8%', icon: '✅' },
  { label: 'Forms Submitted', value: '89', change: '+20%', icon: '📝' },
]

const recentActivity = [
  { action: 'Document approved', detail: 'Patient discharge summary - Ward A', time: '5 min ago', icon: '✅' },
  { action: 'New task created', detail: 'Monthly safety audit - Block B', time: '15 min ago', icon: '📋' },
  { action: 'Form submitted', detail: 'Kitchen hygiene checklist', time: '30 min ago', icon: '📝' },
  { action: 'Maintenance completed', detail: 'AC repair - Reception area', time: '1 hour ago', icon: '🔧' },
  { action: 'Invoice generated', detail: 'INV-2024-0892 - $2,450', time: '2 hours ago', icon: '💰' },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Departments Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Departments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(departments).map(([key, dept]) => (
            <Link
              key={key}
              href={`/dashboard/department/${key.toLowerCase()}`}
              className="card hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{dept.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {dept.modules.slice(0, 3).map((mod) => (
                      <span key={mod} className="badge bg-gray-100 text-gray-600">{mod}</span>
                    ))}
                    {dept.modules.length > 3 && (
                      <span className="badge bg-primary-50 text-primary-700">+{dept.modules.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.detail}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
