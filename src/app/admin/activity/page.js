'use client'
import { useState, useEffect } from 'react'

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setLogs(d.recentLogs || []); setLoading(false) })
  }, [])

  const actionColor = (action) => {
    if (action.includes('created') || action.includes('CREATE')) return 'text-green-400 bg-green-900/30'
    if (action.includes('deleted') || action.includes('DELETE')) return 'text-red-400 bg-red-900/30'
    if (action.includes('updated') || action.includes('UPDATE')) return 'text-blue-400 bg-blue-900/30'
    return 'text-gray-400 bg-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Activity Log</h2>
        <p className="text-gray-400 text-sm">Full audit trail — every action, every user, every time.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No activity logged yet. Actions will appear here as users interact with the system.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map(log => (
              <div key={log.id} className="flex items-start space-x-4 px-5 py-3 hover:bg-gray-800/30">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 font-medium">
                    {log.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <span className="text-white text-sm font-medium">{log.user?.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${actionColor(log.action)}`}>{log.action}</span>
                    <span className="text-blue-400 text-xs">{log.resource}</span>
                    {log.resourceId && <span className="text-gray-600 text-xs font-mono">{log.resourceId.substring(0, 8)}...</span>}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{log.user?.email}</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    {log.ipAddress && <><span>•</span><span>{log.ipAddress}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
