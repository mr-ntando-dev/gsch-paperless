'use client'
import { useState } from 'react'

const mockForms = [
  { id: 1, title: 'Patient Admission Form', department: 'PATIENT_CARE', submissions: 156, status: 'Active', lastSubmission: '2 hours ago' },
  { id: 2, title: 'Visitor Registration Form', department: 'CRD', submissions: 89, status: 'Active', lastSubmission: '30 min ago' },
  { id: 3, title: 'Maintenance Request Form', department: 'SAFETY_MAINTENANCE', submissions: 34, status: 'Active', lastSubmission: '1 day ago' },
  { id: 4, title: 'Kitchen Hygiene Checklist', department: 'KITCHEN', submissions: 45, status: 'Active', lastSubmission: '6 hours ago' },
  { id: 5, title: 'IT Support Ticket', department: 'IT', submissions: 67, status: 'Active', lastSubmission: '3 hours ago' },
  { id: 6, title: 'Leave Application Form', department: 'MANAGEMENT', submissions: 23, status: 'Active', lastSubmission: '2 days ago' },
  { id: 7, title: 'Patient Feedback Form', department: 'CRD', submissions: 112, status: 'Active', lastSubmission: '1 hour ago' },
  { id: 8, title: 'Expense Claim Form', department: 'ACCOUNTS', submissions: 18, status: 'Active', lastSubmission: '4 hours ago' },
  { id: 9, title: 'Incident Report Form', department: 'SAFETY_MAINTENANCE', submissions: 8, status: 'Active', lastSubmission: '3 days ago' },
  { id: 10, title: 'Referral Form', department: 'HOSPITAL_RELATIONS', submissions: 41, status: 'Active', lastSubmission: '5 hours ago' },
]

export default function FormsPage() {
  const [showBuilder, setShowBuilder] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Digital Forms</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage paperless forms for all departments</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Create Form</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Forms</p>
          <p className="text-2xl font-bold text-gray-800">{mockForms.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-800">{mockForms.reduce((acc, f) => acc + f.submissions, 0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Active Forms</p>
          <p className="text-2xl font-bold text-green-600">{mockForms.filter(f => f.status === 'Active').length}</p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockForms.map((form) => (
          <div key={form.id} className="card hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                  {form.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{form.department.replace('_', ' ')}</p>
              </div>
              <span className="badge bg-green-100 text-green-700">{form.status}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-800">{form.submissions}</p>
                <p className="text-xs text-gray-500">submissions</p>
              </div>
              <p className="text-xs text-gray-400">Last: {form.lastSubmission}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Form Builder</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input type="text" className="input-field" placeholder="e.g., Patient Feedback Form" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="input-field">
                  <option>Client Relations (CRD)</option>
                  <option>Patient Care</option>
                  <option>Billing</option>
                  <option>Accounts</option>
                  <option>Kitchen</option>
                  <option>Safety & Maintenance</option>
                  <option>IT</option>
                  <option>Management</option>
                  <option>Hospital Relations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field h-20" placeholder="Form description..."></textarea>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Form Fields</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-xs text-gray-500">Text field - Required</p>
                    </div>
                    <button type="button" className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-xs text-gray-500">Date field - Required</p>
                    </div>
                    <button type="button" className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                </div>
                <button type="button" className="mt-3 text-primary-600 hover:text-primary-800 text-sm font-medium">
                  + Add Field
                </button>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" className="btn-primary flex-1">Create Form</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowBuilder(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
