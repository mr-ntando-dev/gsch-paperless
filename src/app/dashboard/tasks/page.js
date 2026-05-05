'use client'
import { useState } from 'react'

const mockTasks = [
  { id: 1, title: 'Complete monthly safety audit', department: 'SAFETY_MAINTENANCE', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'P. Mhlanga', dueDate: '2024-03-20' },
  { id: 2, title: 'Update patient records system', department: 'IT', status: 'TODO', priority: 'MEDIUM', assignee: 'K. Zimba', dueDate: '2024-03-22' },
  { id: 3, title: 'Prepare Q1 financial report', department: 'ACCOUNTS', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'T. Chirwa', dueDate: '2024-03-18' },
  { id: 4, title: 'Review meal plans for April', department: 'KITCHEN', status: 'TODO', priority: 'MEDIUM', assignee: 'S. Ndlovu', dueDate: '2024-03-25' },
  { id: 5, title: 'Process outstanding invoices', department: 'BILLING', status: 'TODO', priority: 'URGENT', assignee: 'M. Chikwanha', dueDate: '2024-03-16' },
  { id: 6, title: 'Organize community health fair', department: 'HOSPITAL_RELATIONS', status: 'IN_PROGRESS', priority: 'MEDIUM', assignee: 'D. Sibanda', dueDate: '2024-03-30' },
  { id: 7, title: 'Update visitor management policy', department: 'CRD', status: 'DONE', priority: 'LOW', assignee: 'L. Ncube', dueDate: '2024-03-14' },
  { id: 8, title: 'Board meeting preparation', department: 'MANAGEMENT', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Admin', dueDate: '2024-03-19' },
]

const statusColumns = ['TODO', 'IN_PROGRESS', 'DONE']

const priorityColors = {
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-400',
  URGENT: 'border-l-red-500',
}

export default function TasksPage() {
  const [view, setView] = useState('board')
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage department tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === 'board' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
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

      {/* Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm uppercase">
                  {status.replace('_', ' ')}
                </h3>
                <span className="badge bg-gray-100 text-gray-600">
                  {mockTasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {mockTasks.filter(t => t.status === status).map((task) => (
                  <div key={task.id} className={`card border-l-4 ${priorityColors[task.priority]} cursor-pointer hover:shadow-md transition-shadow`}>
                    <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{task.department.replace('_', ' ')}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">Due: {task.dueDate}</span>
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700">{task.assignee.charAt(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.department.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.assignee}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${task.priority === 'URGENT' ? 'bg-red-100 text-red-700' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Task</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="input-field" placeholder="Task title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="input-field">
                    <option>Patient Care</option>
                    <option>Billing</option>
                    <option>Accounts</option>
                    <option>Kitchen</option>
                    <option>Safety & Maintenance</option>
                    <option>IT</option>
                    <option>Management</option>
                    <option>Hospital Relations</option>
                    <option>CRD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <input type="text" className="input-field" placeholder="Staff member name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field h-24" placeholder="Task description..."></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Create Task</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
