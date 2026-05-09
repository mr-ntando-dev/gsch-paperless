'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const SHIFT_C = { DAY: 'bg-amber-100 text-amber-700', NIGHT: 'bg-indigo-100 text-indigo-700', ON_CALL: 'bg-purple-100 text-purple-700' }
const STATUS_C = { SCHEDULED: 'bg-blue-100 text-blue-700', ACTIVE: 'bg-teal-100 text-teal-700', COMPLETED: 'bg-green-100 text-green-700', ABSENT: 'bg-red-100 text-red-700' }
const EMPTY_F = { userId: '', date: '', shiftType: 'DAY', startTime: '07:00', endTime: '15:00', department: '', notes: '' }

function getWeekDates(offset = 0) {
  const today = new Date()
  today.setDate(today.getDate() - today.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function ShiftsPage() {
  const { data: session } = useSession()
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_F)
  const [saving, setSaving] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [viewMode, setViewMode] = useState('week') // week | list
  const [filterDept, setFilterDept] = useState('')
  const weekDates = getWeekDates(weekOffset)
  const isAdmin = ['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(session?.user?.role)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('week', weekDates[0])
      if (filterDept) params.set('department', filterDept)
      const [sr, ur] = await Promise.all([fetch('/api/shifts?' + params), fetch('/api/users')])
      if (sr.ok) setShifts(await sr.json())
      if (ur.ok) { const d = await ur.json(); setUsers(Array.isArray(d) ? d.filter(u => u.isActive) : []) }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [weekOffset, filterDept])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Shift added'); setShowForm(false); setForm(EMPTY_F); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    const r = await fetch('/api/shifts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success('Updated'); load() } else toast.error('Failed')
  }

  const deleteShift = async (id) => {
    if (!confirm('Remove this shift?')) return
    const r = await fetch('/api/shifts?id=' + id, { method: 'DELETE' })
    if (r.ok) { toast.success('Removed'); load() }
  }

  const shiftsForDate = (date) => shifts.filter(s => s.date === date)
  const allDepts = [...new Set(users.map(u => u.department?.name).filter(Boolean))]

  // "On duty now" — shifts with status ACTIVE or SCHEDULED for today
  const todayDs = new Date().toISOString().split('T')[0]
  const onDutyNow = shifts.filter(s => s.date === todayDs && ['ACTIVE', 'SCHEDULED'].includes(s.status))

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2); const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shift Roster</h1>
          <p className="text-sm text-gray-500 mt-0.5">Staff duty schedules and on-call assignments</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['week', 'list'].map(m => <button key={m} onClick={() => setViewMode(m)} className={'px-3 py-1 rounded-lg text-xs font-medium transition-all ' + (viewMode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>)}
          </div>
          {isAdmin && <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Shift
          </button>}
        </div>
      </div>

      {/* On duty banner */}
      {onDutyNow.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-teal-700 mb-2">Currently On Duty Today ({onDutyNow.length} staff)</p>
          <div className="flex flex-wrap gap-2">
            {onDutyNow.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 bg-white border border-teal-200 rounded-lg px-2.5 py-1.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">{s.user?.name?.charAt(0) || '?'}</div>
                <div>
                  <p className="text-xs font-medium text-gray-800">{s.user?.name}</p>
                  <p className="text-[10px] text-gray-400">{s.startTime}–{s.endTime} · <span className={'inline-block px-1 rounded text-[9px] ' + SHIFT_C[s.shiftType]}>{s.shiftType}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Week navigation */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 border border-gray-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {new Date(weekDates[0] + 'T00:00:00').toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })} – {new Date(weekDates[6] + 'T00:00:00').toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 border border-gray-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => setWeekOffset(0)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">This week</button>
          </div>

          {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading...</div> : (
            viewMode === 'week' ? (
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map(date => {
                  const dayShifts = shiftsForDate(date)
                  const isToday = date === todayDs
                  const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-ZW', { weekday: 'short' })
                  const dayNum = new Date(date + 'T00:00:00').getDate()
                  return (
                    <div key={date} className={'rounded-xl border p-2 min-h-[140px] ' + (isToday ? 'border-primary-300 bg-primary-50' : 'border-gray-100 bg-white')}>
                      <div className="text-center mb-2">
                        <p className={'text-[10px] font-semibold ' + (isToday ? 'text-primary-600' : 'text-gray-400')}>{dayName}</p>
                        <p className={'text-base font-bold ' + (isToday ? 'text-primary-700' : 'text-gray-800')}>{dayNum}</p>
                      </div>
                      <div className="space-y-1">
                        {dayShifts.map(s => (
                          <div key={s.id} className={'rounded-lg p-1.5 text-[10px] ' + SHIFT_C[s.shiftType]}>
                            <p className="font-semibold truncate">{s.user?.name}</p>
                            <p className="opacity-70">{s.startTime}–{s.endTime}</p>
                          </div>
                        ))}
                        {dayShifts.length === 0 && <p className="text-[10px] text-gray-300 text-center pt-2">—</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {weekDates.flatMap(date => shiftsForDate(date)).length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-sm">No shifts this week.</p>
                  </div>
                ) : weekDates.flatMap(date => shiftsForDate(date)).map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{s.user?.name?.charAt(0) || '?'}</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.user?.name}</p>
                        <p className="text-xs text-gray-400">{s.department} · {new Date(s.date + 'T00:00:00').toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'short' })} · {s.startTime}–{s.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={'badge text-xs ' + SHIFT_C[s.shiftType]}>{s.shiftType.replace('_', ' ')}</span>
                      <span className={'badge text-xs ' + STATUS_C[s.status]}>{s.status}</span>
                      {isAdmin && s.status === 'SCHEDULED' && (
                        <>
                          <button onClick={() => updateStatus(s.id, 'ACTIVE')} className="btn-secondary text-xs text-teal-700 border-teal-200">On duty</button>
                          <button onClick={() => updateStatus(s.id, 'ABSENT')} className="btn-secondary text-xs text-red-600 border-red-200">Absent</button>
                          <button onClick={() => deleteShift(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div>
          {showForm && isAdmin ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">Add Shift</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Staff Member *</label>
                  <select required value={form.userId} onChange={e => { const u = users.find(x => x.id === e.target.value); setForm({ ...form, userId: e.target.value, department: u?.department?.name || form.department }) }} className="input-field text-sm mt-1">
                    <option value="">Select staff...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.department?.shortName || u.role})</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Date *</label><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field text-sm mt-1" /></div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Shift Type</label>
                  <select value={form.shiftType} onChange={e => {
                    const presets = { DAY: { s: '07:00', e: '15:00' }, NIGHT: { s: '19:00', e: '07:00' }, ON_CALL: { s: '07:00', e: '07:00' } }
                    setForm({ ...form, shiftType: e.target.value, startTime: presets[e.target.value].s, endTime: presets[e.target.value].e })
                  }} className="input-field text-sm mt-1">
                    <option value="DAY">Day</option>
                    <option value="NIGHT">Night</option>
                    <option value="ON_CALL">On Call</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500 font-medium">Start</label><select value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="input-field text-sm mt-1">{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 font-medium">End</label><select value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="input-field text-sm mt-1">{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div><label className="text-xs text-gray-500 font-medium">Department *</label><input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : 'Add Shift'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">This Week</h3>
              <div className="space-y-2">
                {['DAY', 'NIGHT', 'ON_CALL'].map(t => (
                  <div key={t} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-600">{t.replace('_', ' ')}</span>
                    <span className={'badge text-xs ' + SHIFT_C[t]}>{shifts.filter(s => s.shiftType === t).length}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-1">Filter by department</p>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="input-field text-xs">
                  <option value="">All departments</option>
                  {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
