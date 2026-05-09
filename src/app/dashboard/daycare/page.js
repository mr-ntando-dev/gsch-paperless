'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const sC = { CHECKED_IN: 'bg-green-100 text-green-700', CHECKED_OUT: 'bg-gray-100 text-gray-500', SCHEDULED: 'bg-blue-100 text-blue-700' }
const EMPTY_F = { childName: '', age: '', parentName: '', parentPhone: '', notes: '', dietaryNeeds: '', status: 'CHECKED_IN' }

export default function DayCarePage() {
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_F)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const today = new Date().toLocaleDateString('en-ZW')
      const [rr, pr] = await Promise.all([fetch('/api/daycare?date='+today), fetch('/api/patients')])
      if (rr.ok) setRecords(await rr.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/daycare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Child checked in'); setForm(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed to check in') }
    } finally { setSaving(false) }
  }

  const handleCheckOut = async (id) => {
    try {
      const r = await fetch('/api/daycare', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'CHECKED_OUT' }) })
      if (r.ok) { toast.success('Child checked out'); load() }
      else toast.error('Failed to check out')
    } catch { toast.error('Network error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Day Care</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage day care check-ins and scheduling</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Check In Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{s:'CHECKED_IN',l:'Currently Present',col:'bg-green-50 border-green-100'},{s:'SCHEDULED',l:'Scheduled',col:'bg-blue-50 border-blue-100'},{s:'CHECKED_OUT',l:'Checked Out',col:'bg-gray-50 border-gray-100'}].map(({s,l,col})=>(
          <div key={s} className={'rounded-xl p-4 border '+col}>
            <p className="text-2xl font-bold text-gray-800">{records.filter(r=>r.status===s).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {showForm&&(
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Check In Child</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 font-medium">Child Name *</label><input required value={form.childName} onChange={e=>setForm({...form,childName:e.target.value})} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Age *</label><input required value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="e.g. 3 years" className="input-field text-sm mt-1" /></div>
            </div>
            <div><label className="text-xs text-gray-500 font-medium">Parent/Guardian Name *</label><input required value={form.parentName} onChange={e=>setForm({...form,parentName:e.target.value})} className="input-field text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500 font-medium">Parent Phone *</label><input required value={form.parentPhone} onChange={e=>setForm({...form,parentPhone:e.target.value})} className="input-field text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500 font-medium">Dietary Needs</label><input value={form.dietaryNeeds} onChange={e=>setForm({...form,dietaryNeeds:e.target.value})} placeholder="e.g. no nuts, vegetarian" className="input-field text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field text-sm mt-1">
                <option value="CHECKED_IN">Check In Now</option><option value="SCHEDULED">Scheduled (future)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving?'Saving...':'Check In'}</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">No day care records for today.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-gray-700 text-sm">Today's Records</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-ZW',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {records.map(r=>(
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xs">{r.childName[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.childName} <span className="text-gray-400 font-normal">({r.age})</span></p>
                    <p className="text-xs text-gray-400">Parent: {r.parentName} · {r.parentPhone}</p>
                    {r.dietaryNeeds&&<p className="text-xs text-orange-500 mt-0.5">Diet: {r.dietaryNeeds}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className={'badge text-xs '+sC[r.status]}>{r.status.replace('_',' ')}</span>
                    <p className="text-xs text-gray-400 mt-0.5">In: {r.checkInTime}{r.checkOutTime?' · Out: '+r.checkOutTime:''}</p>
                  </div>
                  {r.status==='CHECKED_IN'&&(
                    <button onClick={()=>handleCheckOut(r.id)} className="btn-secondary text-xs py-1 px-3">Check Out</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
