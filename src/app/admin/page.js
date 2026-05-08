'use client'
import { useState, useEffect } from 'react'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'border-blue-500', sub: `${stats.activeUsers} active` },
    { label: 'Departments', value: stats.totalDepts, color: 'border-teal-500', sub: 'active' },
    { label: 'Documents', value: stats.totalDocs, color: 'border-green-500', sub: 'all time' },
    { label: 'Tasks', value: stats.totalTasks, color: 'border-yellow-500', sub: 'created' },
    { label: 'Forms', value: stats.totalForms, color: 'border-purple-500', sub: 'active' },
    { label: 'Messages', value: stats.totalMessages, color: 'border-pink-500', sub: 'total' },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Full visibility across all departments and users</p>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading stats...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map(card => (
              <div key={card.label} className={`bg-gray-900 rounded-xl p-4 border-l-4 ${card.color} border border-gray-800`}>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            {stats?.recentLogs?.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(stats?.recentLogs || []).map(log => (
                  <div key={log.id} className="flex items-start space-x-3 py-2 border-b border-gray-800 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm">
                        <span className="text-white font-medium">{log.user?.name}</span>
                        {' '}
                        <span className="text-gray-400">{log.action}</span>
                        {' '}
                        <span className="text-blue-400">{log.resource}</span>
                      </p>
                      <p className="text-gray-600 text-xs">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
