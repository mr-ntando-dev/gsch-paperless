'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const HIERARCHY = {
  MANAGEMENT: { tier: 1, label: 'Executive Leadership', color: 'from-slate-700 to-slate-900' },
  HOSPITAL_RELATIONS: { tier: 2, label: 'Hospital Relations', color: 'from-indigo-600 to-indigo-800' },
  CRD: { tier: 3, label: 'Clinical Operations', color: 'from-blue-600 to-blue-800' },
  PATIENT_CARE: { tier: 3, label: 'Clinical Operations', color: 'from-teal-600 to-teal-800' },
  BILLING: { tier: 4, label: 'Finance & Support', color: 'from-green-600 to-green-800' },
  ACCOUNTS: { tier: 4, label: 'Finance & Support', color: 'from-emerald-600 to-emerald-800' },
  IT: { tier: 4, label: 'Support Services', color: 'from-purple-600 to-purple-800' },
  KITCHEN: { tier: 5, label: 'Facilities & Operations', color: 'from-orange-500 to-orange-700' },
  SAFETY_MAINTENANCE: { tier: 5, label: 'Facilities & Operations', color: 'from-red-600 to-red-800' },
}

const TYPE_BADGE = {
  NOTE: 'bg-gray-100 text-gray-700 border border-gray-200',
  ANNOUNCEMENT: 'bg-blue-100 text-blue-700 border border-blue-200',
  PROCEDURE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  CHECKLIST: 'bg-amber-100 text-amber-700 border border-amber-200',
  POLICY: 'bg-purple-100 text-purple-700 border border-purple-200',
  ALERT: 'bg-red-100 text-red-700 border border-red-200',
}

export default function DepartmentPage() {
  const params = useParams()
  const deptCode = params.dept
  const { data: session } = useSession()

  const [dept, setDept] = useState(null)
  const [allDepts, setAllDepts] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', type: 'NOTE', isPinned: false })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('board')

  const h = HIERARCHY[deptCode]
  const canPost = session?.user?.role !== 'VIEWER'
  const isAdminOrManager = ['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(session?.user?.role)
  const isMyDept = isAdminOrManager || session?.user?.departmentId === dept?.id

  // Depts in same tier (peers) and parent tier
  const peers = allDepts.filter(d => d.code !== deptCode && HIERARCHY[d.code]?.tier === h?.tier && d.isActive)
  const parentTier = h?.tier ? h.tier - 1 : null
  const parents = allDepts.filter(d => HIERARCHY[d.code]?.tier === parentTier && d.isActive)

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/departments').then(r => r.json()),
    ]).then(([deptsRes]) => {
      const depts = deptsRes.status === 'fulfilled' ? deptsRes.value : []
      setAllDepts(Array.isArray(depts) ? depts : [])
      const found = Array.isArray(depts) ? depts.find(d => d.code === deptCode) : null
      if (found) {
        setDept(found)
        fetch(`/api/dept-items?deptId=${found.id}`)
          .then(r => r.json())
          .then(d => Array.isArray(d) ? setItems(d) : null)
          .catch(() => {})
      }
    }).finally(() => setLoading(false))
  }, [deptCode])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!dept) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/dept-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, departmentId: dept.id })
      })
      if (res.ok) {
        toast.success('Posted successfully')
        setShowAdd(false)
        setForm({ title: '', content: '', type: 'NOTE', isPinned: false })
        const updated = await fetch(`/api/dept-items?deptId=${dept.id}`)
        if (updated.ok) setItems(await updated.json())
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to post')
      }
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm">Loading department...</span>
      </div>
    </div>
  )
  if (!dept) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400">Department not found.</p>
      <Link href="/dashboard" className="text-sm text-primary-600 hover:underline">← Back to dashboard</Link>
    </div>
  )

  const pinnedItems = items.filter(i => i.isPinned)
  const regularItems = items.filter(i => !i.isPinned)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${h?.color || 'from-gray-700 to-gray-900'} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            {h && (
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                <span>Tier {h.tier}</span>
                <span>·</span>
                <span>{h.label}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold">{dept.name}</h1>
            <p className="text-white/70 text-sm mt-1">{dept.description || 'Department workspace'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold">{dept._count?.users ?? 0}</p>
              <p className="text-white/60 text-xs">Staff</p>
            </div>
            {canPost && isMyDept && (
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Post
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hierarchy context */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Organizational Context</p>
        <div className="flex items-center gap-3 flex-wrap">
          {parents.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Reports to</span>
                {parents.map(p => (
                  <Link key={p.id} href={`/dashboard/department/${p.code}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors border border-slate-200">
                    <div className="w-4 h-4 rounded bg-slate-600 flex items-center justify-center text-[7px] font-bold text-white">
                      {p.shortName.substring(0, 2).toUpperCase()}
                    </div>
                    {p.name}
                  </Link>
                ))}
              </div>
              <svg className="w-4 h-4 text-gray-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${h?.color || 'from-gray-500 to-gray-700'} flex items-center justify-center text-[9px] font-bold text-white`}>
              {dept.shortName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-gray-800">{dept.name}</span>
            <span className="text-[10px] text-white bg-primary-500 px-1.5 py-0.5 rounded font-semibold">YOU</span>
          </div>
          {peers.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Peer depts</span>
              {peers.slice(0, 3).map(p => (
                <Link key={p.id} href={`/dashboard/department/${p.code}`}
                  className="text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-lg transition-colors">
                  {p.shortName}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'board', label: 'Dept Board' },
          { id: 'send-doc', label: 'Route Document' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Pinned items */}
          {pinnedItems.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                </svg>
                Pinned
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinnedItems.map(item => (
                  <DeptItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {regularItems.length === 0 && pinnedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-16 gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No items posted yet</p>
              {canPost && isMyDept && (
                <button onClick={() => setShowAdd(true)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">Post the first item →</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {regularItems.map(item => <DeptItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'send-doc' && (
        <RouteDocPanel deptId={dept.id} allDepts={allDepts.filter(d => d.id !== dept.id && d.isActive)} />
      )}

      {/* Add item modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Post to {dept.name}</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePost} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                    {Object.keys(TYPE_BADGE).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.checked})}
                      className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-sm text-gray-700">Pin to top</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="input-field" placeholder="Notice title" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Content</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="input-field resize-none" rows={4} placeholder="Post content..." required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60">
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DeptItemCard({ item }) {
  const TYPE_BADGE = {
    NOTE: 'bg-gray-100 text-gray-700 border border-gray-200',
    ANNOUNCEMENT: 'bg-blue-100 text-blue-700 border border-blue-200',
    PROCEDURE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    CHECKLIST: 'bg-amber-100 text-amber-700 border border-amber-200',
    POLICY: 'bg-purple-100 text-purple-700 border border-purple-200',
    ALERT: 'bg-red-100 text-red-700 border border-red-200',
  }
  return (
    <div className={`bg-white rounded-2xl border p-4 ${item.isPinned ? 'border-primary-200 bg-primary-50/20' : 'border-gray-100'} hover:shadow-sm transition-all`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg ${TYPE_BADGE[item.type] || TYPE_BADGE.NOTE}`}>
          {item.type}
        </span>
        {item.isPinned && (
          <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
          </svg>
        )}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm leading-snug">{item.title}</h4>
      <p className="text-xs text-gray-500 mt-1.5 line-clamp-3">{item.content}</p>
      <p className="text-[10px] text-gray-300 mt-2">{item.author?.name} · {new Date(item.createdAt).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}</p>
    </div>
  )
}

function RouteDocPanel({ deptId, allDepts }) {
  const [docs, setDocs] = useState([])
  const [form, setForm] = useState({ documentId: '', toDeptId: '', note: '', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/documents').then(r => r.json()).then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/routes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Document routed successfully')
        setForm({ documentId: '', toDeptId: '', note: '', priority: 'MEDIUM' })
      } else {
        const err = await res.json()
        toast.error(err.error || 'Routing failed')
      }
    } finally { setSubmitting(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
      <h3 className="font-bold text-gray-900 mb-1">Route a Document</h3>
      <p className="text-xs text-gray-500 mb-5">Send a document to another department for action or review</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Document</label>
          <select value={form.documentId} onChange={e => setForm({...form, documentId: e.target.value})} className="input-field" required>
            <option value="">Select document...</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Send To</label>
          <select value={form.toDeptId} onChange={e => setForm({...form, toDeptId: e.target.value})} className="input-field" required>
            <option value="">Select department...</option>
            {allDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
            className="input-field resize-none" rows={3} placeholder="What action is required..." />
        </div>
        <button type="submit" disabled={submitting || !form.documentId || !form.toDeptId}
          className="w-full btn-primary disabled:opacity-60">
          {submitting ? 'Routing...' : 'Route Document'}
        </button>
      </form>
    </div>
  )
}
