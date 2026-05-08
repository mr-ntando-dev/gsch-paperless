'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'


export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (error) {
        // Messages API may not exist yet
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Internal communications between departments</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          
          <p>No messages yet.</p>
          <p className="text-sm mt-1">Internal messaging will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">{msg.sender?.name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{msg.sender?.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
