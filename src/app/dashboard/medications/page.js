'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const ROUTES = ['ORAL','IV','IM','TOPICAL','INHALED','RECTAL','NASAL']
const STATUS_C = { ACTIVE: 'bg-teal-100 text-teal-700', STOPPED: 'bg-red-100 text-red-700', COMPLETED: 'bg-gray-100 text-gray-500' }
const EMPTY_F = { patientId: '', name: '', dose: '', route: 'ORAL', frequency: '', startDate: '', endDate: '', prescribedBy: '', notes: '' }

function MedicationsContent() {
  const searchParams = useSearchParams()
  const prePatient = searchParams.get('patientId')
  const [meds, setMeds] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_F, patientId: prePatient || '' })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ACTIVE')
  const [selected, setSelected] = useState(null)
  const [adminModal, setAdminModal] = useState({ open: false, medId: null, medName: '' })
  const [adminForm, setAdminForm] = useState({ givenBy: '', dose: '', notes: '' })
  const [adminSaving, setAdminSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const [mr, pr] = await Promise.all([fetch('/api/medications?' + params), fetch('/api/patients')])
      if (mr.ok) setMeds(await mr.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/medications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Medication prescribed'); setForm(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      const r = await fetch('/api/medications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      if (r.ok) { toast.success('Updated'); load() } else toast.error('Failed')
    } catch { toast.error('Network error') }
  }

  const handleAdminister = async () => {
    if (!adminForm.givenBy) return toast.error('Enter who administered')
    setAdminSaving(true)
    try {
      const r = await fetch('/api/medications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: adminModal.medId, action: 'administer', ...adminForm }) })
      if (r.ok) { toast.success('Administration recorded'); setAdminModal({ open: false, medId: null, medName: '' }); setAdminForm({ givenBy: '', dose: '', notes: '' }); load() }
      else toast.error('Failed')
    } finally { setAdminSaving(false) }
  }

  const filtered = meds.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.patient?.firstName?.toLowerCase().includes(q) || m.patient?.lastName?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prescriptions and drug administration records</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Prescribe Medication
        </button>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-2">
          {['ACTIVE', 'STOPPED', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={'px-3 py-1.5 rounded-xl text-xs font-medium transition-all ' + (filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medications or patients..." className="input-field text-sm max-w-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
            : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No {filterStatus.toLowerCase()} medications.</p>
              </div>
            ) : filtered.map(m => (
              <div key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)} className={'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ' + (selected?.id === m.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.698-1.414 2.698H4.213c-1.444 0-2.414-1.698-1.414-2.698L4.2 15.3" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{m.name} <span className="text-gray-400 font-normal">— {m.dose}</span></p>
                      <p className="text-xs text-gray-400">{m.patient?.firstName} {m.patient?.lastName} · {m.route} · {m.frequency}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Dr. {m.prescribedBy}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={'badge text-xs ' + (STATUS_C[m.status] || 'bg-gray-100 text-gray-500')}>{m.status}</span>
                    <p className="text-xs text-gray-400 mt-1">{m.administrations?.length || 0} doses given</p>
                  </div>
                </div>

                {selected?.id === m.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-gray-400">Start:</span> <span className="text-gray-700">{new Date(m.startDate).toLocaleDateString('en-ZW')}</span></div>
                      {m.endDate && <div><span className="text-gray-400">End:</span> <span className="text-gray-700">{new Date(m.endDate).toLocaleDateString('en-ZW')}</span></div>}
                    </div>
                    {m.notes && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{m.notes}</p>}
                    {m.administrations?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Recent Administrations</p>
                        <div className="space-y-1">
                          {m.administrations.map((a, i) => (
                            <div key={i} className="text-xs text-blue-700 flex justify-between">
                              <span>{new Date(a.givenAt).toLocaleString('en-ZW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-blue-500">by {a.givenBy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.status === 'ACTIVE' && (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={e => { e.stopPropagation(); setAdminModal({ open: true, medId: m.id, medName: m.name }); setAdminForm({ givenBy: '', dose: m.dose, notes: '' }) }} className="btn-secondary text-xs text-teal-700 border-teal-200 hover:bg-teal-50">+ Record Dose</button>
                        <button onClick={e => { e.stopPropagation(); updateStatus(m.id, 'COMPLETED') }} className="btn-secondary text-xs text-green-700 border-green-200 hover:bg-green-50">Mark Completed</button>
                        <button onClick={e => { e.stopPropagation(); updateStatus(m.id, 'STOPPED') }} className="btn-secondary text-xs text-red-700 border-red-200 hover:bg-red-50">Stop</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div>
          {showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">Prescribe Medication</h2>
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
                <div><label className="text-xs text-gray-500 font-medium">Drug Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amoxicillin" className="input-field text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500 font-medium">Dose *</label><input required value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} placeholder="e.g. 250mg" className="input-field text-sm mt-1" /></div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Route</label>
                    <select value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} className="input-field text-sm mt-1">
                      {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Frequency *</label><input required value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. 8 hourly, BD, OD" className="input-field text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500 font-medium">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Prescribed By *</label><input required value={form.prescribedBy} onChange={e => setForm({ ...form, prescribedBy: e.target.value })} placeholder="Dr. ..." className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : 'Prescribe'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Summary</h3>
              <div className="space-y-2">
                {['ACTIVE', 'COMPLETED', 'STOPPED'].map(s => (
                  <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                    <span className={'badge text-xs ' + (STATUS_C[s] || 'bg-gray-100')}>{meds.filter(m => m.status === s).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {adminModal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-1">Record Dose</h3>
            <p className="text-xs text-gray-400 mb-4">{adminModal.medName}</p>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 font-medium">Administered By *</label><input value={adminForm.givenBy} onChange={e => setAdminForm({ ...adminForm, givenBy: e.target.value })} placeholder="Nurse / Doctor name" className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Dose Given</label><input value={adminForm.dose} onChange={e => setAdminForm({ ...adminForm, dose: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Notes</label><input value={adminForm.notes} onChange={e => setAdminForm({ ...adminForm, notes: e.target.value })} placeholder="Any observations..." className="input-field text-sm mt-1" /></div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAdminister} disabled={adminSaving} className="btn-primary flex-1 text-sm">{adminSaving ? 'Saving...' : 'Record Dose'}</button>
                <button onClick={() => setAdminModal({ open: false, medId: null, medName: '' })} className="btn-secondary text-sm px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MedicationsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400 text-sm">Loading...</div>}>
      <MedicationsContent />
    </Suspense>
  )
}
