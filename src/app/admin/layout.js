import { getSession, isSuperAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'System Administration',
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({ children }) {
  const session = await getSession()
  if (!session || !isSuperAdmin(session)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">System Administration</h1>
            <p className="text-gray-400 text-xs">Restricted access — GSCH Internal</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300 border border-red-700">
              ● SUPERADMIN
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
