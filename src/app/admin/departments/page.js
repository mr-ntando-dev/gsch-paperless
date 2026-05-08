'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const colorOptions = ['blue','teal','green','yellow','orange','red','purple','gray','pink','indigo']
const colorPreview = {
  blue:'bg-blue-500', teal:'bg-teal-500', green:'bg-green-500', yellow:'bg-yellow-500',
  orange:'bg-orange-500', red:'bg-red-500', purple:'bg-purple-500', gray:'bg-gray-500',
  pink:'bg-pink-500', indigo:'bg-indigo-500'
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editDept, setEditDept] = useState(null)
  const [form, setForm] = useState({ code: '', name: '', shortName: '', color: 'blue', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchDepts = () => {
    fetch('/api/departments').then(r => r.json()).then(d => { setDepartments(d); setLoading(false) })
  }
  useEffect(() => { fetchDepts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editDept ? `/api/departments/${editDept.id}` : '/api/departments'
      const method = editDept ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        toast.success(editDept ? 'Department updated' : 'Department created')
        setShowCreate(false); setEditDept(null)
        setForm({ code: '', name: '', shortName: '', color: 'blue', description: '' })
        fetchDepts()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (dept) => {
    const res = await fetch(`/api/departments/${dept.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !dept.isActive })
    })
    if (res.ok) { toast.success(dept.isActive ? 'Department deactivated' : 'Department activated'); fetchDepts() }
  }

  const openEdit = (dept) => {
    setEditDept(dept)
    setForm({ code: dept.code, name: dept.name, shortName: dept.shortName, color: dept.color, description: dept.description || '' })
    setShowCreate(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Department Management</h2>
          <p className="text-gray-400 text-sm">Create and manage hospital departments. Users belong to departments.</p>
        </div>
        <button onClick={() => { setEditDept(null); setForm({ code: '', name: '', shortName: '', color: 'blue', description: '' }); setShowCreate(true) }}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
          + New Department
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-4">{editDept ? 'Edit Department' : 'New Department'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Code (e.g. HR, PHARMACY)</label>
                <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  disabled={!!editDept}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Full Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Short Name</label>
                <input required value={form.shortName} onChange={e => setForm({...form, shortName: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className={`w-7 h-7 rounded-full ${colorPreview[c]} transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-60 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 resize-none" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Saving...' : (editDept ? 'Update' : 'Create Department')}
                </button>
                <button type="button" onClick={() => { setShowCreate(false); setEditDept(null) }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-gray-400 py-8">Loading departments...</div>
        ) : departments.map(dept => (
          <div key={dept.id} className={`bg-gray-900 border rounded-xl p-5 ${dept.isActive ? 'border-gray-800' : 'border-gray-800/30 opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${colorPreview[dept.color] || 'bg-gray-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{dept.shortName.substring(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{dept.name}</p>
                  <p className="text-gray-500 text-xs font-mono">{dept.code}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${dept.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {dept.description && <p className="text-gray-500 text-xs mb-3">{dept.description}</p>}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{dept._count?.users || 0} users</span>
              <span>{dept._count?.documents || 0} docs</span>
              <span>{dept._count?.tasks || 0} tasks</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => openEdit(dept)} className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">Edit</button>
              <button onClick={() => toggleActive(dept)} className={`flex-1 py-1.5 rounded text-xs transition-colors ${dept.isActive ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'}`}>
                {dept.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
