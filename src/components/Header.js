'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingRoutes, setPendingRoutes] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const searchTimeout = useRef(null)

  useEffect(() => {
    if (!session?.user) return
    // Fetch notifications
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : { notifications: [], unreadCount: 0 })
      .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unreadCount || 0) })
      .catch(() => {})
    // Fetch pending routes
    if (session.user.departmentId) {
      fetch('/api/routes?direction=incoming')
        .then(r => r.ok ? r.json() : [])
        .then(d => setPendingRoutes(Array.isArray(d) ? d.filter(r => r.status === 'PENDING').length : 0))
        .catch(() => {})
    }
  }, [session])

  useEffect(() => {
    if (searchVal.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch('/api/search?q=' + encodeURIComponent(searchVal.trim()))
        if (r.ok) { const d = await r.json(); setSearchResults(d); setSearchOpen(d.length > 0) }
      } finally { setSearching(false) }
    }, 300)
  }, [searchVal])

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
    setUnreadCount(0)
    setNotifications(n => n.map(x => ({ ...x, isRead: true })))
  }

  const markRead = async (id) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const totalBadge = unreadCount + pendingRoutes

  const TYPE_ICONS = { Patient: '👤', Document: '📄', Task: '✅', Maintenance: '🔧', User: '👥' }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Global Search */}
        <div ref={searchRef} className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            placeholder="Search patients, tasks, documents..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all placeholder:text-gray-400"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />}

          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => { router.push(r.href); setSearchOpen(false); setSearchVal('') }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <span className="text-base">{TYPE_ICONS[r.type] || '🔍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.type} · {r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {totalBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{totalBadge > 9 ? '9+' : totalBadge}</span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-800">Notifications</p>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700">Mark all read</button>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {/* Document routing alert */}
                  {pendingRoutes > 0 && (
                    <Link href="/dashboard/documents" onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-3 p-3 border-b border-gray-50 hover:bg-amber-50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-800">{pendingRoutes} pending document{pendingRoutes > 1 ? 's' : ''}</p>
                        <p className="text-[11px] text-amber-600">Routed to your department</p>
                      </div>
                    </Link>
                  )}
                  {/* App notifications */}
                  {notifications.length === 0 && pendingRoutes === 0 ? (
                    <div className="px-4 py-8 text-center"><p className="text-sm text-gray-400">No notifications</p></div>
                  ) : notifications.map(n => (
                    <button key={n.id} onClick={() => { markRead(n.id); if (n.link) router.push(n.link); setNotifOpen(false) }}
                      className={'w-full text-left flex items-start gap-3 p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ' + (!n.isRead ? 'bg-blue-50/50' : '')}>
                      <div className={'w-2 h-2 rounded-full mt-2 flex-shrink-0 ' + (!n.isRead ? 'bg-blue-500' : 'bg-transparent')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString('en-ZW')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-xs">{session?.user?.name?.substring(0, 2).toUpperCase() || '?'}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{session?.user?.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-400">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
