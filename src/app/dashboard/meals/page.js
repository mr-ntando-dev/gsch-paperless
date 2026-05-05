'use client'
import { useState } from 'react'

export default function MealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meal Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage meal planning and dietary requirements</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>New Meal Plan</span>
        </button>
      </div>

      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl block mb-2">🍽️</span>
        <p>No meal plans created yet.</p>
        <p className="text-sm mt-1">Meal plans and dietary schedules will appear here.</p>
      </div>
    </div>
  )
}
