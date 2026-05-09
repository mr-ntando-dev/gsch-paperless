'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import MiniBarChart from '@/components/MiniBarChart'

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
  const [stats, setStats] = useState({ documents: 0, tasks: 0, maintenance: 0, forms: 0, patients: 0, admissions: 0, invoices: 0, assets: 0 })
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [departments, setDepartments] = useState([])
  const [pendingRoutes, setPendingRoutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, tasksRes, maintenanceRes, formsRes, deptsRes, routesRes, patientsRes, admissionsRes, invoicesRes, assetsRes] = await Promise.allSettled([
          fetch('/api/documents'),
          fetch('/api/tasks'),
          fetch('/api/maintenance'),
          fetch('/api/forms'),
          fetch('/api/departments'),
          fetch('/api/routes?direction=incoming'),
          fetch('/api/patients'),
          fetch('/api/admissions?status=ADMITTED'),
          fetch('/api/invoices?status=UNPAID'),
          fetch('/api/inventory'),
        ])
        const docs = docsRes.status === 'fulfilled' && docsRes.value.ok ? await docsRes.value.json() : []
        const tasks = tasksRes.status === 'fulfilled' && tasksRes.value.ok ? await tasksRes.value.json() : []
        const maint = maintenanceRes.status === 'fulfilled' && maintenanceRes.value.ok ? await maintenanceRes.value.json() : []
        const forms = formsRes.status === 'fulfilled' && formsRes.value.ok ? await formsRes.value.json() : []
        const depts = deptsRes.status === 'fulfilled' && deptsRes.value.ok ? await deptsRes.value.json() : []
        const routes = routesRes.status === 'fulfilled' && routesRes.value.ok ? await routesRes.value.json() : []
        const patients = patientsRes.status === 'fulfilled' && patientsRes.value.ok ? await patientsRes.value.json() : []
        const admissions = admissionsRes.status === 'fulfilled' && admissionsRes.value.ok ? await admissionsRes.value.json() : []
        const invoices = invoicesRes.status === 'fulfilled' && invoicesRes.value.ok ? await invoicesRes.value.json() : []
        const assets = assetsRes.status === 'fulfilled' && assetsRes.value.ok ? await assetsRes.value.json() : []

        setStats({ documents: Array.isArray(docs) ? docs.length : 0, tasks: Array.isArray(tasks) ? tasks.length : 0, maintenance: Array.isArray(maint) ? maint.length : 0, forms: Array.isArray(forms) ? forms.length : 0, patients: Array.isArray(patients) ? patients.length : 0, admissions: Array.isArray(admissions) ? admissions.length : 0, invoices: Array.isArray(invoices) ? invoices.length : 0, assets: Array.isArray(assets) ? assets.length : 0 })
        // Count overdue tasks (due date in past, not DONE)
        const now = new Date()
        const overdueCount = Array.isArray(tasks) ? tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length : 0
        setOverdueTasks(overdueCount)
        setDepartments(Array.isArray(depts) ? depts.filter(d => d.isActive) : [])
        setPendingRoutes(Array.isArray(routes) ? routes.filter(r => r.status === 'PENDING').length : 0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // Load chart data separately
    fetch('/api/reports/charts').then(r => r.ok ? r.json() : null).then(d => setChartData(d)).catch(() => {})
  }, [])

  const sortedDepts = [...departments].sort((a, b) => {
    const tA = HIERARCHY[a.code]?.tier ?? 99
    const tB = HIERARCHY[b.code]?.tier ?? 99
    return tA - tB
  })

  const role = session?.user?.role
  const deptCode = session?.user?.departmentCode

  // Role-based stat cards
  const isPatientCare = ['PATIENT_CARE', 'CRD'].includes(deptCode) || ['SUPERADMIN','ADMIN'].includes(role)
  const isBilling = ['BILLING', 'ACCOUNTS'].includes(deptCode) || ['SUPERADMIN','ADMIN'].includes(role)
  const isIT = deptCode === 'IT' || ['SUPERADMIN','ADMIN'].includes(role)
  const isKitchen = deptCode === 'KITCHEN' || ['SUPERADMIN','ADMIN'].includes(role)
  const isMaintenance = deptCode === 'SAFETY_MAINTENANCE' || ['SUPERADMIN','ADMIN'].includes(role)

  const allStatCards = [
    { label: 'Documents', value: stats.documents, href: '/dashboard/documents', color: 'bg-blue-500', icon: STAT_ICONS.Documents, show: true },
    { label: 'Active Tasks', value: stats.tasks, href: '/dashboard/tasks', color: 'bg-emerald-500', icon: STAT_ICONS.Tasks, show: true, overdue: overdueTasks },
    { label: 'Patients', value: stats.patients, href: '/dashboard/patients', color: 'bg-teal-500', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0', show: isPatientCare },
    { label: 'Admitted', value: stats.admissions, href: '/dashboard/admissions', color: 'bg-red-500', icon: 'M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z', show: isPatientCare },
    { label: 'Unpaid Invoices', value: stats.invoices, href: '/dashboard/invoices', color: 'bg-orange-500', icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z', show: isBilling },
    { label: 'IT Assets', value: stats.assets, href: '/dashboard/inventory', color: 'bg-purple-500', icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3', show: isIT },
    { label: 'Maintenance', value: stats.maintenance, href: '/dashboard/maintenance', color: 'bg-amber-500', icon: STAT_ICONS.Maintenance, show: isMaintenance },
    { label: 'Forms', value: stats.forms, href: '/dashboard/forms', color: 'bg-purple-500', icon: STAT_ICONS.Forms, show: true },
  ]
  const statCards = allStatCards.filter(c => c.show)

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

      {/* Overdue tasks alert */}
      {overdueTasks > 0 && (
        <Link href="/dashboard/tasks"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 hover:bg-red-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''} need your attention
            </p>
            <p className="text-xs text-red-500">Click to view and action them</p>
          </div>
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}

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
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-gray-500">{card.label}</p>
              {card.overdue > 0 && !loading && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                  {card.overdue} overdue
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* New feature quick links */}
      {isPatientCare && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Medications', href: '/dashboard/medications', color: 'bg-teal-500', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.698-1.414 2.698H4.213c-1.444 0-2.414-1.698-1.414-2.698L4.2 15.3' },
            { label: 'Appointments', href: '/dashboard/appointments', color: 'bg-blue-500', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
            { label: 'Vaccinations', href: '/dashboard/vaccinations', color: 'bg-pink-500', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z' },
            { label: 'Shift Roster', href: '/dashboard/shifts', color: 'bg-indigo-500', icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartData && isPatientCare && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admissions — Last 7 Days</p>
            <p className="text-2xl font-bold text-gray-800 mb-3">{chartData.admissionsTrend?.data?.reduce((a, b) => a + b, 0) || 0} total</p>
            <MiniBarChart data={chartData.admissionsTrend?.data || []} labels={chartData.admissionsTrend?.labels || []} color="#0d9488" height={56} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Patients by Type</p>
            <div className="space-y-2">
              {[
                { label: 'Admitted', value: chartData.patientsByType?.admitted || 0, color: 'bg-red-400' },
                { label: 'Observation', value: chartData.patientsByType?.observation || 0, color: 'bg-amber-400' },
                { label: 'Day Care', value: chartData.patientsByType?.daycare || 0, color: 'bg-blue-400' },
                { label: 'Outpatient', value: chartData.patientsByType?.outpatient || 0, color: 'bg-gray-300' },
              ].map(row => {
                const total = (chartData.patientsByType?.admitted || 0) + (chartData.patientsByType?.observation || 0) + (chartData.patientsByType?.daycare || 0) + (chartData.patientsByType?.outpatient || 0)
                const pct = total > 0 ? Math.round((row.value / total) * 100) : 0
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-600">{row.label}</span><span className="font-semibold text-gray-800">{row.value}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`${row.color} h-1.5 rounded-full transition-all`} style={{ width: pct + '%' }} /></div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Medications</p>
            <div className="flex items-end gap-4">
              <div><p className="text-3xl font-bold text-teal-600">{chartData.medications?.active || 0}</p><p className="text-xs text-gray-400">Active</p></div>
              <div><p className="text-xl font-bold text-gray-400">{chartData.medications?.stopped || 0}</p><p className="text-xs text-gray-400">Stopped/Done</p></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link href="/dashboard/medications" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Manage medications →</Link>
            </div>
          </div>
        </div>
      )}

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
