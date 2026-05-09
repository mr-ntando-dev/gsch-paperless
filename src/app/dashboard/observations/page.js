'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const sC = { ACTIVE: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', ESCALATED: 'bg-red-100 text-red-700' }
const EMPTY_F = { patientId: '', reason: '', doctor: '', observationArea: 'General', notes: '' }

function ObservationsContent() {
  const searchParams = useSearchParams()
  const prePatient = searchParams.get('patient')
  const [observations, setObservations] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_F, patientId: prePatient || '' })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ACTIVE')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [or, pr] = await Promise.all([
        fetch('/api/observations?status=' + filterStatus),
        fetch('/api/patients')
      ])
      if (or.ok) setObservations(await or.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/observations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Observation started'); setForm(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed to start observation') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (obs, newStatus) => {
    try {
      const r = await fetch('/api/observations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: obs.id, status: newStatus }) })
      if (r.ok) { toast.success('Status updated'); load() }
      else toast.error('Failed to update')
    } catch { toast.error('Network error') }
  }

  const elapsed = (start) => {
    const hrs = Math.floor((new Date() - new Date(start)) / (1000 * 60 * 60))
    if (hrs < 1) return 'Less than 1 hour'
    return hrs + ' hr' + (hrs!==1?'s':'')
  }

  const areas = ['General','Cardiac','Respiratory','Neurological','Paediatric','Surgical','Emergency']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Observation Ward</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track patients under medical observation</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Start Observation
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ACTIVE','COMPLETED','ESCALATED'].map(s=>(
          <button key={s} onClick={() => setFilterStatus(s)} className={'px-4 py-2 rounded-xl text-sm font-medium transition-all '+(filterStatus===s?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {s.charAt(0)+s.slice(1).toLowerCase()}
            {s==='ACTIVE'&&observations.filter(o=>o.status==='ACTIVE').length>0&&<span className="ml-2 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5">{observations.filter(o=>o.status==='ACTIVE').length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : observations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 font-medium">No {filterStatus.toLowerCase()} observations.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {observations.map(o => (
                <div key={o.id} onClick={() => setSelected(selected?.id===o.id?null:o)} className={'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all '+(selected?.id===o.id?'border-primary-300 ring-2 ring-primary-100':'border-gray-100')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{o.patient.firstName} {o.patient.lastName}</p>
                        <p className="text-xs text-gray-400">{o.patient.patientId} · {o.observationArea} · Dr. {o.doctor}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{o.reason}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={'badge text-xs '+(sC[o.status]||'bg-gray-100 text-gray-500')}>{o.status}</span>
                      <p className="text-xs text-gray-400 mt-1">{elapsed(o.startDate)}</p>
                    </div>
                  </div>
                  {selected?.id===o.id&&(
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {o.notes&&<div><p className="text-xs text-gray-400">Notes</p><p className="text-sm text-gray-700 mt-0.5">{o.notes}</p></div>}
                      {o.vitals&&(
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium mb-1">Vitals</p>
                          <pre className="text-xs text-blue-700">{JSON.stringify(o.vitals, null, 2)}</pre>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        <p>Started: {new Date(o.startDate).toLocaleString('en-ZW')}</p>
                        {o.endDate&&<p>Ended: {new Date(o.endDate).toLocaleString('en-ZW')}</p>}
                      </div>
                      {o.status==='ACTIVE'&&(
                        <div className="flex gap-2">
                          <button onClick={(e)=>{e.stopPropagation();updateStatus(o,'COMPLETED')}} className="btn-secondary text-xs text-green-700 border-green-200 hover:bg-green-50">Mark Completed</button>
                          <button onClick={(e)=>{e.stopPropagation();updateStatus(o,'ESCALATED')}} className="btn-secondary text-xs text-red-700 border-red-200 hover:bg-red-50">Escalate to Admission</button>
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
                <h2 className="font-semibold text-gray-800 text-sm">Start Observation</h2>
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
                <div><label className="text-xs text-gray-500 font-medium">Reason *</label><input required value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Reason for observation" className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Doctor *</label><input required value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Area</label>
                  <select value={form.observationArea} onChange={e=>setForm({...form,observationArea:e.target.value})} className="input-field text-sm mt-1">
                    {areas.map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} className="input-field text-sm mt-1 resize-none" /></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving?'Starting...':'Start Observation'}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Summary</h3>
              <div className="space-y-2">
                {['ACTIVE','COMPLETED','ESCALATED'].map(s=>(
                  <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.charAt(0)+s.slice(1).toLowerCase()}</span>
                    <span className={'badge text-xs '+(sC[s]||'bg-gray-100 text-gray-500')}>{observations.filter(o=>o.status===s).length}</span>
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

export default function ObservationsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400 text-sm">Loading...</div>}>
      <ObservationsContent />
    </Suspense>
  )
}
