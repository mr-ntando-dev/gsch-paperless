'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const EMPTY_ITEM = { name: '', genericName: '', category: 'MEDICATION', unit: 'tablet', stockLevel: 0, reorderLevel: 10, expiryDate: '', batchNumber: '', supplier: '', unitCost: '' }
const EMPTY_RX = { patientId: '', pharmacyItemId: '', dosage: '', frequency: '', duration: '', route: 'ORAL', quantity: 1, notes: '', allergyChecked: false }

export default function PharmacyPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState([])
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('stock') // stock | prescriptions
  const [showItemForm, setShowItemForm] = useState(false)
  const [showRxForm, setShowRxForm] = useState(false)
  const [itemForm, setItemForm] = useState(EMPTY_ITEM)
  const [rxForm, setRxForm] = useState(EMPTY_RX)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [stockAdjust, setStockAdjust] = useState({})

  const role = session?.user?.role
  const canManageStock = ['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(role)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [ir, pr, rxr] = await Promise.all([fetch('/api/pharmacy'), fetch('/api/patients'), fetch('/api/prescriptions' + (filterStatus ? '?status=' + filterStatus : ''))])
      if (ir.ok) setItems(await ir.json())
      if (pr.ok) { const d = await pr.json(); setPatients(Array.isArray(d) ? d.filter(p => p.isActive) : []) }
      if (rxr.ok) setPrescriptions(await rxr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [filterStatus])

  const saveItem = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editItem ? '/api/pharmacy' : '/api/pharmacy'
      const method = editItem ? 'PATCH' : 'POST'
      const body = editItem ? { id: editItem.id, ...itemForm } : itemForm
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (r.ok) { toast.success(editItem ? 'Item updated' : 'Item added'); setShowItemForm(false); setItemForm(EMPTY_ITEM); setEditItem(null); loadAll() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const adjustStock = async (id, delta) => {
    const r = await fetch('/api/pharmacy', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, stockAdjust: delta }) })
    if (r.ok) { toast.success(`Stock ${delta > 0 ? 'increased' : 'decreased'}`); loadAll() } else toast.error('Failed')
  }

  const savePrescription = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Check allergies
      const patient = patients.find(p => p.id === rxForm.patientId)
      const item = items.find(i => i.id === rxForm.pharmacyItemId)
      if (patient?.allergies && item?.name) {
        const allergyLower = patient.allergies.toLowerCase()
        const drugLower = item.name.toLowerCase()
        if (allergyLower.includes(drugLower)) {
          toast.error(`⚠️ ALLERGY ALERT: Patient has recorded allergy to ${item.name}!`, { duration: 8000 })
          setSaving(false)
          return
        }
      }
      const r = await fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rxForm) })
      if (r.ok) { toast.success('Prescription created'); setShowRxForm(false); setRxForm(EMPTY_RX); loadAll() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const dispense = async (id) => {
    if (!confirm('Dispense this prescription? This will deduct from stock.')) return
    setSaving(true)
    try {
      const r = await fetch('/api/prescriptions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'DISPENSE' }) })
      if (r.ok) { toast.success('Dispensed successfully'); loadAll() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const cancelRx = async (id) => {
    if (!confirm('Cancel this prescription?')) return
    const r = await fetch('/api/prescriptions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'CANCEL' }) })
    if (r.ok) { toast.success('Cancelled'); loadAll() } else toast.error('Failed')
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.genericName?.toLowerCase().includes(search.toLowerCase()))
  const lowStockItems = items.filter(i => i.isLowStock)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pharmacy</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drug stock management and prescription dispensing</p>
        </div>
        <div className="flex gap-2">
          {tab === 'stock' && canManageStock && (
            <button onClick={() => { setEditItem(null); setItemForm(EMPTY_ITEM); setShowItemForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Item
            </button>
          )}
          {tab === 'prescriptions' && (
            <button onClick={() => setShowRxForm(true)} className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              New Prescription
            </button>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800">⚠️ {lowStockItems.length} item(s) at or below reorder level</p>
          <p className="text-xs text-amber-600 mt-1">{lowStockItems.map(i => `${i.name} (${i.stockLevel} ${i.unit}s)`).join(' · ')}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {[['stock', 'Drug Stock'], ['prescriptions', 'Prescriptions']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>{label}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : tab === 'stock' ? (
        <>
          <div className="flex gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drug..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-56" />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Reorder Level</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  {canManageStock && <th className="px-4 py-3 text-left">Adjust</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No items found</td></tr>}
                {filteredItems.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.isLowStock ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      {item.genericName && <div className="text-xs text-gray-400">{item.genericName}</div>}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${item.isLowStock ? 'text-amber-600' : 'text-gray-800'}`}>{item.stockLevel}</span>
                      <span className="text-gray-400 text-xs ml-1">{item.unit}s</span>
                      {item.isLowStock && <span className="ml-2 text-xs text-amber-600">⚠️ Low</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.reorderLevel}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.expiryDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.supplier || '—'}</td>
                    {canManageStock && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustStock(item.id, -1)} className="w-6 h-6 rounded bg-red-100 text-red-600 text-sm font-bold hover:bg-red-200">−</button>
                          <button onClick={() => adjustStock(item.id, 10)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">+10</button>
                          <button onClick={() => { setEditItem(item); setItemForm({ name: item.name, genericName: item.genericName || '', category: item.category, unit: item.unit, stockLevel: item.stockLevel, reorderLevel: item.reorderLevel, expiryDate: item.expiryDate || '', batchNumber: item.batchNumber || '', supplier: item.supplier || '', unitCost: item.unitCost || '' }); setShowItemForm(true) }} className="text-xs text-blue-500 hover:underline ml-1">Edit</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="DISPENSED">Dispensed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Drug</th>
                  <th className="px-4 py-3 text-left">Dosage</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Prescribed By</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescriptions.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No prescriptions</td></tr>}
                {prescriptions.map(rx => (
                  <tr key={rx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{rx.patient?.firstName} {rx.patient?.lastName}</div>
                      <div className="text-xs text-gray-400">{rx.patient?.patientId}</div>
                      {rx.patient?.allergies && <div className="text-xs text-red-500">⚠️ Allergies: {rx.patient.allergies}</div>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{rx.pharmacyItem?.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <div>{rx.dosage} · {rx.frequency}</div>
                      <div>{rx.duration} · {rx.route}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">{rx.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${rx.status === 'DISPENSED' ? 'bg-green-100 text-green-700' : rx.status === 'CANCELLED' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-700'}`}>{rx.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{rx.prescribedBy?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {rx.status === 'PENDING' && (
                          <>
                            <button onClick={() => dispense(rx.id)} className="text-xs text-green-600 font-medium hover:underline">Dispense</button>
                            <button onClick={() => cancelRx(rx.id)} className="text-xs text-red-400 hover:underline">Cancel</button>
                          </>
                        )}
                        {rx.status === 'DISPENSED' && rx.dispensedBy && <span className="text-xs text-gray-400">by {rx.dispensedBy.name}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Stock Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editItem ? 'Edit Item' : 'Add Pharmacy Item'}</h3>
            <form onSubmit={saveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Drug Name *</label>
                  <input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Amoxicillin" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Generic Name</label>
                  <input value={itemForm.genericName} onChange={e => setItemForm(f => ({ ...f, genericName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Generic / INN name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="MEDICATION">Medication</option>
                    <option value="SUPPLY">Supply</option>
                    <option value="CONSUMABLE">Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="tablet, vial, bottle..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock Level</label>
                  <input type="number" value={itemForm.stockLevel} onChange={e => setItemForm(f => ({ ...f, stockLevel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reorder Level</label>
                  <input type="number" value={itemForm.reorderLevel} onChange={e => setItemForm(f => ({ ...f, reorderLevel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
                  <input type="date" value={itemForm.expiryDate} onChange={e => setItemForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Batch Number</label>
                  <input value={itemForm.batchNumber} onChange={e => setItemForm(f => ({ ...f, batchNumber: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                  <input value={itemForm.supplier} onChange={e => setItemForm(f => ({ ...f, supplier: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit Cost (USD)</label>
                  <input type="number" step="0.01" value={itemForm.unitCost} onChange={e => setItemForm(f => ({ ...f, unitCost: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowItemForm(false); setEditItem(null); setItemForm(EMPTY_ITEM) }} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Prescription Modal */}
      {showRxForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">New Prescription</h3>
            <form onSubmit={savePrescription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select value={rxForm.patientId} onChange={e => setRxForm(f => ({ ...f, patientId: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId}){p.allergies ? ` ⚠️ ${p.allergies}` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drug *</label>
                <select value={rxForm.pharmacyItemId} onChange={e => setRxForm(f => ({ ...f, pharmacyItemId: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Select drug</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stockLevel} {i.unit}s)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dosage *</label>
                  <input value={rxForm.dosage} onChange={e => setRxForm(f => ({ ...f, dosage: e.target.value }))} required placeholder="e.g. 250mg" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                  <input value={rxForm.frequency} onChange={e => setRxForm(f => ({ ...f, frequency: e.target.value }))} placeholder="e.g. 8 hourly" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                  <input value={rxForm.duration} onChange={e => setRxForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 5 days" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Route</label>
                  <select value={rxForm.route} onChange={e => setRxForm(f => ({ ...f, route: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="ORAL">Oral</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="TOPICAL">Topical</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                  <input type="number" min="1" value={rxForm.quantity} onChange={e => setRxForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={rxForm.notes} onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Additional instructions..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={rxForm.allergyChecked} onChange={e => setRxForm(f => ({ ...f, allergyChecked: e.target.checked }))} className="rounded" />
                Allergy check confirmed
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRxForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">{saving ? 'Prescribing...' : 'Create Prescription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
