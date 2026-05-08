'use client'
import { useState, useEffect } from 'react'

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/monitor?resource=documents')
      .then(r => r.json())
      .then(d => { setDocs(d.documents || []); setLoading(false) })
  }, [])

  const statusColor = { DRAFT:'bg-gray-800 text-gray-400', PENDING:'bg-yellow-900/50 text-yellow-400', APPROVED:'bg-green-900/50 text-green-400', REJECTED:'bg-red-900/50 text-red-400', ARCHIVED:'bg-gray-800/50 text-gray-500' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">All Documents</h2>
        <p className="text-gray-400 text-sm">Every document across all departments.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Title</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Dept</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Author</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Priority</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Date</th>
            </tr></thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white text-sm">{doc.title}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{doc.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{doc.author?.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColor[doc.status] || 'bg-gray-800 text-gray-400'}`}>{doc.status}</span></td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{doc.priority}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
