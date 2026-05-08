'use client'
import { useState, useEffect } from 'react'

export default function AdminMonitorPage() {
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [resource, setResource] = useState('users')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ resource })
    if (selectedDept) params.set('deptId', selectedDept)
    fetch(`/api/admin/monitor?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [resource, selectedDept])

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'documents', label: 'Documents' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'messages', label: 'Messages' },
    { key: 'forms', label: 'Forms' },
  ]

  const priorityColor = { LOW: 'text-gray-400', MEDIUM: 'text-blue-400', HIGH: 'text-yellow-400', URGENT: 'text-red-400' }
  const statusColor = { TODO: 'bg-gray-800 text-gray-400', IN_PROGRESS: 'bg-blue-900/50 text-blue-400', DONE: 'bg-green-900/50 text-green-400', SUBMITTED: 'bg-teal-900/50 text-teal-400' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Monitor</h2>
        <p className="text-gray-400 text-sm">View everything happening across the system. Invisible to other users.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <div className="flex bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setResource(tab.key)}
              className={`px-4 py-2 text-sm transition-colors ${resource === tab.key ? 'bg-red-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {resource === 'users' && (
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Department</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Role</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Joined</th>
              </tr></thead>
              <tbody>
                {(data.users || []).map(u => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white text-sm">{u.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{u.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{u.role}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {resource === 'documents' && (
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Department</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Author</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Date</th>
              </tr></thead>
              <tbody>
                {(data.documents || []).map(doc => (
                  <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white text-sm">{doc.title}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{doc.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{doc.author?.name}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{doc.status}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${priorityColor[doc.priority] || 'text-gray-400'}`}>{doc.priority}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {resource === 'tasks' && (
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Department</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Assignee</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Due</th>
              </tr></thead>
              <tbody>
                {(data.tasks || []).map(t => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white text-sm">{t.title}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{t.department?.name || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColor[t.status] || 'bg-gray-800 text-gray-400'}`}>{t.status}</span></td>
                    <td className={`px-4 py-3 text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.assignee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {resource === 'messages' && (
            <div className="divide-y divide-gray-800">
              {(data.messages || []).length === 0 ? (
                <p className="p-6 text-gray-500 text-sm">No messages.</p>
              ) : (data.messages || []).map(msg => (
                <div key={msg.id} className="px-5 py-3 hover:bg-gray-800/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{msg.sender?.name}</span>
                      <span className="text-gray-600 text-xs">→ {msg.department?.name || 'General'} / #{msg.channel}</span>
                    </div>
                    <span className="text-gray-600 text-xs">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {resource === 'forms' && (
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Department</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Submissions</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Created</th>
              </tr></thead>
              <tbody>
                {(data.forms || []).map(f => (
                  <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white text-sm">{f.title}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{f.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{f._count?.submissions || 0}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${f.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(f.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!data[resource] || data[resource].length === 0 ? (
            <p className="p-6 text-gray-500 text-sm text-center">No {resource} found{selectedDept ? ' for this department' : ''}.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
