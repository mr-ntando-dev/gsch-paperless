'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Documents', href: '/dashboard/documents' },
  { name: 'Tasks', href: '/dashboard/tasks' },
  { name: 'Forms', href: '/dashboard/forms' },
  { name: 'Messages', href: '/dashboard/messages' },
  { name: 'Reports', href: '/dashboard/reports' },
]

const adminItems = [
  { name: 'Users', href: '/dashboard/users' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [departments, setDepartments] = useState([])
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => setDepartments(Array.isArray(d) ? d.filter(x => x.isActive) : []))
      .catch(() => {})
  }, [])

  const isActive = (href) => pathname === href

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="GSCH Logo" width={36} height={36} className="rounded" />
              <div>
                <h1 className="font-bold text-primary-700 text-sm">GSCH MediFile</h1>
                <p className="text-gray-400 text-xs">© 2026</p>
              </div>
            </div>
          )}
          {collapsed && (
            <Image src="/logo.png" alt="GSCH" width={28} height={28} className="rounded mx-auto" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isActive(item.href)
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}

        {['ADMIN', 'MANAGER'].includes(userRole) && (
          <>
            {!collapsed && <p className="text-xs text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">Administration</p>}
            {adminItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  pathname.startsWith(item.href) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </>
        )}

        {!collapsed && departments.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">Departments</p>
            {departments.map(dept => (
              <Link key={dept.id} href={`/dashboard/department/${dept.code}`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  pathname === `/dashboard/department/${dept.code}` ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <span className={`w-2 h-2 rounded-full bg-${dept.color}-400 flex-shrink-0`} />
                <span className="truncate">{dept.shortName}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-100">
        {!collapsed && session?.user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-700 truncate">{session.user.name}</p>
            <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start space-x-2'} px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm`}
        >
          <span>⏻</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
