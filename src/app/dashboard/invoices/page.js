'use client'
import { useState } from 'react'

const mockInvoices = [
  { id: 'INV-2024-0892', patient: 'Mrs. R. Moyo', amount: 2450, paid: 2450, status: 'PAID', date: '2024-03-15', department: 'Patient Care' },
  { id: 'INV-2024-0891', patient: 'Mr. T. Ndlovu', amount: 1800, paid: 900, status: 'PARTIAL', date: '2024-03-14', department: 'Patient Care' },
  { id: 'INV-2024-0890', patient: 'Mrs. S. Zimba', amount: 3200, paid: 0, status: 'UNPAID', date: '2024-03-13', department: 'Surgical' },
  { id: 'INV-2024-0889', patient: 'Mrs. P. Mhlanga', amount: 5600, paid: 5600, status: 'PAID', date: '2024-03-12', department: 'ICU' },
  { id: 'INV-2024-0888', patient: 'Mr. L. Chirwa', amount: 1200, paid: 0, status: 'OVERDUE', date: '2024-03-05', department: 'Patient Care' },
  { id: 'INV-2024-0887', patient: 'Mrs. D. Sibanda', amount: 4100, paid: 2000, status: 'PARTIAL', date: '2024-03-10', department: 'Neonatal' },
]

const statusColors = {
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  UNPAID: 'bg-gray-100 text-gray-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

export default function InvoicesPage() {
  const [showCreate, setShowCreate] = useState(false)

  const totalRevenue = mockInvoices.reduce((acc, inv) => acc + inv.paid, 0)
  const totalOutstanding = mockInvoices.reduce((acc, inv) => acc + (inv.amount - inv.paid), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient billing and payment tracking</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-800">{mockInvoices.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Revenue Collected</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{mockInvoices.filter(i => i.status === 'OVERDUE').length}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice No</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Patient/Guardian</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Paid</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-primary-600">{inv.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{inv.patient}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{inv.department}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">${inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-green-600">${inv.paid.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${statusColors[inv.status]}`}>{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">View</button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create Invoice</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient/Guardian Name</label>
                <input type="text" className="input-field" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="input-field">
                    <option>Patient Care</option>
                    <option>Surgical</option>
                    <option>ICU</option>
                    <option>Neonatal</option>
                    <option>Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line Items</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input type="text" className="input-field flex-1" placeholder="Description" />
                    <input type="number" className="input-field w-28" placeholder="Amount" />
                  </div>
                </div>
                <button type="button" className="mt-2 text-primary-600 hover:text-primary-800 text-sm font-medium">+ Add Item</button>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Generate Invoice</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
