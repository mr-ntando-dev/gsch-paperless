'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF', departmentId: '' })
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  const fetchAll = async () => {
    try {
      const [uRes, dRes] = await Promise.all([fetch('/api/users'), fetch('/api/departments')])
      if (uRes.ok) setUsers(await uRes.json())
      if (dRes.ok) setDepartments(await dRes.json())
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      if (res.ok) {
        toast.success(`User created! Share credentials: ${newUser.email} / ${newUser.password}`)
        setShowCreate(false)
        setNewUser({ name: '', email: '', password: '', role: 'STAFF', departmentId: '' })
        fetchAll()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create user')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (user) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive })
    })
    if (res.ok) { toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`); fetchAll() }
  }

  const activeUsers = users.filter(u => u.isActive)
  const inactiveUsers = users.filter(u => !u.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create accounts and manage access. Users do not self-register.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span><span>Create User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold text-gray-800">{users.length}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-green-600">{activeUsers.length}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Departments</p><p className="text-2xl font-bold text-primary-600">{new Set(users.map(u => u.departmentId)).size}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Admins</p><p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'ADMIN').length}</p></div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Create New User</h3>
            <p className="text-xs text-gray-500 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              You will need to share the email and password with the new user directly.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password (share this with the user)</label>
                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="input-field" placeholder="Set a temporary password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="input-field">
                  <option value="STAFF">Staff</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <select required value={newUser.departmentId} onChange={e => setNewUser({...newUser, departmentId: e.target.value})} className="input-field">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users yet. Create the first one above.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(user)} className={`text-xs ${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
