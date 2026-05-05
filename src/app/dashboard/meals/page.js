'use client'
import { useState } from 'react'

const mockMeals = [
  { id: 1, date: '2024-03-15', type: 'Breakfast', ward: 'Paediatric A', items: 'Porridge, Bread, Tea, Fruit', dietary: '2 diabetic, 1 gluten-free', status: 'Served' },
  { id: 2, date: '2024-03-15', type: 'Lunch', ward: 'Paediatric A', items: 'Sadza, Beef Stew, Vegetables, Juice', dietary: '2 diabetic', status: 'Preparing' },
  { id: 3, date: '2024-03-15', type: 'Breakfast', ward: 'Paediatric B', items: 'Porridge, Eggs, Toast, Milk', dietary: '1 lactose-free', status: 'Served' },
  { id: 4, date: '2024-03-15', type: 'Lunch', ward: 'ICU', items: 'Soft diet - Soup, Mashed potatoes', dietary: 'All soft/liquid', status: 'Planned' },
  { id: 5, date: '2024-03-15', type: 'Dinner', ward: 'All Wards', items: 'Rice, Chicken, Mixed Vegetables', dietary: '3 special diets', status: 'Planned' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MealsPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meal Planning</h1>
          <p className="text-sm text-gray-500 mt-1">Manage meal plans, dietary requirements, and kitchen operations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Plan Meal</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Meals Today</p>
          <p className="text-2xl font-bold text-gray-800">15</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Patients Fed</p>
          <p className="text-2xl font-bold text-primary-600">42</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Special Diets</p>
          <p className="text-2xl font-bold text-orange-600">8</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Hygiene Score</p>
          <p className="text-2xl font-bold text-green-600">98%</p>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Weekly Meal Schedule</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div key={day} className={`p-3 rounded-lg text-center ${i === 4 ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase">{day}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{Math.floor(Math.random() * 5) + 12}</p>
              <p className="text-xs text-gray-500">meals</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Today&apos;s Meal Plans</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Meal Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dietary Notes</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockMeals.map((meal) => (
              <tr key={meal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{meal.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{meal.ward}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{meal.items}</td>
                <td className="px-6 py-4 text-sm text-orange-600">{meal.dietary}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    meal.status === 'Served' ? 'bg-green-100 text-green-700' :
                    meal.status === 'Preparing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{meal.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Meal Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Plan Meal</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select className="input-field">
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                <select className="input-field">
                  <option>All Wards</option>
                  <option>Paediatric A</option>
                  <option>Paediatric B</option>
                  <option>ICU</option>
                  <option>Neonatal</option>
                  <option>Surgical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Items</label>
                <textarea className="input-field h-20" placeholder="List menu items..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Notes</label>
                <textarea className="input-field h-16" placeholder="Special dietary requirements..."></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" className="btn-primary flex-1">Save Meal Plan</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
