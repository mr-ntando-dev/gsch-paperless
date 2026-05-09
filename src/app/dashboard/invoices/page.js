'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const sC = { UNPAID: 'bg-red-100 text-red-700', PARTIAL: 'bg-yellow-100 text-yellow-700', PAID: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500' }
const CATS = ['WARD', 'DOCTOR', 'MEDICATION', 'MEAL', 'PROCEDURE', 'GENERAL']
const EMPTY_ITEM = { description: '', quantity: 1, unitPrice: '', category: 'GENERAL' }

function InvoicesContent() {
  const searchParams = useSearchParams()
  const prePatient = searchParams.get('patient')
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: prePatient || '', dueDate: '', notes: '' })
  const [lineItems, setLineItems] = useState([{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)
  const [payForm, setPayForm] = useState({ open: false, invoiceId: null, amount: '' })

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const [ir, pr] = await Promise.all([fetch('/api/invoices?' + params), fetch('/api/patients')])
      if (ir.ok) setInvoices(await ir.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filterStatus])

  const addItem = () => setLineItems([...lineItems, { ...EMPTY_ITEM }])
  const removeItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const updateItem = (i, f, v) => setLineItems(lineItems.map((item, idx) => idx === i ? { ...item, [f]: v } : item))
  const total = lineItems.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.patientId) return toast.error('Select a patient')
    if (lineItems.some(i => !i.description || !i.unitPrice)) return toast.error('Complete all line items')
    setSaving(true)
    try {
      const r = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, lineItems }) })
      if (r.ok) { toast.success('Invoice created'); setShowForm(false); setForm({ patientId: '', dueDate: '', notes: '' }); setLineItems([{ ...EMPTY_ITEM }]); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const handlePayment = async () => {
    if (!payForm.amount) return toast.error('Enter amount')
    const r = await fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: payForm.invoiceId, paidAmount: payForm.amount }) })
    if (r.ok) { toast.success('Payment recorded'); setPayForm({ open: false, invoiceId: null, amount: '' }); load() }
    else toast.error('Failed')
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this invoice?')) return
    const r = await fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'CANCELLED' }) })
    if (r.ok) { toast.success('Invoice cancelled'); load() }
  }

  const totalUnpaid = invoices.filter(i => i.status === 'UNPAID').reduce((s, i) => s + i.totalAmount, 0)
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.paidAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices & Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Patient billing and payment tracking</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: invoices.length, bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Unpaid', value: invoices.filter(i => i.status === 'UNPAID').length, bg: 'bg-red-50', text: 'text-red-700' },
          { label: 'Outstanding', value: `$${totalUnpaid.toFixed(2)}`, bg: 'bg-orange-50', text: 'text-orange-700' },
          { label: 'Collected', value: `$${totalPaid.toFixed(2)}`, bg: 'bg-green-50', text: 'text-green-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 ${c.bg} ${c.text}`}>
            <p className="text-xs font-medium opacity-70">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={'px-3 py-1.5 rounded-xl text-xs font-medium transition-all ' + (filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
            : invoices.length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No invoices found.</p></div>
            : invoices.map(inv => (
              <div key={inv.id} onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
                className={'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ' + (selected?.id === inv.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100')}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{inv.invoiceNumber}</p>
                      <span className={'badge text-xs ' + (sC[inv.status] || 'bg-gray-100')}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.patient?.firstName} {inv.patient?.lastName} · {inv.patient?.patientId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.createdAt).toLocaleDateString('en-ZW')}{inv.dueDate ? ' · Due ' + new Date(inv.dueDate).toLocaleDateString('en-ZW') : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${inv.totalAmount.toFixed(2)}</p>
                    {inv.paidAmount > 0 && inv.status !== 'PAID' && <p className="text-xs text-green-600">Paid: ${inv.paidAmount.toFixed(2)}</p>}
                  </div>
                </div>
                {selected?.id === inv.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-400"><th className="text-left pb-1">Description</th><th className="text-center pb-1">Qty</th><th className="text-right pb-1">Unit</th><th className="text-right pb-1">Total</th></tr></thead>
                      <tbody>{inv.lineItems?.map(li => (
                        <tr key={li.id} className="border-t border-gray-50">
                          <td className="py-1 text-gray-700">{li.description} <span className="text-gray-400">({li.category})</span></td>
                          <td className="py-1 text-center text-gray-600">{li.quantity}</td>
                          <td className="py-1 text-right text-gray-600">${li.unitPrice.toFixed(2)}</td>
                          <td className="py-1 text-right font-medium">${li.total.toFixed(2)}</td>
                        </tr>
                      ))}</tbody>
                      <tfoot><tr className="border-t-2 border-gray-200"><td colSpan={3} className="pt-2 font-semibold">Total</td><td className="pt-2 text-right font-bold">${inv.totalAmount.toFixed(2)}</td></tr></tfoot>
                    </table>
                    {inv.notes && <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500">{inv.notes}</div>}
                    {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setPayForm({ open: true, invoiceId: inv.id, amount: (inv.totalAmount - inv.paidAmount).toFixed(2) }) }} className="btn-primary text-xs">Record Payment</button>
                        <button onClick={e => { e.stopPropagation(); handleCancel(inv.id) }} className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50">Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div>
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">New Invoice</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Patient *</label>
                  <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="input-field text-sm mt-1">
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field text-sm mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 font-medium">Line Items *</label>
                    <button type="button" onClick={addItem} className="text-xs text-primary-600 font-medium hover:text-primary-700">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {lineItems.map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description" className="input-field text-xs" />
                        <div className="grid grid-cols-3 gap-1.5">
                          <input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" className="input-field text-xs" />
                          <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} placeholder="Price $" className="input-field text-xs" />
                          <select value={item.category} onChange={e => updateItem(i, 'category', e.target.value)} className="input-field text-xs">
                            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {lineItems.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700">Remove</button>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right text-sm font-bold text-gray-800">Total: ${total.toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Creating...' : 'Create Invoice'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {payForm.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Amount Paid ($)</label>
                <input type="number" min="0" step="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="input-field text-sm mt-1" autoFocus />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handlePayment} className="btn-primary flex-1 text-sm">Record Payment</button>
                <button onClick={() => setPayForm({ open: false, invoiceId: null, amount: '' })} className="btn-secondary text-sm px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400 text-sm">Loading...</div>}>
      <InvoicesContent />
    </Suspense>
  )
}
