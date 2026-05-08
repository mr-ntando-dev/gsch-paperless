'use client'
import { useState, useEffect } from 'react'

export default function AdminMessagesPage() {
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(d => { setDepartments(d); if (d.length) setSelectedDept(d[0].id) })
  }, [])

  useEffect(() => {
    if (!selectedDept) return
    setLoading(true)
    fetch(`/api/messages?departmentId=${selectedDept}`)
      .then(r => r.json())
      .then(d => { setMessages(Array.isArray(d) ? d : []); setLoading(false) })
  }, [selectedDept])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">All Messages</h2>
        <p className="text-gray-400 text-sm">Read every department channel. You are invisible.</p>
      </div>
      <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="p-6 text-gray-500 text-sm">Loading...</div> :
          messages.length === 0 ? <div className="p-6 text-gray-500 text-sm text-center">No messages in this channel.</div> :
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{msg.sender?.name}</span>
                  <span className="text-gray-600 text-xs">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-300 text-sm">{msg.content}</p>
                <p className="text-gray-600 text-xs mt-1">#{msg.channel}</p>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )
}
