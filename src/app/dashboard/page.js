'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const HIERARCHY = {
  MANAGEMENT: { tier: 1, label: 'Executive', dot: '#475569' },
  HOSPITAL_RELATIONS: { tier: 2, label: 'Relations', dot: '#4f46e5' },
  CRD: { tier: 3, label: 'Clinical', dot: '#2563eb' },
  PATIENT_CARE: { tier: 3, label: 'Clinical', dot: '#0d9488' },
  BILLING: { tier: 4, label: 'Finance', dot: '#16a34a' },
  ACCOUNTS: { tier: 4, label: 'Finance', dot: '#059669' },
  IT: { tier: 4, label: 'Support', dot: '#7c3aed' },
  KITCHEN: { tier: 5, label: 'Facilities', dot: '#ea580c' },
  SAFETY_MAINTENANCE: { tier: 5, label: 'Facilities', dot: '#dc2626' },
}

const DEPT_COLORS = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  gray: 'bg-slate-50 text-slate-700 border-slate-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const STAT_ICONS = {
  Documents: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  Tasks: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  Maintenance: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654',
  Forms: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z',
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ documents: 0, tasks: 0, maintenance: 0, forms: 0 })
  const [departments, setDepartments] = useState([])
  const [pendingRoutes, setPendingRoutes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, tasksRes, maintenanceRes, formsRes, deptsRes, routesRes] = await Promise.allSettled([
          fetch('/api/documents'),
          fetch('/api/tasks'),
          fetch('/api/maintenance'),
          fetch('/api/forms'),
          fetch('/api/departments'),
          fetch('/api/routes?direction=incoming'),
        ])
        const docs = docsRes.status === 'fulfilled' && docsRes.value.ok ? await docsRes.value.json() : []
        const tasks = tasksRes.status === 'fulfilled' && tasksRes.value.ok ? await tasksRes.value.json() : []
        const maint = maintenanceRes.status === 'fulfilled' && maintenanceRes.value.ok ? await maintenanceRes.value.json() : []
        const forms = formsRes.status === 'fulfilled' && formsRes.value.ok ? await formsRes.value.json() : []
        const depts = deptsRes.status === 'fulfilled' && deptsRes.value.ok ? await deptsRes.value.json() : []
        const routes = routesRes.status === 'fulfilled' && routesRes.value.ok ? await routesRes.value.json() : []

        setStats({ documents: Array.isArray(docs) ? docs.length : 0, tasks: Array.isArray(tasks) ? tasks.length : 0, maintenance: Array.isArray(maint) ? maint.length : 0, forms: Array.isArray(forms) ? forms.length : 0 })
        setDepartments(Array.isArray(depts) ? depts.filter(d => d.isActive) : [])
        setPendingRoutes(Array.isArray(routes) ? routes.filter(r => r.status === 'PENDING').length : 0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sortedDepts = [...departments].sort((a, b) => {
    const tA = HIERARCHY[a.code]?.tier ?? 99
    const tB = HIERARCHY[b.code]?.tier ?? 99
    return tA - tB
  })

  const statCards = [
    { label: 'Documents', value: stats.documents, href: '/dashboard/documents', color: 'bg-blue-500', icon: STAT_ICONS.Documents },
    { label: 'Active Tasks', value: stats.tasks, href: '/dashboard/tasks', color: 'bg-emerald-500', icon: STAT_ICONS.Tasks },
    { label: 'Maintenance', value: stats.maintenance, href: '/dashboard/maintenance', color: 'bg-amber-500', icon: STAT_ICONS.Maintenance },
    { label: 'Forms', value: stats.forms, href: '/dashboard/forms', color: 'bg-purple-500', icon: STAT_ICONS.Forms },
  ]

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {pendingRoutes > 0 && (
          <Link href="/dashboard/documents" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-amber-100 transition-colors">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">{pendingRoutes}</div>
            Pending routed document{pendingRoutes > 1 ? 's' : ''} to review
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} bg-opacity-10 flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? <span className="text-gray-200">—</span> : stat_value(card.value)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Departments with hierarchy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Departments</h2>
          <Link href="/dashboard/hierarchy" className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
            View hierarchy
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedDepts.map(dept => {
              const h = HIERARCHY[dept.code]
              const colorClass = DEPT_COLORS[dept.color] || DEPT_COLORS.gray
              const isMyDept = dept.code === session?.user?.departmentCode
              return (
                <Link key={dept.id} href={`/dashboard/department/${dept.code}`}
                  className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all group relative overflow-hidden ${
                    isMyDept ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  {isMyDept && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                      <span className="text-[10px] font-bold">{dept.shortName.substring(0, 2).toUpperCase()}</span>
                    </div>
                    {h && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: h.dot }} />
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider">{h.label}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-snug group-hover:text-primary-700 transition-colors">{dept.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span>{dept._count?.users ?? 0} staff</span>
                    {dept._count?.documents > 0 && <><span>·</span><span>{dept._count.documents} docs</span></>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function stat_value(v) { return v }
