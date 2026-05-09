'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const cC = { EXCELLENT: 'bg-green-100 text-green-700', GOOD: 'bg-blue-100 text-blue-700', FAIR: 'bg-yellow-100 text-yellow-700', POOR: 'bg-orange-100 text-orange-700', DECOMMISSIONED: 'bg-gray-100 text-gray-500' }
const CATS = ['COMPUTER', 'PRINTER', 'NETWORK', 'MEDICAL', 'FURNITURE', 'OTHER']
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DECOMMISSIONED']
const EMPTY = { name: '', category: 'COMPUTER', brand: '', model: '', serialNumber: '', location: '', assignedTo: '', condition: 'GOOD', purchaseDate: '', warrantyExpiry: '', notes: '' }

export default function InventoryPage() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (filterCat) p.set('category', filterCat)
      if (search) p.set('search', search)
      const r = await fetch('/api/inventory?' + p)
      if (r.ok) setAssets(await r.json())
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filterCat, search])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (a) => { setEditing(a); setForm({ name: a.name, category: a.category, brand: a.brand || '', model: a.model || '', serialNumber: a.serialNumber || '', location: a.location, assignedTo: a.assignedTo || '', condition: a.condition, purchaseDate: a.purchaseDate ? a.purchaseDate.split('T')[0] : '', warrantyExpiry: a.warrantyExpiry ? a.warrantyExpiry.split('T')[0] : '', notes: a.notes || '' }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const method = editing ? 'PATCH' : 'POST'
      const body = editing ? { id: editing.id, ...form } : form
      const r = await fetch('/api/inventory', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (r.ok) { toast.success(editing ? 'Asset updated' : 'Asset added'); setShowForm(false); setEditing(null); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const handleDecommission = async (id) => {
    if (!confirm('Decommission this asset?')) return
    const r = await fetch('/api/inventory', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, condition: 'DECOMMISSIONED' }) })
    if (r.ok) { toast.success('Asset decommissioned'); load() }
  }

  const catCounts = CATS.reduce((acc, c) => { acc[c] = assets.filter(a => a.category === c).length; return acc }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">IT Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track IT assets and equipment</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Asset
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')} className={'px-3 py-1.5 rounded-xl text-xs font-medium transition-all ' + (!filterCat ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>All ({assets.length})</button>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(filterCat === c ? '' : c)} className={'px-3 py-1.5 rounded-xl text-xs font-medium transition-all ' + (filterCat === c ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {c} {catCounts[c] > 0 && `(${catCounts[c]})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." className="input-field pl-8 text-sm" />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading assets...</div>
            : assets.length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No assets found.</p></div>
            : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Asset</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Assigned</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Condition</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {assets.map(a => (
                      <tr key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)} className={'cursor-pointer hover:bg-gray-50 transition-colors ' + (selected?.id === a.id ? 'bg-primary-50' : '')}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.assetTag} · {a.category}{a.brand ? ' · ' + a.brand : ''}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{a.location}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{a.assignedTo || <span className="text-gray-300">Unassigned</span>}</td>
                        <td className="px-4 py-3"><span className={'badge text-xs ' + (cC[a.condition] || 'bg-gray-100')}>{a.condition}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(a)} className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">Edit</button>
                            {a.condition !== 'DECOMMISSIONED' && <button onClick={() => handleDecommission(a.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Decomm.</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Detail panel */}
        <div>
          {selected && !showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800">{selected.name}</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Asset Tag', selected.assetTag], ['Category', selected.category], ['Brand', selected.brand], ['Model', selected.model],
                  ['Serial No.', selected.serialNumber], ['Location', selected.location], ['Assigned To', selected.assignedTo],
                  ['Condition', selected.condition],
                  ['Purchase Date', selected.purchaseDate ? new Date(selected.purchaseDate).toLocaleDateString('en-ZW') : null],
                  ['Warranty Expires', selected.warrantyExpiry ? new Date(selected.warrantyExpiry).toLocaleDateString('en-ZW') : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span className="text-gray-400 text-xs">{k}</span>
                    <span className="text-gray-700 text-xs font-medium">{v}</span>
                  </div>
                ))}
                {selected.notes && <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 mt-2">{selected.notes}</div>}
              </div>
              <button onClick={() => openEdit(selected)} className="btn-secondary text-xs w-full">Edit Asset</button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Asset' : 'Add Asset'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="text-xs text-gray-500 font-medium">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field text-sm mt-1">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Condition</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="input-field text-sm mt-1">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Brand</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input-field text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">Serial Number</label><input value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Location *</label><input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Admin Block, Room 3" className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Assigned To</label><input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Person or department" className="input-field text-sm mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Purchase Date</label><input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Warranty Expires</label><input type="date" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })} className="input-field text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : (editing ? 'Update Asset' : 'Add Asset')}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary text-sm px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
