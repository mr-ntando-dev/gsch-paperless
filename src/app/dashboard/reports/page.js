'use client'
import { useState, useEffect } from 'react'

const BAR_COLORS = { ADMITTED: '#ef4444', OBSERVATION: '#f59e0b', DAYCARE: '#3b82f6', OUTPATIENT: '#6b7280' }
const STATUS_COLORS = { UNPAID: '#ef4444', PARTIAL: '#f59e0b', PAID: '#22c55e', CANCELLED: '#9ca3af', TODO: '#6b7280', IN_PROGRESS: '#3b82f6', DONE: '#22c55e', REVIEW: '#8b5cf6', OPEN: '#ef4444', IN_PROGRESS_M: '#f59e0b', RESOLVED: '#22c55e', CLOSED: '#9ca3af' }

function MiniBar({ data, colorMap, labelKey, valueKey }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="space-y-2 mt-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24 truncate flex-shrink-0">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${(d[valueKey] / max) * 100}%`, backgroundColor: colorMap?.[d[labelKey]] || '#6366f1' }} />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-8 text-gray-400 text-xs">No data</div>
  const max = Math.max(...data.map(d => d.count), 1)
  const w = 100 / (data.length - 1 || 1)
  const points = data.map((d, i) => `${i * w},${100 - (d.count / max) * 85}`).join(' ')
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 100 100`} className="w-full h-28 overflow-visible" preserveAspectRatio="none">
        <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
        <polyline fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" points={points} vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => <circle key={i} cx={i * w} cy={100 - (d.count / max) * 85} r="1.5" fill="#6366f1" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => <span key={i} className="text-[10px] text-gray-400">{d.month}</span>)}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Loading reports...</div>
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load report data.</div>

  const { summary, charts } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live data across all hospital modules</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: summary.totalPatients, color: 'text-blue-700 bg-blue-50' },
          { label: 'Active Admissions', value: summary.activeAdmissions, color: 'text-red-700 bg-red-50' },
          { label: 'Under Observation', value: summary.activeObservations, color: 'text-yellow-700 bg-yellow-50' },
          { label: 'Open Maintenance', value: summary.openMaintenance, color: 'text-orange-700 bg-orange-50' },
          { label: 'Pending Documents', value: summary.pendingDocs, color: 'text-purple-700 bg-purple-50' },
          { label: 'Open Tasks', value: summary.openTasks, color: 'text-indigo-700 bg-indigo-50' },
          { label: 'Total Invoices', value: summary.totalInvoices, color: 'text-teal-700 bg-teal-50' },
          { label: 'Unpaid Amount', value: `$${summary.unpaidAmount.toFixed(2)}`, color: 'text-red-700 bg-red-50' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-4 ${k.color}`}>
            <p className="text-xs font-medium opacity-70">{k.label}</p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm">Admissions — Last 6 Months</h3>
          <LineChart data={charts.admissionsByMonth} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm">Patients by Care Type</h3>
          <MiniBar data={charts.patientsByCareType} colorMap={BAR_COLORS} labelKey="careType" valueKey="count" />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm">Tasks by Status</h3>
          <MiniBar data={charts.tasksByStatus} colorMap={STATUS_COLORS} labelKey="status" valueKey="count" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm">Documents by Status</h3>
          <MiniBar data={charts.docsByStatus} colorMap={{ DRAFT: '#6b7280', PENDING: '#f59e0b', APPROVED: '#22c55e', REJECTED: '#ef4444', ARCHIVED: '#9ca3af' }} labelKey="status" valueKey="count" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm">Invoices by Status</h3>
          <MiniBar data={charts.invoicesByStatus} colorMap={STATUS_COLORS} labelKey="status" valueKey="count" />
          {charts.invoicesByStatus.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {charts.invoicesByStatus.map(i => i.total > 0 && (
                <div key={i.status} className="flex justify-between text-xs py-0.5">
                  <span className="text-gray-400">{i.status}</span>
                  <span className="font-medium text-gray-700">${i.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance priority */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Open Maintenance by Priority</h3>
        {charts.maintenanceByPriority.length === 0
          ? <p className="text-sm text-gray-400 py-4">No open maintenance requests.</p>
          : <MiniBar data={charts.maintenanceByPriority} colorMap={{ LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444', URGENT: '#7c3aed' }} labelKey="priority" valueKey="count" />
        }
      </div>
    </div>
  )
}
