'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const SHIFT_COLORS = {
  DAY: 'bg-amber-100 text-amber-800 border-amber-200',
  NIGHT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ON_CALL: 'bg-purple-100 text-purple-800 border-purple-200',
  OFF: 'bg-gray-100 text-gray-500 border-gray-200',
  LEAVE: 'bg-rose-100 text-rose-700 border-rose-200'
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(weekStart) {
  const d = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d); nd.setDate(d.getDate() + i)
    return nd.toISOString().split('T')[0]
  })
}

function getMondayOfWeek(offset = 0) {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff + offset * 7)
  return d.toISOString().split('T')[0]
}

const EMPTY_ROSTER = { title: '', departmentId: '', weekStart: '', weekEnd: '' }

export default function DutyRosterPage() {
  const { data: session } = useSession()
  const [rosters, setRosters] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedRoster, setSelectedRoster] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_ROSTER)
  const [saving, setSaving] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [entryForm, setEntryForm] = useState({ userId: '', date: '', shiftType: 'DAY', startTime: '', endTime: '', notes: '' })
  const [filterDept, setFilterDept] = useState('')

  const role = session?.user?.role
  const isAdmin = ['SUPERADMIN', 'ADMIN'].includes(role)
  const userDeptId = session?.user?.departmentId

  // isRosterManager is stored in DB; fetch from /api/me
  const [isRosterManager, setIsRosterManager] = useState(false)
  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.isRosterManager) setIsRosterManager(true) })
  }, [])

  const canManage = isAdmin || isRosterManager

  const mondayDate = getMondayOfWeek(weekOffset)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterDept) params.set('departmentId', filterDept)
      const [rr, dr, ur] = await Promise.all([
        fetch('/api/duty-roster?' + params),
        fetch('/api/departments'),
        fetch('/api/users')
      ])
      if (rr.ok) setRosters(await rr.json())
      if (dr.ok) setDepartments(await dr.json())
      if (ur.ok) { const d = await ur.json(); setUsers(Array.isArray(d) ? d.filter(u => u.isActive) : []) }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterDept])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    // Calculate weekEnd from weekStart
    const start = new Date(form.weekStart)
    const end = new Date(start); end.setDate(start.getDate() + 6)
    const weekEnd = end.toISOString().split('T')[0]
    try {
      const r = await fetch('/api/duty-roster', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, weekEnd })
      })
      if (r.ok) { toast.success('Roster created'); setShowCreate(false); setForm(EMPTY_ROSTER); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!selectedRoster) return
    setSaving(true)
    try {
      const r = await fetch('/api/duty-roster/entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rosterId: selectedRoster.id, ...entryForm })
      })
      if (r.ok) {
        toast.success('Entry added')
        setShowEntryForm(false)
        setEntryForm({ userId: '', date: '', shiftType: 'DAY', startTime: '', endTime: '', notes: '' })
        load()
      } else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Remove this entry?')) return
    const r = await fetch('/api/duty-roster/entries?id=' + id, { method: 'DELETE' })
    if (r.ok) { toast.success('Removed'); load() } else toast.error('Failed')
  }

  const publishRoster = async (id, status) => {
    const r = await fetch('/api/duty-roster', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success(status === 'PUBLISHED' ? 'Roster published' : 'Archived'); load() } else toast.error('Failed')
  }

  const activeRosters = rosters.filter(r => r.status !== 'ARCHIVED')
  const displayRosters = isRosterManager && !isAdmin
    ? activeRosters.filter(r => r.departmentId === userDeptId)
    : activeRosters

  // Users for current selected roster's dept
  const rosterUsers = selectedRoster
    ? users.filter(u => u.departmentId === selectedRoster.departmentId)
    : []

  const weekDates = selectedRoster ? getWeekDates(selectedRoster.weekStart) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Duty Rosters</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly duty schedules per department</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              New Roster
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading rosters...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roster list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rosters</h2>
            {displayRosters.length === 0 && <p className="text-gray-400 text-sm">No rosters yet.</p>}
            {displayRosters.map(roster => (
              <div key={roster.id} onClick={() => setSelectedRoster(roster)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRoster?.id === roster.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{roster.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{roster.department?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{roster.weekStart} → {roster.weekEnd}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roster.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : roster.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'}`}>
                    {roster.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{roster.entries?.length || 0} entries · by {roster.createdBy?.name}</p>
              </div>
            ))}
          </div>

          {/* Roster detail */}
          <div className="lg:col-span-2">
            {!selectedRoster ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                <p className="text-sm">Select a roster to view its schedule</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedRoster.title}</h3>
                    <p className="text-xs text-gray-500">{selectedRoster.department?.name} · {selectedRoster.weekStart} to {selectedRoster.weekEnd}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {canManage && selectedRoster.status === 'DRAFT' && (
                      <button onClick={() => publishRoster(selectedRoster.id, 'PUBLISHED')} className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">Publish</button>
                    )}
                    {isAdmin && selectedRoster.status === 'PUBLISHED' && (
                      <button onClick={() => publishRoster(selectedRoster.id, 'ARCHIVED')} className="text-xs px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">Archive</button>
                    )}
                    {canManage && (
                      <button onClick={() => { setEntryForm({ userId: '', date: weekDates[0] || '', shiftType: 'DAY', startTime: '07:00', endTime: '15:00', notes: '' }); setShowEntryForm(true) }}
                        className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600">+ Add Entry</button>
                    )}
                  </div>
                </div>

                {/* Weekly Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 font-semibold text-gray-600 w-36">Staff Member</th>
                        {weekDates.map((date, i) => (
                          <th key={date} className="text-center px-2 py-2 font-semibold text-gray-600 min-w-[90px]">
                            <div>{DAYS[i]}</div>
                            <div className="font-normal text-gray-400">{date.slice(5)}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rosterUsers.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-6 text-gray-400">No staff in this department</td></tr>
                      )}
                      {rosterUsers.map(user => {
                        const userEntries = selectedRoster.entries?.filter(e => e.userId === user.id) || []
                        return (
                          <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-700">{user.name}</td>
                            {weekDates.map(date => {
                              const entry = userEntries.find(e => e.date === date)
                              return (
                                <td key={date} className="px-1 py-1 text-center">
                                  {entry ? (
                                    <div className="group relative">
                                      <span className={`inline-block px-2 py-1 rounded-md border text-xs font-medium ${SHIFT_COLORS[entry.shiftType] || 'bg-gray-100 text-gray-600'}`}>
                                        {entry.shiftType === 'ON_CALL' ? 'On-Call' : entry.shiftType}
                                      </span>
                                      {canManage && (
                                        <button onClick={() => deleteEntry(entry.id)} className="absolute -top-1 -right-1 hidden group-hover:block w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none">×</button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-200">—</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="px-4 py-3 border-t border-gray-100 flex gap-3 flex-wrap">
                  {Object.entries(SHIFT_COLORS).map(([k, v]) => (
                    <span key={k} className={`text-xs px-2 py-0.5 rounded border font-medium ${v}`}>{k === 'ON_CALL' ? 'On-Call' : k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Roster Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Roster</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roster Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Nursing Week 20" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                  <option value="">Select department</option>
                  {(isRosterManager && !isAdmin ? departments.filter(d => d.id === userDeptId) : departments).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Starting (Monday)</label>
                <input type="date" value={form.weekStart} onChange={e => setForm(f => ({ ...f, weekStart: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showEntryForm && selectedRoster && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Roster Entry</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                <select value={entryForm.userId} onChange={e => setEntryForm(f => ({ ...f, userId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                  <option value="">Select staff</option>
                  {rosterUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select value={entryForm.date} onChange={e => setEntryForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                  {weekDates.map((d, i) => <option key={d} value={d}>{DAYS[i]} {d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select value={entryForm.shiftType} onChange={e => setEntryForm(f => ({ ...f, shiftType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="DAY">Day Shift</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="ON_CALL">On Call</option>
                  <option value="OFF">Day Off</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              {!['OFF', 'LEAVE'].includes(entryForm.shiftType) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input type="time" value={entryForm.startTime} onChange={e => setEntryForm(f => ({ ...f, startTime: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input type="time" value={entryForm.endTime} onChange={e => setEntryForm(f => ({ ...f, endTime: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Any additional notes" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEntryForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                  {saving ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
