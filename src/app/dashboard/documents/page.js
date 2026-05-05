'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const mockDocuments = [
  { id: 1, title: 'Patient Discharge Summary - Ward A', department: 'PATIENT_CARE', status: 'APPROVED', author: 'Dr. Moyo', date: '2024-03-15', priority: 'HIGH' },
  { id: 2, title: 'Monthly Budget Report - March 2024', department: 'ACCOUNTS', status: 'PENDING', author: 'T. Chirwa', date: '2024-03-14', priority: 'MEDIUM' },
  { id: 3, title: 'Kitchen Hygiene Audit Report', department: 'KITCHEN', status: 'APPROVED', author: 'S. Ndlovu', date: '2024-03-13', priority: 'MEDIUM' },
  { id: 4, title: 'IT Equipment Procurement Request', department: 'IT', status: 'PENDING', author: 'K. Zimba', date: '2024-03-12', priority: 'LOW' },
  { id: 5, title: 'Safety Incident Report - Block C', department: 'SAFETY_MAINTENANCE', status: 'DRAFT', author: 'P. Mhlanga', date: '2024-03-11', priority: 'URGENT' },
  { id: 6, title: 'Staff Performance Review Template', department: 'MANAGEMENT', status: 'APPROVED', author: 'Admin', date: '2024-03-10', priority: 'MEDIUM' },
  { id: 7, title: 'Partnership Agreement - Red Cross', department: 'HOSPITAL_RELATIONS', status: 'PENDING', author: 'D. Sibanda', date: '2024-03-09', priority: 'HIGH' },
  { id: 8, title: 'Patient Feedback Summary Q1', department: 'CRD', status: 'DRAFT', author: 'L. Ncube', date: '2024-03-08', priority: 'MEDIUM' },
]

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-gray-100 text-gray-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const { data: session } = useSession()

  const filteredDocs = filter === 'ALL' ? mockDocuments : mockDocuments.filter(d => d.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all hospital documents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                  <p className="text-xs text-gray-500">by {doc.author}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{doc.department.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${statusColors[doc.status]}`}>{doc.status}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${priorityColors[doc.priority]}`}>{doc.priority}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.date}</td>
                <td className="px-6 py-4">
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Document Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Document</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="input-field" placeholder="Document title" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input-field">
                  <option>Report</option>
                  <option>Policy</option>
                  <option>Memo</option>
                  <option>Letter</option>
                  <option>Form</option>
                  <option>Minutes</option>
                  <option>Other</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea className="input-field h-32" placeholder="Document content..."></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Save as Draft</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
