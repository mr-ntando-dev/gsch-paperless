'use client'
import { useState } from 'react'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient information and records</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Add Patient</span>
        </button>
      </div>

      <div className="text-center py-12 text-gray-500">
        
        <p>No patient records yet.</p>
        <p className="text-sm mt-1">Patient records will appear here once added.</p>
      </div>
    </div>
  )
}
