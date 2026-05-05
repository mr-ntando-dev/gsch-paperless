'use client'
import { useState } from 'react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and view departmental reports</p>
        </div>
      </div>

      <div className="text-center py-12 text-gray-500">
        
        <p>No reports generated yet.</p>
        <p className="text-sm mt-1">Reports will become available as data is entered into the system.</p>
      </div>
    </div>
  )
}
