'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const HIERARCHY_MAP = [
  {
    tier: 1, label: 'Executive Leadership', color: 'bg-slate-700', border: 'border-slate-300',
    ring: 'ring-slate-200', text: 'text-slate-700', light: 'bg-slate-50',
    codes: ['MANAGEMENT'],
    description: 'Strategic decisions, policy approval, resource allocation, final escalations'
  },
  {
    tier: 2, label: 'Hospital Relations', color: 'bg-indigo-600', border: 'border-indigo-200',
    ring: 'ring-indigo-100', text: 'text-indigo-700', light: 'bg-indigo-50',
    codes: ['HOSPITAL_RELATIONS'],
    description: 'External partnerships, referral networks, inter-facility communications'
  },
  {
    tier: 3, label: 'Clinical Operations', color: 'bg-blue-600', border: 'border-blue-200',
    ring: 'ring-blue-100', text: 'text-blue-700', light: 'bg-blue-50',
    codes: ['CRD', 'PATIENT_CARE'],
    description: 'Patient-facing services, clinical documentation, care delivery'
  },
  {
    tier: 4, label: 'Finance & Support Services', color: 'bg-green-600', border: 'border-green-200',
    ring: 'ring-green-100', text: 'text-green-700', light: 'bg-green-50',
    codes: ['BILLING', 'ACCOUNTS', 'IT'],
    description: 'Financial operations, IT infrastructure, administrative support'
  },
  {
    tier: 5, label: 'Facilities & Operations', color: 'bg-orange-500', border: 'border-orange-200',
    ring: 'ring-orange-100', text: 'text-orange-700', light: 'bg-orange-50',
    codes: ['KITCHEN', 'SAFETY_MAINTENANCE'],
    description: 'Physical environment, catering, safety compliance, facility maintenance'
  },
]

const ESCALATION_PATHS = [
  { from: 'KITCHEN', to: 'SAFETY_MAINTENANCE', reason: 'Food safety violations → Safety review' },
  { from: 'SAFETY_MAINTENANCE', to: 'IT', reason: 'System/equipment issues → IT assessment' },
  { from: 'BILLING', to: 'ACCOUNTS', reason: 'Unresolved billing → Accounts escalation' },
  { from: 'IT', to: 'MANAGEMENT', reason: 'Critical system failure → Executive action' },
  { from: 'CRD', to: 'MANAGEMENT', reason: 'Patient complaint unresolved → Management' },
  { from: 'PATIENT_CARE', to: 'MANAGEMENT', reason: 'Clinical incident → Executive review' },
  { from: 'ACCOUNTS', to: 'MANAGEMENT', reason: 'Budget overrun → Executive approval' },
  { from: 'HOSPITAL_RELATIONS', to: 'MANAGEMENT', reason: 'Partnership decisions → Board approval' },
]

export default function HierarchyPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => { setDepartments(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const getDeptByCode = (code) => departments.find(d => d.code === code)

  const getDepartmentsForTier = (tier) => {
    return tier.codes.map(code => getDeptByCode(code)).filter(Boolean)
  }

  const getEscalationForDept = (code) => ESCALATION_PATHS.filter(e => e.from === code || e.to === code)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm">Loading hierarchy...</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Hierarchy</h1>
          <p className="text-sm text-gray-500 mt-1">Organizational structure, reporting lines, and escalation paths</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
          <span>Tier 1 = Highest Authority</span>
        </div>
      </div>

      {/* Hierarchy pyramid */}
      <div className="space-y-2">
        {HIERARCHY_MAP.map((tier, tierIdx) => {
          const depts = getDepartmentsForTier(tier)
          return (
            <div key={tier.tier} className="relative">
              {/* Connector line */}
              {tierIdx > 0 && (
                <div className="flex justify-center -mb-1">
                  <div className="w-px h-4 bg-gray-200" />
                </div>
              )}
              <div className={`rounded-2xl border-2 ${tier.border} ${tier.light} p-4 transition-all`}
                style={{ marginLeft: `${tierIdx * 24}px`, marginRight: `${tierIdx * 24}px` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-7 h-7 rounded-full ${tier.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{tier.tier}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${tier.text}`}>{tier.label}</h3>
                    <p className="text-xs text-gray-500 truncate">{tier.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {depts.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setSelected(selected?.id === dept.id ? null : dept)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
                        selected?.id === dept.id
                          ? `${tier.color} text-white border-transparent shadow-md`
                          : `bg-white ${tier.border} ${tier.text} hover:shadow-sm`
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] ${
                        selected?.id === dept.id ? 'bg-white/20' : tier.light
                      }`}>
                        {dept.shortName.substring(0, 2).toUpperCase()}
                      </div>
                      {dept.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        selected?.id === dept.id ? 'bg-white/20 text-white' : `${tier.light} ${tier.text}`
                      }`}>
                        {dept._count?.users ?? 0} staff
                      </span>
                    </button>
                  ))}
                  {depts.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No active departments in this tier</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected dept detail */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selected.description || 'No description provided.'}</p>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{selected._count?.users ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Staff Members</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{selected._count?.documents ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Documents</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{selected._count?.tasks ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Active Tasks</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Escalation Paths</h4>
            <div className="space-y-2">
              {getEscalationForDept(selected.code).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No defined escalation paths for this department.</p>
              ) : (
                getEscalationForDept(selected.code).map((e, i) => (
                  <div key={i} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={e.from === selected.code ? 'M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18' : 'M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3'} />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{e.from} → {e.to}</p>
                      <p className="text-[11px] text-gray-500">{e.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Escalation quick reference */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">Escalation Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ESCALATION_PATHS.map((e, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-700 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">{e.from}</span>
                <svg className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 rounded-lg px-2 py-1 border border-primary-200 shadow-sm">{e.to}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">{e.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
