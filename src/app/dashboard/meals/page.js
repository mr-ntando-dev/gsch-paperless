'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const sC = { PENDING: 'bg-yellow-100 text-yellow-700', ACKNOWLEDGED: 'bg-blue-100 text-blue-700', PREPARING: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-400' }
const mTC = { BREAKFAST: 'text-yellow-600', LUNCH: 'text-green-600', DINNER: 'text-blue-600', SNACK: 'text-purple-600' }

export default function MealsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: '', requestType: 'MEAL', mealTime: 'LUNCH', description: '', dietaryNotes: '', priority: 'MEDIUM' })
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = filterStatus ? '?status=' + filterStatus : ''
      const [kr, pr] = await Promise.all([fetch('/api/kitchen'+params), fetch('/api/patients')])
      if (kr.ok) setRequests(await kr.json())
      if (pr.ok) setPatients(await pr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/kitchen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Kitchen request created'); setForm({ patientId: '', requestType: 'MEAL', mealTime: 'LUNCH', description: '', dietaryNotes: '', priority: 'MEDIUM' }); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed to create request') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const r = await fetch('/api/kitchen', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      if (r.ok) { toast.success('Status updated'); load() }
      else toast.error('Failed to update')
    } finally { setUpdating(null) }
  }

  const nextStatus = { PENDING: 'ACKNOWLEDGED', ACKNOWLEDGED: 'PREPARING', PREPARING: 'DELIVERED' }
  const nextLabel = { PENDING: 'Acknowledge', ACKNOWLEDGED: 'Start Preparing', PREPARING: 'Mark Delivered' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen & Meal Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Patient meal orders and dietary requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Request
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>setFilterStatus('')} className={'px-3 py-2 rounded-xl text-xs font-medium transition-all '+(filterStatus===''?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>All</button>
        {Object.keys(sC).map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} className={'px-3 py-2 rounded-xl text-xs font-medium transition-all '+(filterStatus===s?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {s.charAt(0)+s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.keys(sC).map(s=>(
          <div key={s} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{requests.filter(r=>r.status===s).length}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.charAt(0)+s.slice(1).toLowerCase()}</p>
          </div>
        ))}
      </div>

      {showForm&&(
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">New Kitchen Request</h2>
            <button onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Patient *</label>
              <select required value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} className="input-field text-sm mt-1">
                <option value="">Select patient...</option>
                {patients.filter(p=>p.careType!=='OUTPATIENT').map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId}) — {p.careType}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Type</label>
                <select value={form.requestType} onChange={e=>setForm({...form,requestType:e.target.value})} className="input-field text-sm mt-1">
                  <option value="MEAL">Meal</option><option value="DIETARY">Dietary</option><option value="SPECIAL">Special</option><option value="ALLERGY_NOTE">Allergy Note</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Meal Time</label>
                <select value={form.mealTime} onChange={e=>setForm({...form,mealTime:e.target.value})} className="input-field text-sm mt-1">
                  <option value="BREAKFAST">Breakfast</option><option value="LUNCH">Lunch</option><option value="DINNER">Dinner</option><option value="SNACK">Snack</option>
                </select>
              </div>
            </div>
            <div><label className="text-xs text-gray-500 font-medium">Description *</label><textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Describe the meal or dietary requirement..." className="input-field text-sm mt-1 resize-none" /></div>
            <div><label className="text-xs text-gray-500 font-medium">Dietary Notes</label><input value={form.dietaryNotes} onChange={e=>setForm({...form,dietaryNotes:e.target.value})} placeholder="Allergies, restrictions..." className="input-field text-sm mt-1" /></div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Priority</label>
              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="input-field text-sm mt-1">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving?'Sending...':'Send to Kitchen'}</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">No kitchen requests.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-700 text-sm">Requests <span className="text-gray-400 font-normal">({requests.length})</span></p>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.map(req=>(
              <div key={req.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 13.5l-3 3m0 0-3-3m3 3V21M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5" /></svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{req.patient.firstName} {req.patient.lastName} <span className="text-gray-400 font-normal text-xs">({req.patient.patientId})</span></p>
                    <p className={'text-xs font-medium '+mTC[req.mealTime]}>{req.mealTime} · {req.requestType}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{req.description}</p>
                    {req.dietaryNotes&&<p className="text-xs text-red-500 mt-0.5">Diet: {req.dietaryNotes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className={'badge text-xs '+sC[req.status]}>{req.status}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleTimeString('en-ZW',{hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  {nextStatus[req.status]&&(
                    <button onClick={()=>updateStatus(req.id,nextStatus[req.status])} disabled={updating===req.id} className="btn-secondary text-xs py-1 px-2.5">
                      {updating===req.id?'...':nextLabel[req.status]}
                    </button>
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
