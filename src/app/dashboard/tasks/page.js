'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const statusColumns = ['TODO', 'IN_PROGRESS', 'DONE']

const priorityColors = {
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-400',
  URGENT: 'border-l-red-500',
}

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export default function TasksPage() {
  const [view, setView] = useState('board')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })
      if (res.ok) {
        toast.success('Task created successfully')
        setShowCreate(false)
        setNewTask({ title: '', description: '', priority: 'MEDIUM' })
        fetchTasks()
      } else {
        toast.error('Failed to create task')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage work across departments</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'board' ? 'bg-white shadow text-primary-700' : 'text-gray-600'}`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'list' ? 'bg-white shadow text-primary-700' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          
          No tasks yet. Create your first task to get started.
        </div>
      ) : view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{statusLabels[status]}</h3>
                <span className="badge bg-gray-100 text-gray-600">{getTasksByStatus(status).length}</span>
              </div>
              <div className="space-y-2">
                {getTasksByStatus(status).map((task) => (
                  <div key={task.id} className={`card border-l-4 ${priorityColors[task.priority]}`}>
                    <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                    {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{task.assignee?.name || 'Unassigned'}</span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
                {getTasksByStatus(status).length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-gray-100 text-gray-700">{statusLabels[task.status] || task.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${task.priority === 'URGENT' ? 'bg-red-100 text-red-700' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.assignee?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                  placeholder="Task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field min-h-[80px]"
                  placeholder="Task description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
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
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
