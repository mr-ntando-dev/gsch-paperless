'use client'
import { useState } from 'react'

const reportTypes = [
  { id: 'patient', name: 'Patient Statistics', icon: '👶', description: 'Admissions, discharges, ward occupancy' },
  { id: 'financial', name: 'Financial Summary', icon: '💰', description: 'Revenue, expenses, outstanding payments' },
  { id: 'maintenance', name: 'Maintenance Report', icon: '🔧', description: 'Request resolution, facility status' },
  { id: 'hr', name: 'HR & Staffing', icon: '👥', description: 'Attendance, leave, staff allocation' },
  { id: 'kitchen', name: 'Kitchen Operations', icon: '🍽️', description: 'Meals served, inventory, hygiene scores' },
  { id: 'safety', name: 'Safety & Compliance', icon: '🛡️', description: 'Incidents, audits, compliance status' },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and view departmental reports</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>📥</span>
          <span>Export All</span>
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`card text-left hover:shadow-md transition-all ${selectedReport === report.id ? 'border-primary-300 bg-primary-50' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{report.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{report.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Sample Report */}
      {selectedReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {reportTypes.find(r => r.id === selectedReport)?.name} - March 2024
            </h3>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">PDF</button>
              <button className="btn-secondary text-sm">Excel</button>
              <button className="btn-primary text-sm">Generate</button>
            </div>
          </div>

          {/* Mock Chart Area */}
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="flex items-end space-x-2 justify-center mb-4">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-8 bg-primary-400 rounded-t"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Monthly Trend - Click Generate for full report</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-gray-500 mt-1">Total Entries</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">+12%</p>
              <p className="text-xs text-gray-500 mt-1">Growth</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">94%</p>
              <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-xs text-gray-500 mt-1">Pending Items</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
