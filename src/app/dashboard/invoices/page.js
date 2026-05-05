'use client'
import { useState } from 'react'

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Patient invoicing and payment tracking</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Invoice</span>
        </button>
      </div>

      <div className="text-center py-12 text-gray-500">
        
        <p>No invoices yet.</p>
        <p className="text-sm mt-1">Invoices will appear here once generated.</p>
      </div>
    </div>
  )
}
