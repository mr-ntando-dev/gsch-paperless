'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF', departmentId: '', isRosterManager: false })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('')

  const fetchAll = async () => {
    const [uRes, dRes] = await Promise.all([fetch('/api/users'), fetch('/api/departments')])
    if (uRes.ok) setUsers(await uRes.json())
    if (dRes.ok) setDepartments(await dRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editUser ? `/api/users/${editUser.id}` : '/api/users'
      const method = editUser ? 'PATCH' : 'POST'
      const body = editUser ? { ...form } : form
      if (editUser && !body.password) delete body.password

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editUser ? 'User updated' : 'User created — share credentials with them')
        setShowCreate(false)
        setEditUser(null)
        setForm({ name: '', email: '', password: '', role: 'STAFF', departmentId: '', isRosterManager: false })
        fetchAll()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
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
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const hardDeleteUser = async (user) => {
    if (!confirm(`PERMANENTLY DELETE "${user.name}"?\n\nThis will remove the user and all their activity logs forever. This CANNOT be undone.`)) return
    const res = await fetch(`/api/users/${user.id}?hard=true`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`User "${user.name}" permanently deleted`)
      fetchAll()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to delete user')
    }
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role, departmentId: user.departmentId || '', isRosterManager: user.isRosterManager || false })
    setShowCreate(true)
  }

  const toggleRosterManager = async (user) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRosterManager: !user.isRosterManager })
    })
    if (res.ok) { toast.success(`Roster Manager ${user.isRosterManager ? 'removed' : 'assigned'}`); fetchAll() }
    else toast.error('Failed to update')
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase()) ||
    u.department?.name?.toLowerCase().includes(filter.toLowerCase())
  )

  const roleBadge = (role) => {
    const m = {
      SUPERADMIN: 'bg-purple-900 text-purple-300 border border-purple-700',
      ADMIN: 'bg-red-900 text-red-300',
      MANAGER: 'bg-yellow-900 text-yellow-300',
      STAFF: 'bg-blue-900 text-blue-300',
      VIEWER: 'bg-gray-800 text-gray-400'
    }
    return m[role] || 'bg-gray-800 text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 text-sm">Create accounts and manage access. Users cannot self-register.</p>
        </div>
        <button onClick={() => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'STAFF', departmentId: '', isRosterManager: false }); setShowCreate(true) }}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
          + Create User
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by name, email or department..."
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm w-72 focus:outline-none focus:border-red-500"
        />
        <span className="text-gray-500 text-sm">{filtered.length} users</span>
      </div>

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-4">{editUser ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Full Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Password {editUser && '(leave blank to keep current)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  required={!editUser}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
                  <option value="STAFF">Staff</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  {isSuperAdmin && <option value="SUPERADMIN">Super Admin</option>}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Department</label>
                <select required value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="rosterMgr" checked={form.isRosterManager} onChange={e => setForm({...form, isRosterManager: e.target.checked})} className="w-4 h-4 accent-red-500" />
                <label htmlFor="rosterMgr" className="text-gray-300 text-sm cursor-pointer">
                  Roster Manager — can create duty rosters for their department
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : (editUser ? 'Update User' : 'Create & Give Credentials')}
                </button>
                <button type="button" onClick={() => { setShowCreate(false); setEditUser(null) }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Department</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Roster Mgr</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{user.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadge(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleRosterManager(user)} className={`text-xs px-2 py-0.5 rounded ${user.isRosterManager ? 'bg-teal-900 text-teal-300' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}>
                        {user.isRosterManager ? '✓ Enabled' : 'Grant'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => openEdit(user)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                        <button onClick={() => toggleActive(user)} className={`text-xs ${user.isActive ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}`}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {isSuperAdmin && user.id !== session?.user?.id && (
                          <button onClick={() => hardDeleteUser(user)} className="text-red-500 hover:text-red-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-red-950 hover:bg-red-900 transition-colors">
                            ⚠ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
