'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { departments } from '@/lib/departments'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ documents: 0, tasks: 0, maintenance: 0, forms: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, tasksRes, maintenanceRes, formsRes] = await Promise.allSettled([
          fetch('/api/documents'),
          fetch('/api/tasks'),
          fetch('/api/maintenance'),
          fetch('/api/forms'),
        ])

        const docs = docsRes.status === 'fulfilled' && docsRes.value.ok ? await docsRes.value.json() : []
        const tasks = tasksRes.status === 'fulfilled' && tasksRes.value.ok ? await tasksRes.value.json() : []
        const maintenance = maintenanceRes.status === 'fulfilled' && maintenanceRes.value.ok ? await maintenanceRes.value.json() : []
        const forms = formsRes.status === 'fulfilled' && formsRes.value.ok ? await formsRes.value.json() : []

        setStats({
          documents: Array.isArray(docs) ? docs.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          maintenance: Array.isArray(maintenance) ? maintenance.length : 0,
          forms: Array.isArray(forms) ? forms.length : 0,
        })
      } catch (error) {
        // Silently fail - stats will show 0
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Documents', value: stats.documents, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Tasks', value: stats.tasks, color: 'bg-green-50 text-green-700' },
    { label: 'Maintenance Requests', value: stats.maintenance, color: 'bg-amber-50 text-amber-700' },
    { label: 'Forms', value: stats.forms, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <span className="text-sm font-bold">{stat.value}</span>
              </div>
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
              <div>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
