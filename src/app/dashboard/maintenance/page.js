'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [newRequest, setNewRequest] = useState({ title: '', description: '', location: '', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/maintenance')
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      toast.error('Failed to load maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })
      if (res.ok) {
        toast.success('Maintenance request created')
        setShowCreate(false)
        setNewRequest({ title: '', description: '', location: '', priority: 'MEDIUM' })
        fetchRequests()
      } else {
        toast.error('Failed to create request')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter)

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
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-2">🔧</span>
          No maintenance requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((req) => (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{req.title}</h3>
                  {req.location && <p className="text-sm text-gray-500 mt-1">📍 {req.location}</p>}
                  {req.description && <p className="text-sm text-gray-600 mt-2">{req.description}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <span className={`badge ${priorityColors[req.priority] || 'bg-gray-100 text-gray-700'}`}>{req.priority}</span>
                <span className={`badge ${statusColors[req.status] || 'bg-gray-100 text-gray-700'}`}>{req.status}</span>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>Requested by: {req.requestedBy}</span>
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Maintenance Request</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. AC not working in Ward A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Block B, Room 5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="input-field min-h-[80px]"
                  placeholder="Describe the issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
