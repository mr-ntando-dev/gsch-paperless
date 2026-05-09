'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function AuditLogPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Edit modal state
  const [editLog, setEditLog] = useState(null)
  const [editForm, setEditForm] = useState({ action: '', resource: '', resourceId: '', details: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterResource) params.set('resource', filterResource)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('limit', '200')
    try {
      const r = await fetch('/api/audit-log?' + params)
      if (r.ok) setLogs(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterResource, from, to])

  const filtered = logs.filter(l => {
    const text = `${l.user?.name} ${l.action} ${l.resource} ${l.resourceId}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  const actionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-900 text-green-300'
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-900 text-red-300'
    if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('PATCH')) return 'bg-blue-900 text-blue-300'
    if (action.includes('LOGIN')) return 'bg-teal-900 text-teal-300'
    return 'bg-gray-800 text-gray-400'
  }

  const openEdit = (log) => {
    setEditLog(log)
    setEditForm({
      action: log.action || '',
      resource: log.resource || '',
      resourceId: log.resourceId || '',
      details: log.details ? JSON.stringify(log.details, null, 2) : '',
    })
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let parsedDetails = undefined
      if (editForm.details.trim()) {
        try { parsedDetails = JSON.parse(editForm.details) }
        catch { toast.error('Details must be valid JSON or empty'); setSaving(false); return }
      } else {
        parsedDetails = null
      }
      const res = await fetch(`/api/audit-log/${editLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editForm.action,
          resource: editForm.resource,
          resourceId: editForm.resourceId || null,
          details: parsedDetails,
        })
      })
      if (res.ok) {
        toast.success('Log entry updated')
        setEditLog(null)
        load()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } finally { setSaving(false) }
  }

  const deleteLog = async (id) => {
    if (!confirm('Permanently delete this log entry? This cannot be undone.')) return
    const res = await fetch(`/api/audit-log/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Log entry deleted'); load() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const deleteAllFiltered = async () => {
    if (!confirm(`Permanently delete ALL ${filtered.length} visible log entries? This cannot be undone.`)) return
    let failed = 0
    for (const log of filtered) {
      const res = await fetch(`/api/audit-log/${log.id}`, { method: 'DELETE' })
      if (!res.ok) failed++
    }
    if (failed === 0) toast.success('All selected log entries deleted')
    else toast.error(`${failed} entries failed to delete`)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Log</h2>
          <p className="text-gray-400 text-sm">Full activity trail — who did what, and when</p>
        </div>
        {isSuperAdmin && filtered.length > 0 && (
          <button onClick={deleteAllFiltered}
            className="px-4 py-2 bg-red-900 hover:bg-red-700 text-red-200 rounded-lg text-xs font-medium transition-colors border border-red-800">
            🗑 Delete All Visible ({filtered.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, action, resource..." className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm w-64 focus:outline-none focus:border-red-500" />
        <input value={filterResource} onChange={e => setFilterResource(e.target.value)} placeholder="Filter by resource..." className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm w-44 focus:outline-none focus:border-red-500" />
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
        <button onClick={load} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm">Refresh</button>
      </div>

      <div className="text-gray-400 text-sm">{filtered.length} entries</div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading audit log...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Resource</th>
                  <th className="px-4 py-3 text-left">Details</th>
                  {isSuperAdmin && <th className="px-4 py-3 text-left">Manage</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-gray-500">No log entries found</td></tr>
                )}
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{log.user?.name}</div>
                      <div className="text-gray-500 text-xs">{log.user?.role}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.user?.department?.shortName || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-mono ${actionColor(log.action)}`}>{log.action}</span></td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-xs">{log.resource}</div>
                      {log.resourceId && <div className="text-gray-600 text-xs font-mono">{log.resourceId.slice(0, 12)}...</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : '—'}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button onClick={() => openEdit(log)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded bg-blue-900/30 hover:bg-blue-900/60 transition-colors">Edit</button>
                        <button onClick={() => deleteLog(log.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded bg-red-900/30 hover:bg-red-900/60 transition-colors">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Log Entry Modal */}
      {editLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-white font-semibold text-lg mb-4">Edit Log Entry</h3>
            <p className="text-gray-500 text-xs mb-4 font-mono">ID: {editLog.id}</p>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Action</label>
                <input required value={editForm.action} onChange={e => setEditForm({...editForm, action: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Resource</label>
                <input required value={editForm.resource} onChange={e => setEditForm({...editForm, resource: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Resource ID</label>
                <input value={editForm.resourceId} onChange={e => setEditForm({...editForm, resourceId: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Details (JSON or empty)</label>
                <textarea rows={4} value={editForm.details} onChange={e => setEditForm({...editForm, details: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditLog(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
