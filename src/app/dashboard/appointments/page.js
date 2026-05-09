'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const STATUS_C = { SCHEDULED: 'bg-blue-100 text-blue-700', CONFIRMED: 'bg-teal-100 text-teal-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700', NO_SHOW: 'bg-gray-100 text-gray-500' }
const TYPE_C = { OUTPATIENT: 'bg-indigo-100 text-indigo-700', FOLLOW_UP: 'bg-amber-100 text-amber-700', PROCEDURE: 'bg-purple-100 text-purple-700', CONSULTATION: 'bg-sky-100 text-sky-700' }
const DEPTS = ['Patient Care','CRD','Baby Clinic','Day Care','Surgical','Emergency','General']
const EMPTY_F = { patientId: '', patientName: '', guardianPhone: '', doctor: '', department: 'Patient Care', date: '', time: '', duration: 30, type: 'OUTPATIENT', reason: '', notes: '' }

function CalendarGrid({ appts, selectedDate, onSelectDate }) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)
  const monthStr = viewMonth.toLocaleDateString('en-ZW', { month: 'long', year: 'numeric' })

  const countForDay = (day) => {
    const ds = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appts.filter(a => a.date === ds).length
  }
  const toDs = (day) => `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const todayDs = today.toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>
        <p className="font-semibold text-gray-800 text-sm">{monthStr}</p>
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const ds = toDs(day)
          const count = countForDay(day)
          const isToday = ds === todayDs
          const isSelected = ds === selectedDate
          return (
            <button key={i} onClick={() => onSelectDate(ds)} className={`relative aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${isSelected ? 'bg-primary-600 text-white' : isToday ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'}`}>
              <span>{day}</span>
              {count > 0 && <span className={`text-[9px] font-bold ${isSelected ? 'text-primary-200' : 'text-primary-600'}`}>{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const [appts, setAppts] = useState([])
  const [allAppts, setAllAppts] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_F, date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('')

  const load = async (date) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      if (filterStatus) params.set('status', filterStatus)
      const [ar, pr, allr] = await Promise.all([fetch('/api/appointments?' + params), fetch('/api/patients'), fetch('/api/appointments')])
      if (ar.ok) setAppts(await ar.json())
      if (pr.ok) setPatients(await pr.json())
      if (allr.ok) setAllAppts(await allr.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load(selectedDate) }, [selectedDate, filterStatus])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Appointment booked'); setShowForm(false); setForm({ ...EMPTY_F, date: selectedDate }); load(selectedDate) }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    const r = await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success('Updated'); load(selectedDate) } else toast.error('Failed')
  }

  const deleteAppt = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    const r = await fetch('/api/appointments?id=' + id, { method: 'DELETE' })
    if (r.ok) { toast.success('Cancelled'); load(selectedDate) } else toast.error('Failed')
  }

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const h = Math.floor(i / 2) + 7
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and manage patient appointments</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_F, date: selectedDate }) }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="space-y-4">
          <CalendarGrid appts={allAppts} selectedDate={selectedDate} onSelectDate={d => { setSelectedDate(d); setForm(f => ({ ...f, date: d })) }} />
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter by status</p>
            {['', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (filterStatus === s ? 'bg-primary-600 text-white' : 'hover:bg-gray-50 text-gray-600')}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Day view */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            <span className="badge bg-primary-100 text-primary-700 text-xs">{appts.length} appointment{appts.length !== 1 ? 's' : ''}</span>
          </div>
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
            : appts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400 text-sm">No appointments on this day.</p>
                <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">+ Book one</button>
              </div>
            ) : appts.sort((a, b) => a.time.localeCompare(b.time)).map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-sm font-bold text-primary-600">{a.time}</p>
                    <p className="text-[10px] text-gray-400">{a.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : a.patientName || 'Walk-in'}</p>
                        <p className="text-xs text-gray-400">Dr. {a.doctor} · {a.department}</p>
                        {a.reason && <p className="text-xs text-gray-500 mt-0.5">{a.reason}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={'badge text-xs ' + (STATUS_C[a.status] || '')}>{a.status}</span>
                        <span className={'badge text-xs ' + (TYPE_C[a.type] || '')}>{a.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {a.status === 'SCHEDULED' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateStatus(a.id, 'CONFIRMED')} className="btn-secondary text-xs text-teal-700 border-teal-200 hover:bg-teal-50">Confirm</button>
                        <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="btn-secondary text-xs text-green-700 border-green-200 hover:bg-green-50">Complete</button>
                        <button onClick={() => updateStatus(a.id, 'NO_SHOW')} className="btn-secondary text-xs text-gray-500 border-gray-200">No Show</button>
                        <button onClick={() => deleteAppt(a.id)} className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Form / summary */}
        <div>
          {showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">Book Appointment</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Patient (registered)</label>
                  <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="input-field text-sm mt-1">
                    <option value="">Walk-in / New</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                  </select>
                </div>
                {!form.patientId && (
                  <>
                    <div><label className="text-xs text-gray-500 font-medium">Patient Name *</label><input required={!form.patientId} value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} placeholder="Full name" className="input-field text-sm mt-1" /></div>
                    <div><label className="text-xs text-gray-500 font-medium">Guardian Phone</label><input value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} className="input-field text-sm mt-1" /></div>
                  </>
                )}
                <div><label className="text-xs text-gray-500 font-medium">Doctor *</label><input required value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} placeholder="Dr. ..." className="input-field text-sm mt-1" /></div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Department *</label>
                  <select required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field text-sm mt-1">
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500 font-medium">Date *</label><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Time *</label>
                    <select required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-field text-sm mt-1">
                      <option value="">Select time</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field text-sm mt-1">
                      {['OUTPATIENT','FOLLOW_UP','PROCEDURE','CONSULTATION'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs text-gray-500 font-medium">Duration (min)</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} min={10} max={180} step={5} className="input-field text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Reason</label><input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason for visit" className="input-field text-sm mt-1" /></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Booking...' : 'Book'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Today&apos;s Summary</h3>
              <div className="space-y-2">
                {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => {
                  const todayDs = new Date().toISOString().split('T')[0]
                  const count = allAppts.filter(a => a.date === todayDs && a.status === s).length
                  return (
                    <div key={s} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-600">{s.replace('_', ' ')}</span>
                      <span className={'badge text-xs ' + (STATUS_C[s] || '')}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
