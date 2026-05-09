'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const cT = { ADMITTED: 'bg-red-100 text-red-700', OBSERVATION: 'bg-yellow-100 text-yellow-700', DAYCARE: 'bg-blue-100 text-blue-700', OUTPATIENT: 'bg-gray-100 text-gray-500' }
const cTL = { ADMITTED: 'Admitted', OBSERVATION: 'Observation', DAYCARE: 'Day Care', OUTPATIENT: 'Outpatient' }
const EMPTY_F = { firstName: '', lastName: '', dateOfBirth: '', guardianName: '', guardianPhone: '', address: '', gender: 'UNKNOWN', bloodType: '', allergies: '', careType: 'OUTPATIENT' }

export default function PatientsPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCare, setFilterCare] = useState('')
  const [form, setForm] = useState(EMPTY_F)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [kitchenOpen, setKitchenOpen] = useState(false)
  const [kitchenMsg, setKitchenMsg] = useState('')
  const [kitchenChannel, setKitchenChannel] = useState('KITCHEN')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [patientMsgs, setPatientMsgs] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [kitchenForm, setKitchenForm] = useState({ requestType: 'MEAL', mealTime: 'LUNCH', description: '', dietaryNotes: '', priority: 'MEDIUM' })
  const [kitchenReqOpen, setKitchenReqOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterCare) params.set('careType', filterCare)
      const r = await fetch('/api/patients?' + params)
      if (r.ok) setPatients(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterCare])

  const loadMsgs = async (patId) => {
    setLoadingMsgs(true)
    try {
      const r = await fetch('/api/patient-messages?patientId=' + patId)
      if (r.ok) setPatientMsgs(await r.json())
    } finally { setLoadingMsgs(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Patient registered successfully'); setForm(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed to register patient') }
    } finally { setSaving(false) }
  }

  const sendKitchenMsg = async () => {
    if (!kitchenMsg.trim() || !selected) return
    setSendingMsg(true)
    try {
      const r = await fetch('/api/patient-messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: selected.id, channel: kitchenChannel, content: kitchenMsg.trim(), senderRole: 'NURSE' }) })
      if (r.ok) { toast.success('Message sent'); setKitchenMsg(''); loadMsgs(selected.id) }
      else toast.error('Failed to send message')
    } finally { setSendingMsg(false) }
  }

  const sendKitchenRequest = async (e) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      const r = await fetch('/api/kitchen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...kitchenForm, patientId: selected.id }) })
      if (r.ok) { toast.success('Kitchen request submitted'); setKitchenForm({ requestType: 'MEAL', mealTime: 'LUNCH', description: '', dietaryNotes: '', priority: 'MEDIUM' }); setKitchenReqOpen(false) }
      else toast.error('Failed to submit request')
    } finally { setSaving(false) }
  }

  const openPatient = (p) => { setSelected(p); setKitchenOpen(false); setKitchenReqOpen(false); setShowForm(false); loadMsgs(p.id) }

  const calcAge = (dob) => {
    const d = new Date(dob), now = new Date()
    const yrs = now.getFullYear() - d.getFullYear()
    const mths = now.getMonth() - d.getMonth()
    if (yrs === 0) return (mths < 0 ? 0 : mths) + 'm'
    return yrs + 'y'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">GSCH patient registry</p>
        </div>
        <button onClick={() => { setShowForm(true); setSelected(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Register Patient
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, guardian..." className="input-field max-w-xs text-sm" />
        <select value={filterCare} onChange={e => setFilterCare(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Care Types</option>
          <option value="ADMITTED">Admitted</option>
          <option value="OBSERVATION">Observation</option>
          <option value="DAYCARE">Day Care</option>
          <option value="OUTPATIENT">Outpatient</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['ADMITTED','OBSERVATION','DAYCARE','OUTPATIENT'].map(ct => (
          <div key={ct} className={'rounded-xl p-4 border ' + (ct==='ADMITTED'?'bg-red-50 border-red-100':ct==='OBSERVATION'?'bg-yellow-50 border-yellow-100':ct==='DAYCARE'?'bg-blue-50 border-blue-100':'bg-gray-50 border-gray-100')}>
            <p className="text-2xl font-bold text-gray-800">{patients.filter(p=>p.careType===ct).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{cTL[ct]}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 font-medium">No patients found.</p>
              <p className="text-sm text-gray-400 mt-1">Register the first patient to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patients.map(p => (
                <button key={p.id} onClick={() => openPatient(p)} className={'w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all ' + (selected?.id===p.id?'border-primary-300 ring-2 ring-primary-100':'border-gray-100')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold text-sm">{p.firstName[0]}{p.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-gray-400">{p.patientId} · Age {calcAge(p.dateOfBirth)} · Guardian: {p.guardianName}</p>
                      </div>
                    </div>
                    <span className={'badge text-xs ' + (cT[p.careType]||'bg-gray-100 text-gray-500')}>{cTL[p.careType]||p.careType}</span>
                  </div>
                  {p.admissions&&p.admissions.length>0&&p.admissions[0].status==='ADMITTED'&&(
                    <p className="text-xs text-gray-400 mt-1.5 ml-13">Ward: {p.admissions[0].ward} · Dr. {p.admissions[0].doctor}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {showForm&&!selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Register New Patient</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 font-medium">First Name *</label><input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">Last Name *</label><input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className="input-field text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Date of Birth *</label><input required type="date" value={form.dateOfBirth} onChange={e=>setForm({...form,dateOfBirth:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 font-medium">Gender</label>
                    <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="input-field text-sm mt-1">
                      <option value="UNKNOWN">Unknown</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select></div>
                  <div><label className="text-xs text-gray-500 font-medium">Blood Type</label><input value={form.bloodType} onChange={e=>setForm({...form,bloodType:e.target.value})} placeholder="e.g. O+" className="input-field text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Guardian Name *</label><input required value={form.guardianName} onChange={e=>setForm({...form,guardianName:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Guardian Phone *</label><input required value={form.guardianPhone} onChange={e=>setForm({...form,guardianPhone:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Known Allergies</label><input value={form.allergies} onChange={e=>setForm({...form,allergies:e.target.value})} placeholder="e.g. Penicillin, nuts" className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Initial Care Type</label>
                  <select value={form.careType} onChange={e=>setForm({...form,careType:e.target.value})} className="input-field text-sm mt-1">
                    <option value="OUTPATIENT">Outpatient</option><option value="ADMITTED">Admitted</option><option value="OBSERVATION">Observation</option><option value="DAYCARE">Day Care</option>
                  </select></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving?'Saving...':'Register Patient'}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : selected ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                      <span className="text-white font-bold">{selected.firstName[0]}{selected.lastName[0]}</span>
                    </div>
                    <h2 className="font-bold text-lg">{selected.firstName} {selected.lastName}</h2>
                    <p className="text-white/80 text-xs">{selected.patientId} · Age {calcAge(selected.dateOfBirth)}</p>
                  </div>
                  <span className="badge text-xs bg-white/20 text-white border border-white/30">{cTL[selected.careType]}</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Guardian</span><p className="font-medium text-gray-700 mt-0.5">{selected.guardianName}</p></div>
                  <div><span className="text-gray-400">Phone</span><p className="font-medium text-gray-700 mt-0.5">{selected.guardianPhone}</p></div>
                  {selected.bloodType&&<div><span className="text-gray-400">Blood Type</span><p className="font-medium text-gray-700 mt-0.5">{selected.bloodType}</p></div>}
                  {selected.allergies&&<div><span className="text-gray-400">Allergies</span><p className="font-medium text-red-600 mt-0.5">{selected.allergies}</p></div>}
                  {selected.gender&&selected.gender!=='UNKNOWN'&&<div><span className="text-gray-400">Gender</span><p className="font-medium text-gray-700 mt-0.5">{selected.gender}</p></div>}
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={'/dashboard/admissions?patient='+selected.id} className="btn-secondary text-xs text-center py-2">Admission Records</Link>
                  <Link href={'/dashboard/observations?patient='+selected.id} className="btn-secondary text-xs text-center py-2">Observation Records</Link>
                  <button onClick={() => { setKitchenReqOpen(!kitchenReqOpen); setKitchenOpen(false) }} className="btn-secondary text-xs py-2 text-left flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 13.5l-3 3m0 0-3-3m3 3V21M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5" /></svg>
                    Send Kitchen Request
                  </button>
                  <button onClick={() => { setKitchenOpen(!kitchenOpen); setKitchenReqOpen(false) }} className="btn-secondary text-xs py-2 text-left flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                    Patient Messages
                  </button>
                </div>
                {kitchenReqOpen&&(
                  <form onSubmit={sendKitchenRequest} className="space-y-2 pt-1 border-t border-gray-100">
                    <p className="text-xs font-semibold text-orange-600">Kitchen Request for {selected.firstName}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={kitchenForm.requestType} onChange={e=>setKitchenForm({...kitchenForm,requestType:e.target.value})} className="input-field text-xs">
                        <option value="MEAL">Meal</option><option value="DIETARY">Dietary</option><option value="SPECIAL">Special</option><option value="ALLERGY_NOTE">Allergy Note</option>
                      </select>
                      <select value={kitchenForm.mealTime} onChange={e=>setKitchenForm({...kitchenForm,mealTime:e.target.value})} className="input-field text-xs">
                        <option value="BREAKFAST">Breakfast</option><option value="LUNCH">Lunch</option><option value="DINNER">Dinner</option><option value="SNACK">Snack</option>
                      </select>
                    </div>
                    <textarea required value={kitchenForm.description} onChange={e=>setKitchenForm({...kitchenForm,description:e.target.value})} placeholder="Describe the request..." className="input-field text-xs h-16 resize-none" />
                    <input value={kitchenForm.dietaryNotes} onChange={e=>setKitchenForm({...kitchenForm,dietaryNotes:e.target.value})} placeholder="Dietary notes / restrictions..." className="input-field text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={kitchenForm.priority} onChange={e=>setKitchenForm({...kitchenForm,priority:e.target.value})} className="input-field text-xs">
                        <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
                      </select>
                      <button type="submit" disabled={saving} className="btn-primary text-xs">{saving?'Sending...':'Send to Kitchen'}</button>
                    </div>
                  </form>
                )}
                {kitchenOpen&&(
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    <p className="text-xs font-semibold text-primary-600">Messages — {selected.firstName} {selected.lastName}</p>
                    <select value={kitchenChannel} onChange={e=>setKitchenChannel(e.target.value)} className="input-field text-xs w-full">
                      <option value="KITCHEN">Kitchen Channel</option><option value="NURSING">Nursing Channel</option><option value="GENERAL">General</option>
                    </select>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 bg-gray-50 rounded-lg p-2">
                      {loadingMsgs?<p className="text-xs text-gray-400 text-center py-2">Loading...</p>:
                        patientMsgs.length===0?<p className="text-xs text-gray-400 text-center py-2">No messages yet.</p>:
                        patientMsgs.map(m=>(
                          <div key={m.id} className={'rounded-lg p-2 text-xs '+(m.channel==='KITCHEN'?'bg-orange-50 border border-orange-100':m.channel==='NURSING'?'bg-blue-50 border border-blue-100':'bg-white border border-gray-100')}>
                            <p className="font-medium text-gray-700">{m.senderName} <span className="text-gray-400 font-normal">({m.senderRole})</span></p>
                            <p className="text-gray-600 mt-0.5">{m.content}</p>
                          </div>
                        ))
                      }
                    </div>
                    <div className="flex gap-2">
                      <input value={kitchenMsg} onChange={e=>setKitchenMsg(e.target.value)} placeholder={'Message to '+kitchenChannel.toLowerCase()+'...'} className="input-field text-xs flex-1"
                        onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendKitchenMsg()}}} />
                      <button onClick={sendKitchenMsg} disabled={sendingMsg||!kitchenMsg.trim()} className="btn-primary text-xs px-3">{sendingMsg?'...':'Send'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
              <p className="text-sm">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
