'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const sC = { ADMITTED: 'bg-red-100 text-red-700', DISCHARGED: 'bg-green-100 text-green-700', TRANSFERRED: 'bg-yellow-100 text-yellow-700' }
const EMPTY_F = { patientId: '', ward: '', bed: '', doctor: '', diagnosis: '', notes: '', dietaryNotes: '' }

export default function AdmissionsPage() {
  const searchParams = useSearchParams()
  const prePatient = searchParams.get('patient')
  const [admissions, setAdmissions] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_F, patientId: prePatient || '' })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ADMITTED')
  const [selected, setSelected] = useState(null)
  const [discharging, setDischarging] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [ar, pr] = await Promise.all([
        fetch('/api/admissions?status=' + filterStatus),
        fetch('/api/patients')
      ])
      if (ar.ok) setAdmissions(await ar.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/admissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Patient admitted successfully'); setForm(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed to admit patient') }
    } finally { setSaving(false) }
  }

  const handleDischarge = async (admission) => {
    if (!confirm('Discharge ' + admission.patient.firstName + ' ' + admission.patient.lastName + '?')) return
    setDischarging(true)
    try {
      const r = await fetch('/api/admissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admission.id, status: 'DISCHARGED', dischargeDate: new Date().toISOString() }) })
      if (r.ok) { toast.success('Patient discharged'); load() }
      else toast.error('Failed to discharge patient')
    } finally { setDischarging(false) }
  }

  const daysAdmitted = (admitDate) => {
    const days = Math.floor((new Date() - new Date(admitDate)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Admitted today'
    return days + ' day' + (days !== 1 ? 's' : '')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage patient admissions and discharges</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Admission
        </button>
      </div>

      <div className="flex gap-2">
        {['ADMITTED','DISCHARGED','TRANSFERRED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + (filterStatus===s?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {s.charAt(0)+s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading admissions...</div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 font-medium">No {filterStatus.toLowerCase()} admissions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admissions.map(a => (
                <div key={a.id} onClick={() => setSelected(selected?.id===a.id?null:a)} className={'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ' + (selected?.id===a.id?'border-primary-300 ring-2 ring-primary-100':'border-gray-100')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{a.patient.firstName} {a.patient.lastName}</p>
                        <p className="text-xs text-gray-400">{a.patient.patientId} · Ward {a.ward}{a.bed?' · Bed '+a.bed:''}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Dr. {a.doctor}{a.diagnosis?' · '+a.diagnosis:''}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={'badge text-xs ' + (sC[a.status]||'bg-gray-100 text-gray-500')}>{a.status}</span>
                      <p className="text-xs text-gray-400 mt-1">{daysAdmitted(a.admitDate)}</p>
                    </div>
                  </div>
                  {selected?.id===a.id&&(
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {a.diagnosis&&<div><p className="text-xs text-gray-400">Diagnosis</p><p className="text-sm text-gray-700 mt-0.5">{a.diagnosis}</p></div>}
                      {a.notes&&<div><p className="text-xs text-gray-400">Notes</p><p className="text-sm text-gray-700 mt-0.5">{a.notes}</p></div>}
                      {a.dietaryNotes&&(
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                          <p className="text-xs text-orange-600 font-medium">Dietary Notes</p>
                          <p className="text-sm text-orange-700 mt-0.5">{a.dietaryNotes}</p>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        <p>Admitted: {new Date(a.admitDate).toLocaleString('en-ZW')}</p>
                        {a.dischargeDate&&<p>Discharged: {new Date(a.dischargeDate).toLocaleString('en-ZW')}</p>}
                      </div>
                      {a.status==='ADMITTED'&&(
                        <div className="flex gap-2">
                          <button onClick={(e)=>{e.stopPropagation();handleDischarge(a)}} disabled={discharging} className="btn-secondary text-xs text-green-700 border-green-200 hover:bg-green-50">Discharge Patient</button>
                          <button onClick={(e)=>{e.stopPropagation();}} className="btn-secondary text-xs">Transfer</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">Admit Patient</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Patient *</label>
                  <select required value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} className="input-field text-sm mt-1">
                    <option value="">Select patient...</option>
                    {patients.map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 font-medium">Ward *</label><input required value={form.ward} onChange={e=>setForm({...form,ward:e.target.value})} placeholder="e.g. Ward A" className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">Bed</label><input value={form.bed} onChange={e=>setForm({...form,bed:e.target.value})} placeholder="e.g. B12" className="input-field text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Doctor *</label><input required value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})} placeholder="Attending doctor" className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Diagnosis</label><input value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Dietary Notes</label><input value={form.dietaryNotes} onChange={e=>setForm({...form,dietaryNotes:e.target.value})} placeholder="Dietary requirements / restrictions" className="input-field text-sm mt-1" /></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving?'Admitting...':'Admit Patient'}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Quick Stats</h3>
              <div className="space-y-2">
                {['ADMITTED','DISCHARGED','TRANSFERRED'].map(s=>(
                  <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.charAt(0)+s.slice(1).toLowerCase()}</span>
                    <span className={'badge text-xs ' + (sC[s]||'bg-gray-100 text-gray-500')}>{admissions.filter(a=>a.status===s).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
