'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const HIERARCHY = {
  MANAGEMENT: { tier: 1 }, HOSPITAL_RELATIONS: { tier: 2 },
  CRD: { tier: 3 }, PATIENT_CARE: { tier: 3 },
  BILLING: { tier: 4 }, ACCOUNTS: { tier: 4 }, IT: { tier: 4 },
  KITCHEN: { tier: 5 }, SAFETY_MAINTENANCE: { tier: 5 },
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState(null) // null = general/all
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const url = selectedDept ? `/api/messages?deptId=${selectedDept.id}` : '/api/messages'
      const res = await fetch(url)
      if (res.ok) setMessages(await res.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(d => {
      const active = Array.isArray(d) ? d.filter(x => x.isActive) : []
      setDepartments(active.sort((a, b) => (HIERARCHY[a.code]?.tier ?? 99) - (HIERARCHY[b.code]?.tier ?? 99)))
    }).catch(() => {})
  }, [])

  useEffect(() => { fetchMessages() }, [selectedDept])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), departmentId: selectedDept?.id || null }),
      })
      if (res.ok) { setContent(''); fetchMessages() }
      else toast.error('Failed to send message')
    } finally { setSending(false) }
  }

  const myDept = departments.find(d => d.id === session?.user?.departmentId)

  return (
    <div className="flex h-[calc(100vh-130px)] gap-4">
      {/* Channel list */}
      <div className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button onClick={() => setSelectedDept(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${!selectedDept ? 'bg-primary-600 text-white font-medium' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span>General</span>
          </button>

          <p className="text-[9px] text-gray-300 uppercase tracking-widest font-semibold px-3 pt-2 pb-1">Departments</p>
          {departments.map(d => {
            const active = selectedDept?.id === d.id
            const isMyDept = d.id === session?.user?.departmentId
            return (
              <button key={d.id} onClick={() => setSelectedDept(d)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${active ? 'bg-primary-600 text-white font-medium' : isMyDept ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {d.shortName.substring(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{d.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{selectedDept ? selectedDept.name : 'General'}</p>
            <p className="text-[10px] text-gray-400">{selectedDept ? `Department channel · ${selectedDept._count?.users ?? 0} staff` : 'All-staff channel'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-sm text-gray-400">No messages in this channel yet</p>
              <p className="text-xs text-gray-300">Be the first to send one</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === session?.user?.id || msg.sender?.id === session?.user?.id
              return (
                <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500">
                    {msg.sender?.name?.substring(0, 2).toUpperCase() || '?'}
                  </div>
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isMe && <p className="text-[10px] text-gray-400 px-1">{msg.sender?.name}</p>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className="text-[9px] text-gray-300 px-1">{new Date(msg.createdAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input value={content} onChange={e => setContent(e.target.value)}
              placeholder={`Message ${selectedDept ? selectedDept.name : 'everyone'}...`}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all"
              disabled={sending} />
            <button type="submit" disabled={sending || !content.trim()}
              className="flex-shrink-0 w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
