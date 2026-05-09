'use client'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

const statusColors = { WAITING: 'bg-amber-100 text-amber-800', IN_PROGRESS: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-green-100 text-green-800', NO_SHOW: 'bg-gray-100 text-gray-800' }
const VISIT_TYPES = ['IMMUNIZATION', 'GROWTH_CHECK', 'SICK_VISIT', 'FOLLOW_UP']
const EMPTY_F = { babyName: '', dob: '', parentName: '', parentPhone: '', visitType: 'IMMUNIZATION', weight: '', height: '', notes: '' }

export default function BabyClinicPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_F)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const today = new Date()
  const dayOfWeek = today.getDay()
  const isClinicDay = dayOfWeek === 3 || dayOfWeek === 6

  const nextClinicDay = useMemo(() => {
    const d = new Date()
    const current = d.getDay()
    let daysUntilWed = (3 - current + 7) % 7
    let daysUntilSat = (6 - current + 7) % 7
    if (daysUntilWed === 0 && d.getHours() >= 17) daysUntilWed = 7
    if (daysUntilSat === 0 && d.getHours() >= 17) daysUntilSat = 7
    const daysUntil = Math.min(daysUntilWed || 7, daysUntilSat || 7)
    const next = new Date(d)
    next.setDate(d.getDate() + daysUntil)
    return next.toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/baby-clinic?date=${selectedDate}`)
      if (r.ok) setVisits(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/baby-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, visitDate: selectedDate }),
      })
      if (r.ok) { toast.success('Visit registered'); setFormData(EMPTY_F); setShowForm(false); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    const r = await fetch('/api/baby-clinic', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success('Status updated'); load() }
    else toast.error('Failed to update')
  }

  const stats = { waiting: visits.filter(v => v.status === 'WAITING').length, inProgress: visits.filter(v => v.status === 'IN_PROGRESS').length, completed: visits.filter(v => v.status === 'COMPLETED').length }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Baby Clinic</h1>
          <p className="text-sm text-gray-500 mt-1">Immunizations, growth monitoring, and well-baby visits — Wednesdays & Saturdays</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field text-sm" />
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Register Visit
          </button>
        </div>
      </div>

      {!isClinicDay && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Baby Clinic is not open today</p>
            <p className="text-xs text-amber-600 mt-0.5">Next clinic day: {nextClinicDay}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Waiting', value: stats.waiting, color: 'bg-amber-50 text-amber-700' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-50 text-blue-700' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading visits...</div>
            : visits.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No visits recorded for this date.</p>
                <p className="text-sm text-gray-400 mt-1">Register a visit using the button above.</p>
              </div>
            ) : visits.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{v.babyName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">DOB: {v.dob} · Parent: {v.parentName} · {v.parentPhone}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{v.visitType.replace('_', ' ')} · {v.visitTime}</p>
                    {v.weight && <p className="text-xs text-gray-500 mt-0.5">Weight: {v.weight} kg{v.height ? ` · Height: ${v.height} cm` : ''}</p>}
                    {v.notes && <p className="text-xs text-gray-400 mt-1 italic">{v.notes}</p>}
                  </div>
                  <span className={'badge text-xs ' + (statusColors[v.status] || 'bg-gray-100')}>{v.status.replace('_', ' ')}</span>
                </div>
                {v.status !== 'COMPLETED' && v.status !== 'NO_SHOW' && (
                  <div className="mt-3 flex gap-2">
                    {v.status === 'WAITING' && <button onClick={() => updateStatus(v.id, 'IN_PROGRESS')} className="btn-secondary text-xs text-blue-700 border-blue-200 hover:bg-blue-50">Start</button>}
                    {v.status === 'IN_PROGRESS' && <button onClick={() => updateStatus(v.id, 'COMPLETED')} className="btn-secondary text-xs text-green-700 border-green-200 hover:bg-green-50">Complete</button>}
                    <button onClick={() => updateStatus(v.id, 'NO_SHOW')} className="btn-secondary text-xs text-gray-500 hover:bg-gray-50">No Show</button>
                  </div>
                )}
              </div>
            ))}
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 text-sm">Register Visit</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-xs text-gray-500 font-medium">Baby's Name *</label><input required value={formData.babyName} onChange={e => setFormData({ ...formData, babyName: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Date of Birth *</label><input required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Parent/Guardian Name *</label><input required value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Phone *</label><input required value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} className="input-field text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Visit Type</label>
                <select value={formData.visitType} onChange={e => setFormData({ ...formData, visitType: e.target.value })} className="input-field text-sm mt-1">
                  {VISIT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Weight (kg)</label><input value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 5.2" className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Height (cm)</label><input value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="e.g. 58" className="input-field text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Registering...' : 'Register'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
