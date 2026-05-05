'use client'
import { useState } from 'react'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">IT Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Track IT assets and equipment</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Add Asset</span>
        </button>
      </div>

      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl block mb-2">💾</span>
        <p>No IT assets recorded yet.</p>
        <p className="text-sm mt-1">Equipment and asset records will appear here.</p>
      </div>
    </div>
  )
}
