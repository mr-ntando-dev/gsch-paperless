'use client'
import { useState, useEffect } from 'react'

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/monitor?resource=tasks')
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setLoading(false) })
  }, [])

  const statusColor = { TODO:'bg-gray-800 text-gray-400', IN_PROGRESS:'bg-blue-900/50 text-blue-400', DONE:'bg-green-900/50 text-green-400', BLOCKED:'bg-red-900/50 text-red-400' }
  const priorityColor = { LOW:'text-gray-400', MEDIUM:'text-blue-400', HIGH:'text-yellow-400', URGENT:'text-red-400' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">All Tasks</h2>
        <p className="text-gray-400 text-sm">Every task across all departments.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Title</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Dept</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Priority</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Assignee</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Creator</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Due</th>
            </tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white text-sm">{t.title}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{t.department?.name || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColor[t.status] || 'bg-gray-800 text-gray-400'}`}>{t.status}</span></td>
                  <td className={`px-4 py-3 text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{t.assignee?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{t.creator?.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
