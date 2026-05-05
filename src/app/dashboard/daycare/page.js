'use client'
import { useState } from 'react'

const statusColors = {
  CHECKED_IN: 'bg-green-100 text-green-800',
  CHECKED_OUT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
}

export default function DayCarePage() {
  const [children, setChildren] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    parentName: '',
    parentPhone: '',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
    status: 'CHECKED_IN',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newEntry = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toLocaleDateString('en-ZW'),
    }
    setChildren([newEntry, ...children])
    setFormData({
      childName: '',
      age: '',
      parentName: '',
      parentPhone: '',
      checkInTime: '',
      checkOutTime: '',
      notes: '',
      status: 'CHECKED_IN',
    })
    setShowForm(false)
  }

  const handleCheckOut = (id) => {
    setChildren(children.map(child =>
      child.id === id
        ? { ...child, status: 'CHECKED_OUT', checkOutTime: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }) }
        : child
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Day Care</h1>
          <p className="text-sm text-gray-500 mt-1">Manage day care check-ins and scheduling</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>+</span>
          <span>Check In Child</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {children.filter(c => c.status === 'CHECKED_IN').length}
              </p>
              <p className="text-xs text-gray-500">Currently Checked In</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {children.filter(c => c.status === 'SCHEDULED').length}
              </p>
              <p className="text-xs text-gray-500">Scheduled Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {children.filter(c => c.status === 'CHECKED_OUT').length}
              </p>
              <p className="text-xs text-gray-500">Checked Out Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Check In a Child</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child&apos;s Name</label>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                className="input-field"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                placeholder="e.g. 3 years"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Pick-up Time</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Allergies, special needs, medication, etc."
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button type="submit" className="btn-primary">
                Check In
              </button>
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

      {/* Children List */}
      {children.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Child</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent/Guardian</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {children.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{child.childName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{child.age}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{child.parentName}</div>
                      <div className="text-xs text-gray-400">{child.parentPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{child.checkInTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{child.checkOutTime || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[child.status]}`}>
                        {child.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {child.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(child.id)}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-2">🧒</span>
          <p>No day care records for today.</p>
          <p className="text-sm mt-1">Check in children using the button above.</p>
        </div>
      )}
    </div>
  )
}
