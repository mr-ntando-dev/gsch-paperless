'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function FormsPage() {
  const [forms, setForms] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', description: '', departmentId: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchForms = async () => {
    try {
      const [fRes, dRes] = await Promise.all([fetch('/api/forms'), fetch('/api/departments')])
      if (fRes.ok) setForms(await fRes.json())
      if (dRes.ok) setDepartments(await dRes.json())
    } catch (error) {
      toast.error('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchForms() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newForm, fields: [] }),
      })
      if (res.ok) {
        toast.success('Form created successfully')
        setShowBuilder(false)
        setNewForm({ title: '', description: '', departmentId: '' })
        fetchForms()
      } else {
        toast.error('Failed to create form')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Digital Forms</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage digital forms for all departments</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span><span>Create Form</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading forms...</div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No forms created yet. Create your first digital form.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{form.title}</h3>
                  {form.description && <p className="text-sm text-gray-500 mt-1">{form.description}</p>}
                </div>
                <span className="badge bg-green-100 text-green-700">Active</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{form.department?.name || '—'}</span>
                <span>{form._count?.submissions || 0} submissions</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Form</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input type="text" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="input-field" placeholder="e.g. Patient Admission Form" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="input-field min-h-[80px]" placeholder="Brief description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={newForm.departmentId} onChange={(e) => setNewForm({ ...newForm, departmentId: e.target.value })}
                  className="input-field" required>
                  <option value="">Select department</option>
                  {departments.filter(d => d.isActive).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowBuilder(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
