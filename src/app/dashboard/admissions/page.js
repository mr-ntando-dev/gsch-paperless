'use client'
import { useState } from 'react'

export default function AdmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient admissions and discharges</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Admission</span>
        </button>
      </div>

      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
        <p className="font-medium">No admissions recorded yet.</p>
        <p className="text-sm mt-1">Admission records will appear here.</p>
      </div>
    </div>
  )
}
