'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const URGENCY_C = { ROUTINE: 'bg-blue-50 text-blue-700', URGENT: 'bg-amber-50 text-amber-700', STAT: 'bg-red-50 text-red-700' }
const STATUS_C = { PENDING: 'bg-gray-100 text-gray-600', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-500' }
const EMPTY_FORM = { patientId: '', type: 'LABORATORY', testName: '', urgency: 'ROUTINE', clinicalNotes: '' }

export default function LabRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [resultText, setResultText] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [search, setSearch] = useState('')

  const role = session?.user?.role
  const isAdmin = ['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(role)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterStatus) params.set('status', filterStatus)
    try {
      const [rr, pr] = await Promise.all([fetch('/api/lab-requests?' + params), fetch('/api/patients')])
      if (rr.ok) setRequests(await rr.json())
      if (pr.ok) { const d = await pr.json(); setPatients(Array.isArray(d) ? d.filter(p => p.isActive) : []) }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterType, filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/lab-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Request submitted'); setShowForm(false); setForm(EMPTY_FORM); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const submitResult = async () => {
    if (!resultText.trim()) return toast.error('Enter result first')
    setSaving(true)
    try {
      const r = await fetch('/api/lab-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedRequest.id, result: resultText }) })
      if (r.ok) { toast.success('Result saved'); setShowResult(false); setResultText(''); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    const r = await fetch('/api/lab-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { toast.success('Updated'); load() } else toast.error('Failed')
  }

  const filtered = requests.filter(req => {
    const name = `${req.patient?.firstName} ${req.patient?.lastName} ${req.patient?.patientId} ${req.testName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const labTests = ['Full Blood Count', 'Urea & Electrolytes', 'Liver Function Tests', 'Thyroid Function', 'Blood Culture', 'Urine M&C', 'Malaria Antigen', 'HIV Rapid Test', 'Widal Test', 'ESR', 'CRP', 'Blood Glucose', 'HbA1c', 'Lipid Profile', 'Other']
  const radioTests = ['Chest X-Ray', 'Abdominal X-Ray', 'Skull X-Ray', 'Pelvis X-Ray', 'Ultrasound Abdomen', 'Ultrasound Pelvis', 'Echocardiogram', 'CT Scan', 'MRI', 'Other']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lab & Radiology</h1>
          <p className="text-sm text-gray-500 mt-0.5">Investigation requests and results</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or test..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-56" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">All Types</option>
          <option value="LABORATORY">Laboratory</option>
          <option value="RADIOLOGY">Radiology</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
          <div key={s} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === s).length}</div>
            <div className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${STATUS_C[s]}`}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Test</th>
                <th className="px-4 py-3 text-left">Urgency</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Requested By</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">No requests found</td></tr>}
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{req.patient?.firstName} {req.patient?.lastName}</div>
                    <div className="text-xs text-gray-400">{req.patient?.patientId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${req.type === 'LABORATORY' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{req.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{req.testName}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${URGENCY_C[req.urgency]}`}>{req.urgency}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_C[req.status]}`}>{req.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{req.requestedBy?.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(req.requestedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {req.status === 'PENDING' && <button onClick={() => updateStatus(req.id, 'IN_PROGRESS')} className="text-xs text-blue-600 hover:underline">Start</button>}
                      {['PENDING', 'IN_PROGRESS'].includes(req.status) && (
                        <button onClick={() => { setSelectedRequest(req); setResultText(req.result || ''); setShowResult(true) }} className="text-xs text-green-600 hover:underline">Enter Result</button>
                      )}
                      {req.status === 'COMPLETED' && req.result && (
                        <button onClick={() => { setSelectedRequest(req); setShowResult(true); setResultText(req.result) }} className="text-xs text-gray-500 hover:underline">View Result</button>
                      )}
                      {req.status !== 'CANCELLED' && isAdmin && <button onClick={() => updateStatus(req.id, 'CANCELLED')} className="text-xs text-red-400 hover:underline">Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">New Investigation Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Type</label>
                <div className="flex gap-3">
                  {['LABORATORY', 'RADIOLOGY'].map(t => (
                    <label key={t} className={`flex-1 border rounded-xl px-3 py-2 text-sm text-center cursor-pointer transition-all ${form.type === t ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600'}`}>
                      <input type="radio" name="type" value={t} checked={form.type === t} onChange={e => setForm(f => ({ ...f, type: e.target.value, testName: '' }))} className="hidden" />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test / Investigation</label>
                <select value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                  <option value="">Select test</option>
                  {(form.type === 'LABORATORY' ? labTests : radioTests).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Emergency)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                <textarea value={form.clinicalNotes} onChange={e => setForm(f => ({ ...f, clinicalNotes: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Reason for investigation, relevant history..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Result — {selectedRequest.testName}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedRequest.patient?.firstName} {selectedRequest.patient?.lastName}</p>
            <textarea value={resultText} onChange={e => setResultText(e.target.value)} rows={6}
              disabled={selectedRequest.status === 'COMPLETED'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50" placeholder="Enter result findings..." />
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowResult(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Close</button>
              {selectedRequest.status !== 'COMPLETED' && (
                <button onClick={submitResult} disabled={saving} className="flex-1 bg-green-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Result'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
