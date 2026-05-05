'use client'
import { useState, useMemo } from 'react'

const statusColors = {
  WAITING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
}

export default function BabyClinicPage() {
  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    babyName: '',
    dob: '',
    parentName: '',
    parentPhone: '',
    visitType: 'IMMUNIZATION',
    weight: '',
    notes: '',
    status: 'WAITING',
  })

  // Check if today is Wednesday (3) or Saturday (6)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const newEntry = {
      id: Date.now().toString(),
      ...formData,
      date: today.toLocaleDateString('en-ZW'),
      time: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
    }
    setAppointments([newEntry, ...appointments])
    setFormData({
      babyName: '',
      dob: '',
      parentName: '',
      parentPhone: '',
      visitType: 'IMMUNIZATION',
      weight: '',
      notes: '',
      status: 'WAITING',
    })
    setShowForm(false)
  }

  const updateStatus = (id, status) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Baby Clinic</h1>
          <p className="text-sm text-gray-500 mt-1">
            Immunizations, growth monitoring, and well-baby visits — Wednesdays &amp; Saturdays only
          </p>
        </div>
        {isClinicDay && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>+</span>
            <span>Register Visit</span>
          </button>
        )}
      </div>

      {/* Clinic Day Notice */}
      {!isClinicDay && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Baby Clinic is not available today</p>
              <p className="text-sm text-amber-700 mt-1">
                Clinic operates on <strong>Wednesdays</strong> and <strong>Saturdays</strong> only. Next session: <strong>{nextClinicDay}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {isClinicDay && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Registered</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Waiting</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {appointments.filter(a => a.status === 'WAITING').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {appointments.filter(a => a.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {showForm && isClinicDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Register Baby Clinic Visit</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baby&apos;s Name</label>
              <input
                type="text"
                value={formData.babyName}
                onChange={(e) => setFormData({ ...formData, babyName: e.target.value })}
                className="input-field"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="input-field"
                placeholder="Parent or guardian name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="input-field"
                placeholder="+263..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
              <select
                value={formData.visitType}
                onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                className="input-field"
              >
                <option value="IMMUNIZATION">Immunization</option>
                <option value="GROWTH_MONITORING">Growth Monitoring</option>
                <option value="WELL_BABY">Well-Baby Check</option>
                <option value="FOLLOW_UP">Follow-Up</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="e.g. 4.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Observations, concerns, vaccine administered, etc."
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button type="submit" className="btn-primary">Register</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments Table */}
      {appointments.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Baby</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DOB</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Visit Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{apt.babyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.dob}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{apt.parentName}</div>
                      <div className="text-xs text-gray-400">{apt.parentPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.visitType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.weight ? `${apt.weight} kg` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                        {apt.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="WAITING">Waiting</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          {isClinicDay ? (
            <>
              <p className="font-medium">No visits registered yet today.</p>
              <p className="text-sm mt-1">Use the &quot;Register Visit&quot; button to begin.</p>
            </>
          ) : (
            <>
              <p className="font-medium">Clinic is closed today.</p>
              <p className="text-sm mt-1">Next session: {nextClinicDay}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
