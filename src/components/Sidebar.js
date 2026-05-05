'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { departments } from '@/lib/departments'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Documents', href: '/dashboard/documents', icon: '📄' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
  { name: 'Forms', href: '/dashboard/forms', icon: '📝' },
  { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
]

const deptNavItems = {
  PATIENT_CARE: [
    { name: 'Patients', href: '/dashboard/patients', icon: '👶' },
    { name: 'Admissions', href: '/dashboard/admissions', icon: '🛏️' },
    { name: 'Day Care', href: '/dashboard/daycare', icon: '🧒' },
  ],
  BILLING: [
    { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
  ],
  KITCHEN: [
    { name: 'Meal Plans', href: '/dashboard/meals', icon: '🍽️' },
  ],
  SAFETY_MAINTENANCE: [
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: '🔧' },
  ],
  IT: [
    { name: 'Inventory', href: '/dashboard/inventory', icon: '💾' },
  ],
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const userDept = session?.user?.department
  const userRole = session?.user?.role

  const extraItems = (userRole === 'ADMIN' || userRole === 'MANAGER')
    ? Object.values(deptNavItems).flat()
    : (deptNavItems[userDept] || [])

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="GSCH Logo" width={36} height={36} className="rounded" />
              <div>
                <h1 className="font-bold text-primary-700 text-sm">GSCH</h1>
                <p className="text-[10px] text-gray-500">Paperless System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          )
        })}

        {extraItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Department
                </p>
              )}
            </div>
            {extraItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </Link>
              )
            })}
          </>
        )}

        {(userRole === 'ADMIN') && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </p>
              )}
            </div>
            <Link
              href="/dashboard/users"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname === '/dashboard/users'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">👤</span>
              {!collapsed && <span className="text-sm">User Management</span>}
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2`}>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {session?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {departments[userDept]?.shortName || userDept}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1`}
        >
          <span>🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
