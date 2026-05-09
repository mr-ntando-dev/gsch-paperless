'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  DRAFT: 'bg-gray-100 text-gray-600 border border-gray-200',
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border border-slate-200',
}
const PRIORITY_BADGE = {
  LOW: 'bg-sky-50 text-sky-600 border border-sky-200',
  MEDIUM: 'bg-gray-50 text-gray-600 border border-gray-200',
  HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
  URGENT: 'bg-red-100 text-red-700 border border-red-200',
}
const ROUTE_STATUS = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  ACKNOWLEDGED: 'bg-blue-50 text-blue-700 border border-blue-200',
  ACTIONED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  RETURNED: 'bg-gray-100 text-gray-600 border border-gray-200',
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState('ALL')
  const [tab, setTab] = useState('documents') // documents | routes
  const [documents, setDocuments] = useState([])
  const [routes, setRoutes] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showRoute, setShowRoute] = useState(null) // doc to route
  const [versionDoc, setVersionDoc] = useState(null) // doc showing version history
  const [newDoc, setNewDoc] = useState({ title: '', content: '', type: 'General', priority: 'MEDIUM' })
  const [routeForm, setRouteForm] = useState({ toDeptId: '', note: '', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [docsRes, routesRes, deptsRes] = await Promise.allSettled([
        fetch(`/api/documents${filter !== 'ALL' ? `?status=${filter}` : ''}`),
        fetch('/api/routes'),
        fetch('/api/departments'),
      ])
      if (docsRes.status === 'fulfilled' && docsRes.value.ok) setDocuments(await docsRes.value.json())
      if (routesRes.status === 'fulfilled' && routesRes.value.ok) setRoutes(await routesRes.value.json())
      if (deptsRes.status === 'fulfilled' && deptsRes.value.ok) {
        const d = await deptsRes.value.json()
        setDepartments(Array.isArray(d) ? d.filter(x => x.isActive && x.id !== session?.user?.departmentId) : [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [filter])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDoc),
      })
      if (res.ok) {
        toast.success('Document created')
        setShowCreate(false)
        setNewDoc({ title: '', content: '', type: 'General', priority: 'MEDIUM' })
        fetchAll()
      } else toast.error('Failed to create document')
    } catch { toast.error('Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleRoute = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/routes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: showRoute.id, ...routeForm }),
      })
      if (res.ok) {
        toast.success(`Document routed to ${departments.find(d => d.id === routeForm.toDeptId)?.name}`)
        setShowRoute(null)
        setRouteForm({ toDeptId: '', note: '', priority: 'MEDIUM' })
        fetchAll()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Routing failed')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleAcknowledge = async (routeId) => {
    try {
      const res = await fetch(`/api/routes/${routeId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
      })
      if (res.ok) { toast.success('Acknowledged'); fetchAll() }
    } catch { toast.error('Failed') }
  }

  const incomingCount = routes.filter(r => r.toDept?.id === session?.user?.departmentId && r.status === 'PENDING').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage documents and inter-department routing</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Document
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('documents')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'documents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Documents
        </button>
        <button onClick={() => setTab('routes')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'routes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Inter-Dept Routing
          {incomingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{incomingCount}</span>
          )}
        </button>
      </div>

      {tab === 'documents' && (
        <>
          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-40" />)}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-16 gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{doc.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.type}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold flex-shrink-0 ${STATUS_BADGE[doc.status]}`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{doc.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold ${PRIORITY_BADGE[doc.priority]}`}>
                        {doc.priority}
                      </span>
                      {doc.department && (
                        <span className="text-[10px] text-gray-400">{doc.department.shortName}</span>
                      )}
                    </div>
                    {session?.user?.departmentId && (
                      <button onClick={() => { setShowRoute(doc); setRouteForm({ toDeptId: '', note: '', priority: doc.priority }) }}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-800 font-medium transition-all px-2 py-1 rounded-lg hover:bg-primary-50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        Route
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-300">{new Date(doc.createdAt).toLocaleDateString('en-ZW', { day:'numeric', month:'short', year:'numeric' })}</p>
                    {doc.version > 1 && (
                      <button onClick={() => setVersionDoc(versionDoc?.id === doc.id ? null : doc)} className="text-[10px] text-primary-500 hover:text-primary-700 font-medium">
                        v{doc.version} · History
                      </button>
                    )}
                  </div>
                  {versionDoc?.id === doc.id && Array.isArray(doc.versionHistory) && doc.versionHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Version History</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {[...doc.versionHistory].reverse().map((v, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="bg-primary-100 text-primary-700 rounded px-1 py-0.5 font-bold flex-shrink-0">v{v.version}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 font-medium truncate">{v.title}</p>
                              {v.note && <p className="text-gray-400">{v.note}</p>}
                              <p className="text-gray-300">{v.editedBy} · {new Date(v.editedAt).toLocaleDateString('en-ZW')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'routes' && (
        <div className="space-y-4">
          {routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-16 gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No document routes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map(route => {
                const isIncoming = route.toDept?.id === session?.user?.departmentId
                return (
                  <div key={route.id} className={`bg-white rounded-2xl border p-4 ${isIncoming && route.status === 'PENDING' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${isIncoming ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <svg className={`w-4.5 h-4.5 ${isIncoming ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'18px',height:'18px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={isIncoming ? 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3' : 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{route.document?.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-medium">{route.fromDept?.shortName}</span>
                              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                              <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg font-medium border border-primary-100">{route.toDept?.shortName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${PRIORITY_BADGE[route.priority]}`}>{route.priority}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${ROUTE_STATUS[route.status]}`}>{route.status}</span>
                          </div>
                        </div>
                        {route.note && <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">"{route.note}"</p>}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400">Sent by {route.sentBy?.name} · {new Date(route.createdAt).toLocaleDateString('en-ZW', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                          {isIncoming && route.status === 'PENDING' && (
                            <button onClick={() => handleAcknowledge(route.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">New Document</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                <input value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                  className="input-field" placeholder="Document title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                  <select value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})} className="input-field">
                    {['General', 'Policy', 'Procedure', 'Report', 'Form', 'Notice', 'Clinical', 'Financial'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                  <select value={newDoc.priority} onChange={e => setNewDoc({...newDoc, priority: e.target.value})} className="input-field">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Content</label>
                <textarea value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                  className="input-field resize-none" rows={5} placeholder="Document content..." required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60">
                  {submitting ? 'Creating...' : 'Create Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route modal */}
      {showRoute && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Route Document</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{showRoute.title}</p>
              </div>
              <button onClick={() => setShowRoute(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleRoute} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Send To Department</label>
                <select value={routeForm.toDeptId} onChange={e => setRouteForm({...routeForm, toDeptId: e.target.value})}
                  className="input-field" required>
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                <select value={routeForm.priority} onChange={e => setRouteForm({...routeForm, priority: e.target.value})} className="input-field">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Routing Note <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea value={routeForm.note} onChange={e => setRouteForm({...routeForm, note: e.target.value})}
                  className="input-field resize-none" rows={3} placeholder="Reason for routing, action required..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRoute(null)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting || !routeForm.toDeptId} className="flex-1 btn-primary disabled:opacity-60">
                  {submitting ? 'Routing...' : 'Send to Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
