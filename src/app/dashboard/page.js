'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ documents: 0, tasks: 0, maintenance: 0, forms: 0 })
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, tasksRes, maintenanceRes, formsRes, deptsRes] = await Promise.allSettled([
          fetch('/api/documents'),
          fetch('/api/tasks'),
          fetch('/api/maintenance'),
          fetch('/api/forms'),
          fetch('/api/departments'),
        ])

        const docs = docsRes.status === 'fulfilled' && docsRes.value.ok ? await docsRes.value.json() : []
        const tasks = tasksRes.status === 'fulfilled' && tasksRes.value.ok ? await tasksRes.value.json() : []
        const maintenance = maintenanceRes.status === 'fulfilled' && maintenanceRes.value.ok ? await maintenanceRes.value.json() : []
        const forms = formsRes.status === 'fulfilled' && formsRes.value.ok ? await formsRes.value.json() : []
        const depts = deptsRes.status === 'fulfilled' && deptsRes.value.ok ? await deptsRes.value.json() : []

        setStats({
          documents: Array.isArray(docs) ? docs.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          maintenance: Array.isArray(maintenance) ? maintenance.length : 0,
          forms: Array.isArray(forms) ? forms.length : 0,
        })
        setDepartments(Array.isArray(depts) ? depts.filter(d => d.isActive) : [])
      } catch (error) {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Documents', value: stats.documents, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Tasks', value: stats.tasks, color: 'bg-green-50 text-green-700' },
    { label: 'Maintenance Requests', value: stats.maintenance, color: 'bg-amber-50 text-amber-700' },
    { label: 'Forms', value: stats.forms, color: 'bg-purple-50 text-purple-700' },
  ]

  const colorBg = { blue:'bg-blue-50', teal:'bg-teal-50', green:'bg-green-50', yellow:'bg-yellow-50', orange:'bg-orange-50', red:'bg-red-50', purple:'bg-purple-50', gray:'bg-gray-50', pink:'bg-pink-50', indigo:'bg-indigo-50' }
  const colorText = { blue:'text-blue-700', teal:'text-teal-700', green:'text-green-700', yellow:'text-yellow-700', orange:'text-orange-700', red:'text-red-700', purple:'text-purple-700', gray:'text-gray-700', pink:'text-pink-700', indigo:'text-indigo-700' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">&copy; 2026 Gweru Specialist Children&apos;s Hospital — MediFile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <span className="text-sm font-bold">{loading ? '...' : stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Departments</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <Link
                key={dept.id}
                href={`/dashboard/department/${dept.code}`}
                className="card hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg ${colorBg[dept.color] || 'bg-gray-50'} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${colorText[dept.color] || 'text-gray-700'}`}>
                      {dept.shortName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors text-sm">
                    {dept.name}
                  </h4>
                </div>
                {dept.description && (
                  <p className="text-xs text-gray-500">{dept.description}</p>
                )}
                <div className="flex items-center mt-2 text-xs text-gray-400 space-x-3">
                  <span>{dept._count?.users || 0} users</span>
                  <span>{dept._count?.documents || 0} docs</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
