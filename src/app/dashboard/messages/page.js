'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const channels = [
  { id: 'general', name: 'General', icon: '💬', unread: 3 },
  { id: 'patient-care', name: 'Patient Care', icon: '🏥', unread: 1 },
  { id: 'management', name: 'Management', icon: '📋', unread: 0 },
  { id: 'it-support', name: 'IT Support', icon: '💻', unread: 5 },
  { id: 'kitchen', name: 'Kitchen', icon: '🍽️', unread: 0 },
  { id: 'maintenance', name: 'Maintenance', icon: '🔧', unread: 2 },
  { id: 'billing', name: 'Billing', icon: '💰', unread: 0 },
]

const mockMessages = [
  { id: 1, sender: 'Dr. Moyo', content: 'Ward A patient discharge notes have been updated. Please review before end of day.', time: '10:30 AM', avatar: 'M' },
  { id: 2, sender: 'S. Ndlovu', content: 'Kitchen inventory has been updated. We need to order more supplies by Friday.', time: '10:15 AM', avatar: 'S' },
  { id: 3, sender: 'K. Zimba', content: 'System maintenance scheduled for tonight 10PM-12AM. Please save all work before then.', time: '09:45 AM', avatar: 'K' },
  { id: 4, sender: 'P. Mhlanga', content: 'Safety inspection for Block C is complete. Report uploaded to documents.', time: '09:30 AM', avatar: 'P' },
  { id: 5, sender: 'Admin', content: 'Reminder: Board meeting tomorrow at 9AM. All department heads please prepare reports.', time: '09:00 AM', avatar: 'A' },
  { id: 6, sender: 'L. Ncube', content: 'New patient feedback received - positive review for paediatric ward staff!', time: '08:45 AM', avatar: 'L' },
]

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState('general')
  const [newMessage, setNewMessage] = useState('')
  const { data: session } = useSession()

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Channels sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Channels</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeChannel === channel.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{channel.icon}</span>
              <span className="flex-1 text-sm font-medium">{channel.name}</span>
              {channel.unread > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {channel.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
          <span className="text-lg">{channels.find(c => c.id === activeChannel)?.icon}</span>
          <h3 className="font-semibold text-gray-800">{channels.find(c => c.id === activeChannel)?.name}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className="flex space-x-3">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary-700">{msg.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold text-gray-800">{msg.sender}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 input-field"
              placeholder={`Message #${activeChannel}...`}
            />
            <button className="btn-primary px-6">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
