'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STAT_CONFIGS = [
  { key: 'totalUsers', label: 'Total Users', sub: 'activeUsers', subLabel: 'active', href: '/admin/users', color: 'bg-blue-500', border: 'border-l-blue-500', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
  { key: 'totalDepts', label: 'Departments', sub: null, subLabel: 'active', href: '/admin/departments', color: 'bg-teal-500', border: 'border-l-teal-500', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21' },
  { key: 'totalDocs', label: 'Documents', sub: null, subLabel: 'all time', href: '/admin/documents', color: 'bg-emerald-500', border: 'border-l-emerald-500', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12' },
  { key: 'totalTasks', label: 'Tasks', sub: null, subLabel: 'created', href: '/admin/tasks', color: 'bg-amber-500', border: 'border-l-amber-500', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  { key: 'totalForms', label: 'Forms', sub: null, subLabel: 'submitted', href: '/admin/departments', color: 'bg-purple-500', border: 'border-l-purple-500', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108' },
  { key: 'totalMessages', label: 'Messages', sub: null, subLabel: 'total', href: '/admin/messages', color: 'bg-pink-500', border: 'border-l-pink-500', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501' },
]

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Full visibility across all departments and users</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CONFIGS.map(cfg => (
          <Link key={cfg.key} href={cfg.href}
            className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 border-l-4 ${cfg.border} hover:bg-gray-800 transition-colors group`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-xl ${cfg.color} bg-opacity-20 flex items-center justify-center`}>
                <svg className={`w-4 h-4 ${cfg.color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? <span className="text-gray-700">—</span> : (stats?.[cfg.key] ?? 0)}</p>
            <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wide">{cfg.label}</p>
            {cfg.sub && stats && <p className="text-gray-600 text-[10px] mt-0.5">{stats[cfg.sub]} {cfg.subLabel}</p>}
          </Link>
        ))}
      </div>

      {/* Activity log */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
          <Link href="/admin/activity" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">View all →</Link>
        </div>
        <div className="divide-y divide-gray-800/50">
          {loading ? (
            <div className="px-5 py-8 text-gray-600 text-sm text-center">Loading...</div>
          ) : !stats?.recentLogs?.length ? (
            <div className="px-5 py-8 text-gray-600 text-sm text-center">No activity recorded yet.</div>
          ) : (
            (stats.recentLogs || []).map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-gray-400">{log.user?.name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-snug">
                    <span className="text-white font-medium">{log.user?.name}</span>
                    {' '}
                    <span className="text-gray-400">{log.action}</span>
                    {' '}
                    <span className="text-blue-400">{log.resource}</span>
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">{new Date(log.createdAt).toLocaleString('en-ZW', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
