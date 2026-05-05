'use client'
import { useState } from 'react'

const mockInventory = [
  { id: 1, name: 'Desktop Computers', category: 'Hardware', department: 'IT', quantity: 45, minStock: 5, status: 'OK', lastOrdered: '2024-02-15' },
  { id: 2, name: 'Printers', category: 'Hardware', department: 'IT', quantity: 12, minStock: 3, status: 'OK', lastOrdered: '2024-01-20' },
  { id: 3, name: 'Network Cables (Cat6)', category: 'Networking', department: 'IT', quantity: 8, minStock: 20, status: 'LOW', lastOrdered: '2024-03-01' },
  { id: 4, name: 'USB Flash Drives', category: 'Accessories', department: 'IT', quantity: 25, minStock: 10, status: 'OK', lastOrdered: '2024-02-28' },
  { id: 5, name: 'Toner Cartridges', category: 'Consumables', department: 'IT', quantity: 3, minStock: 10, status: 'CRITICAL', lastOrdered: '2024-03-10' },
  { id: 6, name: 'UPS Batteries', category: 'Power', department: 'IT', quantity: 6, minStock: 4, status: 'OK', lastOrdered: '2024-02-20' },
  { id: 7, name: 'Wireless Keyboards', category: 'Accessories', department: 'IT', quantity: 2, minStock: 5, status: 'LOW', lastOrdered: '2024-03-05' },
  { id: 8, name: 'Monitor Screens', category: 'Hardware', department: 'IT', quantity: 8, minStock: 3, status: 'OK', lastOrdered: '2024-01-15' },
]

export default function InventoryPage() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">IT Inventory & Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Track IT equipment, assets, and stock levels</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Add Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{mockInventory.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">{mockInventory.filter(i => i.status === 'LOW').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Critical</p>
          <p className="text-2xl font-bold text-red-600">{mockInventory.filter(i => i.status === 'CRITICAL').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold text-primary-600">{mockInventory.reduce((acc, i) => acc + i.quantity, 0)}</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Min Stock</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Last Ordered</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockInventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.minStock}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    item.status === 'OK' ? 'bg-green-100 text-green-700' :
                    item.status === 'LOW' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{item.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.lastOrdered}</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">Order</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Inventory Item</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input type="text" className="input-field" placeholder="e.g., Laptop HP ProBook" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input-field">
                    <option>Hardware</option>
                    <option>Software</option>
                    <option>Networking</option>
                    <option>Accessories</option>
                    <option>Consumables</option>
                    <option>Power</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="input-field">
                    <option>IT</option>
                    <option>All Departments</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                  <input type="number" className="input-field" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input type="text" className="input-field" placeholder="Supplier name" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Add Item</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
