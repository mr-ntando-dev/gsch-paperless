'use client'
import { useState, useEffect, useCallback } from 'react'

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function BackupPage() {
  const [summary, setSummary] = useState(null)
  const [checkedAt, setCheckedAt] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)
  const [lastDownload, setLastDownload] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Stats failed')
      setSummary(data.summary)
      setCheckedAt(data.checkedAt)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/backup')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Backup failed')
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="?([^"]+)"?/)
      const filename = match ? match[1] : `gsch-backup-${Date.now()}.json`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setLastDownload(new Date().toISOString())
    } catch (e) {
      setError(e.message)
    } finally {
      setDownloading(false)
    }
  }

  const fmt = (iso) => iso
    ? new Date(iso).toLocaleString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  const statEntries = summary ? Object.entries(summary) : []

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Database Backup</h2>
        <p className="text-gray-500 text-sm mt-1">
          Export a full snapshot of all system data as a JSON file.
          SUPERADMIN only · Connection: Supabase PostgreSQL
        </p>
      </div>

      {/* Connection badge */}
      <div className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium">Supabase PostgreSQL</p>
          <p className="text-gray-500 text-[11px] truncate">db.oqpsecmwrxfinoqravxh.supabase.co:5432/postgres</p>
        </div>
        {checkedAt && (
          <span className="text-gray-600 text-[10px] whitespace-nowrap">Checked {fmt(checkedAt)}</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-semibold">Table Summary</h3>
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40"
          >
            {loadingStats ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
        {loadingStats && !summary ? (
          <div className="text-gray-600 text-sm py-6 text-center">Loading stats…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statEntries.map(([k, v]) => (
              <StatCard
                key={k}
                label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                value={v.toLocaleString()}
                color={v > 0 ? 'text-emerald-400' : 'text-gray-500'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Download section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Full JSON Export</h3>
            <p className="text-gray-500 text-xs mt-1">
              Downloads a single <code className="text-gray-400 bg-gray-800 px-1 rounded">.json</code> file
              containing every row from every table — users, patients, documents, tasks, messages, and all clinical records.
            </p>
          </div>
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-emerald-500 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
        </div>

        <ul className="text-gray-500 text-xs space-y-1 list-none">
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All tables included (Prisma models)</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Passwords excluded from user export</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Timestamped filename for version control</li>
          <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> Contains sensitive patient data — store securely</li>
        </ul>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {downloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Backup
              </>
            )}
          </button>

          {lastDownload && (
            <span className="text-gray-600 text-xs">Last downloaded {fmt(lastDownload)}</span>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-950/40 border border-amber-900/60 rounded-xl px-4 py-3 text-amber-300/80 text-xs space-y-1">
        <p className="font-semibold text-amber-300">Backup best practices</p>
        <p>Schedule regular exports (weekly minimum) and store them in an encrypted, off-site location. This export does not include binary files or media assets.</p>
      </div>
    </div>
  )
}
