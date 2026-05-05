'use client'
import { useState } from 'react'

const mockRequests = [
  { id: 1, title: 'AC not working - Ward A', location: 'Ward A, Room 3', priority: 'HIGH', status: 'IN_PROGRESS', requestedBy: 'Nurse Moyo', assignedTo: 'J. Mupfumira', date: '2024-03-14' },
  { id: 2, title: 'Leaking pipe in bathroom', location: 'Block B, Ground Floor', priority: 'URGENT', status: 'OPEN', requestedBy: 'Dr. Chirwa', assignedTo: null, date: '2024-03-15' },
  { id: 3, title: 'Broken window - Reception', location: 'Main Building, Reception', priority: 'MEDIUM', status: 'COMPLETED', requestedBy: 'L. Ncube', assignedTo: 'T. Banda', date: '2024-03-10' },
  { id: 4, title: 'Light replacement needed', location: 'Corridor, Block C', priority: 'LOW', status: 'OPEN', requestedBy: 'S. Ndlovu', assignedTo: null, date: '2024-03-15' },
  { id: 5, title: 'Generator maintenance due', location: 'Generator House', priority: 'HIGH', status: 'SCHEDULED', requestedBy: 'Admin', assignedTo: 'Maintenance Team', date: '2024-03-16' },
  { id: 6, title: 'Fire extinguisher inspection', location: 'All Blocks', priority: 'HIGH', status: 'IN_PROGRESS', requestedBy: 'Safety Officer', assignedTo: 'P. Mhlanga', date: '2024-03-13' },
]

export default function MaintenancePage() {
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? mockRequests : mockRequests.filter(r => r.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Safety & Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Track maintenance requests, safety audits, and facility management</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Request</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Open Requests</p>
          <p className="text-2xl font-bold text-orange-600">{mockRequests.filter(r => r.status === 'OPEN').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{mockRequests.filter(r => r.status === 'IN_PROGRESS').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Completed This Month</p>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-gray-800">2.3 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className={`card border-l-4 ${
            req.priority === 'URGENT' ? 'border-l-red-500' :
            req.priority === 'HIGH' ? 'border-l-orange-400' :
            req.priority === 'MEDIUM' ? 'border-l-yellow-400' :
            'border-l-blue-400'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{req.title}</h3>
                <p className="text-sm text-gray-500 mt-1">📍 {req.location}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">Requested by: {req.requestedBy}</span>
                  {req.assignedTo && <span className="text-xs text-primary-600">Assigned: {req.assignedTo}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`badge ${
                  req.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                  req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>{req.status.replace('_', ' ')}</span>
                <span className={`badge ${
                  req.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                  req.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{req.priority}</span>
                <span className="text-xs text-gray-400">{req.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Request Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">New Maintenance Request</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="input-field" placeholder="Brief description of the issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" className="input-field" placeholder="e.g., Ward A, Room 3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input-field">
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Structural</option>
                    <option>Safety</option>
                    <option>General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field h-24" placeholder="Detailed description of the issue..."></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Submit Request</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
