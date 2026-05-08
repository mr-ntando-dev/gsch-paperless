'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const adminNav = [
  { name: 'Overview', href: '/admin', icon: '⬡' },
  { name: 'Monitor', href: '/admin/monitor', icon: '◉' },
  { name: 'Users', href: '/admin/users', icon: '◈' },
  { name: 'Departments', href: '/admin/departments', icon: '◫' },
  { name: 'Activity Log', href: '/admin/activity', icon: '◷' },
  { name: 'Messages', href: '/admin/messages', icon: '◎' },
  { name: 'Documents', href: '/admin/documents', icon: '◻' },
  { name: 'Tasks', href: '/admin/tasks', icon: '◧' },
  { name: 'System', href: '/admin/system', icon: '⬡' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">SA</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">devntando</p>
            <p className="text-gray-500 text-xs">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-red-900/50 text-red-300 border border-red-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span>↗</span>
          <span>Back to App</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-red-400 text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span>⏻</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
