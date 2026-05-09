'use client'
import { useState, useEffect } from 'react'

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Log</h2>
        <p className="text-gray-400 text-sm">Full activity trail — who did what, and when</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No log entries found</td></tr>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
