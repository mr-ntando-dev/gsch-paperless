'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DepartmentPage() {
  const params = useParams()
  const deptCode = params.dept
  const { data: session } = useSession()

  const [dept, setDept] = useState(null)
  const [items, setItems] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', type: 'NOTE', isPinned: false })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('board')

  const canPost = session?.user?.role !== 'VIEWER'
  const isAdminOrManager = ['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(session?.user?.role)
  const isMyDept = isAdminOrManager || session?.user?.departmentId === dept?.id

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(depts => {
        const found = depts.find(d => d.code === deptCode)
        if (found) {
          setDept(found)
          return fetch(`/api/dept-items?deptId=${found.id}`)
        }
      })
      .then(r => r?.json())
      .then(d => { if (d) setItems(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deptCode])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!dept) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/dept-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, departmentId: dept.id })
      })
      if (res.ok) {
        toast.success('Posted successfully')
        setShowAdd(false)
        setForm({ title: '', content: '', type: 'NOTE', isPinned: false })
        const updated = await fetch(`/api/dept-items?deptId=${dept.id}`)
        if (updated.ok) setItems(await updated.json())
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to post')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const typeColor = {
    NOTE: 'bg-gray-100 text-gray-700',
    ANNOUNCEMENT: 'bg-blue-100 text-blue-700',
    PROCEDURE: 'bg-green-100 text-green-700',
    CHECKLIST: 'bg-yellow-100 text-yellow-700',
    POLICY: 'bg-purple-100 text-purple-700',
    ALERT: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="p-8 text-gray-400">Loading department...</div>
  if (!dept) return <div className="p-8 text-gray-400">Department not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{dept.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{dept.description || 'Department workspace'}</p>
        </div>
        {canPost && isMyDept && (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            + Add Item
          </button>
        )}
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        {['board', 'notices'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-primary-600 text-primary-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'board' ? 'Department Board' : 'Notices'}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Post to {dept.shortName}</h3>
            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['NOTE','ANNOUNCEMENT','PROCEDURE','CHECKLIST','POLICY','ALERT'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                <textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="pin" checked={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.checked})} className="rounded" />
                <label htmlFor="pin" className="text-sm text-gray-600">Pin this item</label>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors">
                  {submitting ? 'Posting...' : 'Post'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
              No items posted yet. {canPost && isMyDept && 'Be the first to add something.'}
            </div>
          ) : items.map(item => (
            <div key={item.id} className={`bg-white border rounded-xl p-4 ${item.isPinned ? 'border-primary-300 shadow-md' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {item.isPinned && <span className="text-primary-600 text-xs">📌</span>}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor[item.type] || 'bg-gray-100 text-gray-700'}`}>{item.type}</span>
                </div>
                <span className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.content}</p>
              <p className="text-gray-400 text-xs mt-2">— {item.author?.name}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="text-gray-400 text-sm">No notices for this department yet.</div>
      )}
    </div>
  )
}
