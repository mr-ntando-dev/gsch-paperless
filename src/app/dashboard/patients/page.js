'use client'
import { useState } from 'react'

const mockPatients = [
  { id: 'GSCH-P001', name: 'Tendai Moyo', age: '5 years', guardian: 'Mrs. R. Moyo', ward: 'Paediatric A', status: 'Admitted', admitDate: '2024-03-10' },
  { id: 'GSCH-P002', name: 'Chipo Ndlovu', age: '3 years', guardian: 'Mr. T. Ndlovu', ward: 'Paediatric B', status: 'Admitted', admitDate: '2024-03-12' },
  { id: 'GSCH-P003', name: 'Kudzai Zimba', age: '7 years', guardian: 'Mrs. S. Zimba', ward: 'Surgical', status: 'Discharged', admitDate: '2024-03-08' },
  { id: 'GSCH-P004', name: 'Tatenda Mhlanga', age: '2 years', guardian: 'Mrs. P. Mhlanga', ward: 'ICU', status: 'Admitted', admitDate: '2024-03-14' },
  { id: 'GSCH-P005', name: 'Rudo Chirwa', age: '10 years', guardian: 'Mr. L. Chirwa', ward: 'Paediatric A', status: 'Admitted', admitDate: '2024-03-13' },
  { id: 'GSCH-P006', name: 'Farai Sibanda', age: '6 months', guardian: 'Mrs. D. Sibanda', ward: 'Neonatal', status: 'Critical', admitDate: '2024-03-15' },
]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [showAdmit, setShowAdmit] = useState(false)

  const filtered = mockPatients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient admissions and records digitally</p>
        </div>
        <button onClick={() => setShowAdmit(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Admission</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Patients</p>
          <p className="text-2xl font-bold text-gray-800">128</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Currently Admitted</p>
          <p className="text-2xl font-bold text-primary-600">42</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Critical</p>
          <p className="text-2xl font-bold text-red-600">3</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Discharged Today</p>
          <p className="text-2xl font-bold text-green-600">5</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or ID..."
          className="input-field pl-10"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      {/* Patients Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Patient ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Age</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Guardian</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-primary-600">{patient.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{patient.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.guardian}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.ward}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700' :
                    patient.status === 'Discharged' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{patient.status}</span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">View</button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admission Modal */}
      {showAdmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">New Patient Admission</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="input-field" placeholder="Patient first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="input-field" placeholder="Patient last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                  <select className="input-field">
                    <option>Paediatric A</option>
                    <option>Paediatric B</option>
                    <option>Surgical</option>
                    <option>ICU</option>
                    <option>Neonatal</option>
                    <option>Outpatient</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input type="text" className="input-field" placeholder="Guardian full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                  <input type="tel" className="input-field" placeholder="e.g., 0771234567" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attending Doctor</label>
                <input type="text" className="input-field" placeholder="Doctor name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis / Reason for Admission</label>
                <textarea className="input-field h-24" placeholder="Initial diagnosis..."></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Admit Patient</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowAdmit(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
