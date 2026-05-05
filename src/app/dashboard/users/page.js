'use client'
import { useState } from 'react'
import { departments } from '@/lib/departments'

const mockUsers = [
  { id: 1, name: 'System Admin', email: 'admin@gsch.co.zw', role: 'ADMIN', department: 'MANAGEMENT', status: 'Active' },
  { id: 2, name: 'Dr. T. Moyo', email: 'dr.moyo@gsch.co.zw', role: 'MANAGER', department: 'PATIENT_CARE', status: 'Active' },
  { id: 3, name: 'T. Chirwa', email: 't.chirwa@gsch.co.zw', role: 'STAFF', department: 'ACCOUNTS', status: 'Active' },
  { id: 4, name: 'S. Ndlovu', email: 's.ndlovu@gsch.co.zw', role: 'STAFF', department: 'KITCHEN', status: 'Active' },
  { id: 5, name: 'K. Zimba', email: 'k.zimba@gsch.co.zw', role: 'MANAGER', department: 'IT', status: 'Active' },
  { id: 6, name: 'P. Mhlanga', email: 'p.mhlanga@gsch.co.zw', role: 'STAFF', department: 'SAFETY_MAINTENANCE', status: 'Active' },
  { id: 7, name: 'L. Ncube', email: 'l.ncube@gsch.co.zw', role: 'STAFF', department: 'CRD', status: 'Active' },
  { id: 8, name: 'D. Sibanda', email: 'd.sibanda@gsch.co.zw', role: 'STAFF', department: 'HOSPITAL_RELATIONS', status: 'Active' },
  { id: 9, name: 'M. Chikwanha', email: 'm.chikwanha@gsch.co.zw', role: 'STAFF', department: 'BILLING', status: 'Active' },
  { id: 10, name: 'R. Gumbo', email: 'r.gumbo@gsch.co.zw', role: 'VIEWER', department: 'MANAGEMENT', status: 'Inactive' },
]

export default function UsersPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and access permissions</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{mockUsers.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{mockUsers.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="text-2xl font-bold text-primary-600">9</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-gray-800">{mockUsers.filter(u => u.role === 'ADMIN').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">{user.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{departments[user.department]?.shortName}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                  <button className="text-red-500 hover:text-red-700 text-sm">Disable</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New User</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="input-field" placeholder="Staff full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" placeholder="name@gsch.co.zw" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="input-field">
                    <option>Staff</option>
                    <option>Manager</option>
                    <option>Admin</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="input-field">
                    {Object.entries(departments).map(([key, dept]) => (
                      <option key={key} value={key}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input type="password" className="input-field" placeholder="Initial password" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Create User</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
