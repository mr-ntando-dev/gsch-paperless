'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const RESOURCES = [
  { key: 'tasks',     label: 'Tasks',     api: '/api/tasks',     fields: ['title', 'description', 'status', 'priority'] },
  { key: 'documents', label: 'Documents', api: '/api/documents', fields: ['title', 'content', 'status', 'type'] },
  { key: 'messages',  label: 'Messages',  api: '/api/messages',  fields: ['subject', 'body'] },
  { key: 'forms',     label: 'Forms',     api: '/api/forms',     fields: ['title', 'status'] },
]

export default function DataManagerPage() {
  const [resource, setResource] = useState(RESOURCES[0])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [editRaw, setEditRaw] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setLoaded(false)
    try {
      const r = await fetch(resource.api)
      if (r.ok) { setRecords(await r.json()); setLoaded(true) }
      else toast.error('Failed to load')
    } finally { setLoading(false) }
  }

  const openEdit = (rec) => {
    setEditRecord(rec)
    // Strip relational fields that cannot be updated directly
    const { id, createdAt, updatedAt, author, department, creator, assignee, user, ...rest } = rec
    setEditRaw(JSON.stringify(rest, null, 2))
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let body
      try { body = JSON.parse(editRaw) }
      catch { toast.error('Invalid JSON'); setSaving(false); return }

      const res = await fetch(`${resource.api}/${editRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success('Record updated')
        setEditRecord(null)
        load()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } finally { setSaving(false) }
  }

  const deleteRecord = async (rec) => {
    const label = rec.title || rec.subject || rec.name || rec.id
    if (!confirm(`Permanently delete "${label}"? This cannot be undone.`)) return
    const res = await fetch(`${resource.api}/${rec.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Record deleted'); load() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const getLabel = (rec) => rec.title || rec.subject || rec.name || rec.action || rec.id?.slice(0, 12) + '...'
  const getSub = (rec) => {
    if (rec.status) return rec.status
    if (rec.type) return rec.type
    if (rec.role) return rec.role
    return ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Data Manager</h2>
        <p className="text-gray-400 text-sm">SUPERADMIN only — edit or permanently delete any record in the system.</p>
      </div>

      {/* Resource picker */}
      <div className="flex flex-wrap gap-2">
        {RESOURCES.map(r => (
          <button key={r.key} onClick={() => { setResource(r); setRecords([]); setLoaded(false) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              resource.key === r.key ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}>
            {r.label}
          </button>
        ))}
        <button onClick={load} disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {loading ? 'Loading...' : `Load ${resource.label}`}
        </button>
      </div>

      {loaded && (
        <div className="text-gray-400 text-sm">{records.length} {resource.label.toLowerCase()} found</div>
      )}

      {loaded && records.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
          No {resource.label.toLowerCase()} found.
        </div>
      )}

      {loaded && records.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-left">Status / Type</th>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-medium">{getLabel(rec)}</td>
                    <td className="px-4 py-3">
                      {getSub(rec) && <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">{getSub(rec)}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{rec.id?.slice(0, 14)}...</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(rec)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded bg-blue-900/30 hover:bg-blue-900/60">Edit</button>
                        <button onClick={() => deleteRecord(rec)} className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded bg-red-900/30 hover:bg-red-900/60">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-semibold text-lg mb-1">Edit {resource.label} Record</h3>
            <p className="text-gray-500 text-xs font-mono mb-4">ID: {editRecord.id}</p>
            <p className="text-yellow-400 text-xs mb-4 bg-yellow-900/20 border border-yellow-800 rounded-lg px-3 py-2">
              ⚠ Edit the JSON below. Relational fields (author, department, etc.) are stripped — update scalar fields only. Must be valid JSON.
            </p>
            <form onSubmit={saveEdit} className="space-y-4">
              <textarea
                rows={18}
                value={editRaw}
                onChange={e => setEditRaw(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-green-300 text-xs focus:outline-none focus:border-red-500 font-mono resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditRecord(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700">
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
