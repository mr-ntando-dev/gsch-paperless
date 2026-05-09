'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { patientId: '', temperature: '', pulse: '', systolic: '', diastolic: '', spo2: '', weight: '', height: '', respRate: '', glucoseLevel: '', notes: '' }

function VitalBadge({ label, value, unit, normal, warn }) {
  if (value === null || value === undefined || value === '') return null
  const num = parseFloat(value)
  let color = 'bg-green-50 text-green-700 border-green-200'
  if (warn && (num < warn[0] || num > warn[1])) color = 'bg-amber-50 text-amber-700 border-amber-200'
  if (normal && (num < normal[0] || num > normal[1])) color = 'bg-red-50 text-red-700 border-red-200'
  return (
    <div className={`rounded-xl border px-3 py-2 text-center ${color}`}>
      <div className="text-xs text-current opacity-60 font-medium">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-60">{unit}</div>
    </div>
  )
}

export default function VitalsPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [vitals, setVitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/patients').then(r => r.ok ? r.json() : []).then(d => setPatients(Array.isArray(d) ? d.filter(p => p.isActive) : []))
  }, [])

  const loadVitals = async (patient) => {
    setSelectedPatient(patient)
    setLoading(true)
    try {
      const r = await fetch('/api/vitals?patientId=' + patient.id)
      if (r.ok) setVitals(await r.json())
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatient) return
    setSaving(true)
    try {
      const r = await fetch('/api/vitals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientId: selectedPatient.id })
      })
      if (r.ok) { toast.success('Vitals recorded'); setShowForm(false); setForm(EMPTY_FORM); loadVitals(selectedPatient) }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const filteredPatients = patients.filter(p =>
    p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  )

  const latestVitals = vitals[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vitals Timeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Patient vital signs — structured and timestamped</p>
        </div>
        {selectedPatient && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Record Vitals
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient list */}
        <div className="space-y-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => loadVitals(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-sm ${selectedPatient?.id === p.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="font-semibold text-gray-800">{p.firstName} {p.lastName}</div>
                <div className="text-xs text-gray-400">{p.patientId} · {p.careType}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vitals detail */}
        <div className="lg:col-span-3">
          {!selectedPatient ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              <p className="text-sm">Select a patient to view vitals</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                <p className="text-xs text-gray-500">{selectedPatient.patientId} · {selectedPatient.bloodType || 'Blood type unknown'} · Allergies: {selectedPatient.allergies || 'None recorded'}</p>
              </div>

              {latestVitals && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Latest Reading — {new Date(latestVitals.recordedAt).toLocaleString()}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <VitalBadge label="Temp" value={latestVitals.temperature} unit="°C" warn={[36, 37.5]} normal={[34, 39]} />
                    <VitalBadge label="Pulse" value={latestVitals.pulse} unit="bpm" warn={[60, 100]} normal={[40, 150]} />
                    <VitalBadge label="BP Sys" value={latestVitals.systolic} unit="mmHg" warn={[90, 140]} normal={[70, 180]} />
                    <VitalBadge label="SpO2" value={latestVitals.spo2} unit="%" warn={[94, 100]} normal={[88, 100]} />
                    <VitalBadge label="Weight" value={latestVitals.weight} unit="kg" />
                    <VitalBadge label="Height" value={latestVitals.height} unit="cm" />
                    <VitalBadge label="Resp Rate" value={latestVitals.respRate} unit="/min" warn={[12, 20]} normal={[8, 30]} />
                    <VitalBadge label="Glucose" value={latestVitals.glucoseLevel} unit="mmol/L" warn={[4, 7]} normal={[2.5, 15]} />
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading vitals history...</div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-700 text-sm">History ({vitals.length} records)</h4>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                    {vitals.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No vitals recorded yet.</p>}
                    {vitals.map(v => (
                      <div key={v.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600">{new Date(v.recordedAt).toLocaleString()}</span>
                          <span className="text-xs text-gray-400">by {v.recordedBy?.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {v.temperature && <span>🌡 {v.temperature}°C</span>}
                          {v.pulse && <span>💓 {v.pulse} bpm</span>}
                          {v.systolic && v.diastolic && <span>🩸 {v.systolic}/{v.diastolic} mmHg</span>}
                          {v.spo2 && <span>💨 SpO2 {v.spo2}%</span>}
                          {v.weight && <span>⚖ {v.weight}kg</span>}
                          {v.respRate && <span>🫁 {v.respRate}/min</span>}
                          {v.glucoseLevel && <span>🍬 {v.glucoseLevel} mmol/L</span>}
                        </div>
                        {v.notes && <p className="text-xs text-gray-400 mt-1 italic">{v.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record Vitals Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Record Vitals</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'temperature', label: 'Temperature (°C)', step: '0.1', placeholder: '37.0' },
                  { key: 'pulse', label: 'Pulse (bpm)', placeholder: '80' },
                  { key: 'systolic', label: 'Systolic BP (mmHg)', placeholder: '120' },
                  { key: 'diastolic', label: 'Diastolic BP (mmHg)', placeholder: '80' },
                  { key: 'spo2', label: 'SpO2 (%)', placeholder: '98' },
                  { key: 'respRate', label: 'Resp Rate (/min)', placeholder: '16' },
                  { key: 'weight', label: 'Weight (kg)', step: '0.1', placeholder: '25.0' },
                  { key: 'height', label: 'Height (cm)', step: '0.1', placeholder: '110' },
                  { key: 'glucoseLevel', label: 'Blood Glucose (mmol/L)', step: '0.1', placeholder: '5.5' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input type="number" step={f.step || '1'} placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nursing Notes</label>
                <textarea value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Any observations or concerns..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
