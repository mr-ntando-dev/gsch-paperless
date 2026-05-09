'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-50 border-green-200 text-green-700',
  OCCUPIED: 'bg-blue-50 border-blue-200 text-blue-700',
  MAINTENANCE: 'bg-amber-50 border-amber-200 text-amber-700',
  RESERVED: 'bg-purple-50 border-purple-200 text-purple-700'
}
const STATUS_DOT = {
  AVAILABLE: 'bg-green-400',
  OCCUPIED: 'bg-blue-400',
  MAINTENANCE: 'bg-amber-400',
  RESERVED: 'bg-purple-400'
}
const EMPTY_FORM = { bedNumber: '', wardName: '', status: 'AVAILABLE', notes: '' }

export default function BedsPage() {
  const { data: session } = useSession()
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterWard, setFilterWard] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const isAdmin = ['SUPERADMIN', 'ADMIN'].includes(session?.user?.role)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterWard) params.set('ward', filterWard)
    if (filterStatus) params.set('status', filterStatus)
    try {
      const r = await fetch('/api/beds?' + params)
      if (r.ok) setBeds(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterWard, filterStatus])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/beds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Bed added'); setShowForm(false); setForm(EMPTY_FORM); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    const r = await fetch('/api/beds', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success('Bed updated'); load() } else toast.error('Failed')
  }

  const deleteBed = async (id) => {
    if (!confirm('Remove this bed?')) return
    const r = await fetch('/api/beds?id=' + id, { method: 'DELETE' })
    if (r.ok) { toast.success('Removed'); load() } else toast.error('Failed')
  }

  // Group by ward
  const wards = [...new Set(beds.map(b => b.wardName))].sort()
  const allWards = wards

  const stats = {
    AVAILABLE: beds.filter(b => b.status === 'AVAILABLE').length,
    OCCUPIED: beds.filter(b => b.status === 'OCCUPIED').length,
    MAINTENANCE: beds.filter(b => b.status === 'MAINTENANCE').length,
    RESERVED: beds.filter(b => b.status === 'RESERVED').length,
  }

  const occupancyRate = beds.length > 0 ? Math.round((stats.OCCUPIED / beds.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bed Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hospital ward bed availability and occupancy</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Bed
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:col-span-1">
          <div className="text-3xl font-bold text-gray-800">{beds.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Beds</div>
        </div>
        {Object.entries(stats).map(([s, count]) => (
          <div key={s} className={`rounded-xl border p-4 ${STATUS_COLORS[s]}`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs mt-1 font-medium">{s}</div>
          </div>
        ))}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-gray-800">{occupancyRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Occupancy</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full transition-all ${occupancyRate > 80 ? 'bg-red-400' : occupancyRate > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">All Wards</option>
          {allWards.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RESERVED">Reserved</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading beds...</div> : (
        <div className="space-y-6">
          {wards.filter(w => !filterWard || w === filterWard).map(ward => {
            const wardBeds = beds.filter(b => b.wardName === ward && (!filterStatus || b.status === filterStatus))
            if (wardBeds.length === 0) return null
            return (
              <div key={ward} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">{ward}</h3>
                  <span className="text-xs text-gray-500">{wardBeds.filter(b => b.status === 'OCCUPIED').length}/{wardBeds.length} occupied</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {wardBeds.map(bed => (
                    <div key={bed.id} className={`rounded-xl border-2 p-3 text-center transition-all ${STATUS_COLORS[bed.status]}`}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className={`w-2 h-2 rounded-full ${STATUS_DOT[bed.status]}`} />
                        <span className="font-bold text-sm">{bed.bedNumber}</span>
                      </div>
                      {bed.patient && (
                        <div className="text-xs mt-1 opacity-80 leading-tight">
                          {bed.patient.firstName} {bed.patient.lastName.charAt(0)}.
                        </div>
                      )}
                      <div className="text-xs opacity-60 mt-1">{bed.status}</div>
                      {isAdmin && (
                        <select
                          value={bed.status}
                          onChange={e => updateStatus(bed.id, e.target.value)}
                          className="mt-2 w-full text-xs border-0 bg-transparent focus:outline-none cursor-pointer opacity-70"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="OCCUPIED">Occupied</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="RESERVED">Reserved</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {beds.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
              <p className="text-sm">No beds configured yet. Add beds to start tracking occupancy.</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className={`text-xs px-3 py-1 rounded-full border font-medium ${c}`}>{s}</span>
        ))}
      </div>

      {/* Add Bed Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Bed</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number *</label>
                <input value={form.bedNumber} onChange={e => setForm(f => ({ ...f, bedNumber: e.target.value }))} required placeholder="e.g. A-01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
                <input value={form.wardName} onChange={e => setForm(f => ({ ...f, wardName: e.target.value }))} required placeholder="e.g. Paediatric Ward A" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Optional notes" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">{saving ? 'Adding...' : 'Add Bed'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
