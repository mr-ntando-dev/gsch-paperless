'use client'
import { useParams } from 'next/navigation'
import { departments } from '@/lib/departments'
import Link from 'next/link'

export default function DepartmentPage() {
  const params = useParams()
  const deptKey = params.dept?.toUpperCase()
  const dept = departments[deptKey]

  if (!dept) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Department not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{dept.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dept.modules.map((module, index) => (
          <div key={module} className="card hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <span className="text-primary-700 font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-700">{module}</h3>
                <p className="text-xs text-gray-500 mt-1">Click to manage</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/documents" className="btn-primary text-sm">
            New Document
          </Link>
          <Link href="/dashboard/tasks" className="btn-secondary text-sm">
            Create Task
          </Link>
          <Link href="/dashboard/forms" className="btn-secondary text-sm">
            Submit Form
          </Link>
          <Link href="/dashboard/messages" className="btn-secondary text-sm">
            Send Message
          </Link>
        </div>
      </div>

      {/* Recent Activity for this department */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Department Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New document created</p>
              <p className="text-xs text-gray-500">Monthly report uploaded</p>
            </div>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Task completed</p>
              <p className="text-xs text-gray-500">Weekly checklist submitted</p>
            </div>
            <span className="text-xs text-gray-400">5 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Form submission</p>
              <p className="text-xs text-gray-500">New submission received</p>
            </div>
            <span className="text-xs text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
