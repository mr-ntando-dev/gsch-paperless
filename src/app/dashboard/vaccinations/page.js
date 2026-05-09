'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const EPI_SCHEDULE = [
  { vaccine: 'BCG', dose: '1st', ageWeeks: 0, site: 'Right upper arm' },
  { vaccine: 'OPV', dose: '0', ageWeeks: 0, site: 'Oral' },
  { vaccine: 'OPV', dose: '1st', ageWeeks: 6, site: 'Oral' },
  { vaccine: 'DTP-HepB-Hib', dose: '1st', ageWeeks: 6, site: 'Left thigh' },
  { vaccine: 'Rotavirus', dose: '1st', ageWeeks: 6, site: 'Oral' },
  { vaccine: 'PCV13', dose: '1st', ageWeeks: 6, site: 'Right thigh' },
  { vaccine: 'OPV', dose: '2nd', ageWeeks: 10, site: 'Oral' },
  { vaccine: 'DTP-HepB-Hib', dose: '2nd', ageWeeks: 10, site: 'Left thigh' },
  { vaccine: 'Rotavirus', dose: '2nd', ageWeeks: 10, site: 'Oral' },
  { vaccine: 'PCV13', dose: '2nd', ageWeeks: 10, site: 'Right thigh' },
  { vaccine: 'OPV', dose: '3rd', ageWeeks: 14, site: 'Oral' },
  { vaccine: 'DTP-HepB-Hib', dose: '3rd', ageWeeks: 14, site: 'Left thigh' },
  { vaccine: 'IPV', dose: '1st', ageWeeks: 14, site: 'Left thigh' },
  { vaccine: 'PCV13', dose: '3rd', ageWeeks: 14, site: 'Right thigh' },
  { vaccine: 'Measles-Rubella', dose: '1st', ageWeeks: 36, site: 'Right upper arm' },
  { vaccine: 'Measles-Rubella', dose: '2nd', ageWeeks: 72, site: 'Right upper arm' },
]

const EMPTY_F = { babyName: '', dob: '', parentName: '', parentPhone: '', vaccine: '', dose: '1st', batchNo: '', site: '', givenBy: '', givenDate: '', nextDueDate: '', notes: '' }

export default function VaccinationsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_F)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('records') // records | schedule

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('babyName', search)
      const r = await fetch('/api/vaccinations?' + params)
      if (r.ok) setRecords(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/vaccinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('Vaccination recorded'); setShowForm(false); setForm(EMPTY_F); load() }
      else { const d = await r.json(); toast.error(d.error || 'Failed') }
    } finally { setSaving(false) }
  }

  const fillFromEPI = (item) => {
    const today = new Date().toISOString().split('T')[0]
    setForm(f => ({ ...f, vaccine: item.vaccine, dose: item.dose, site: item.site, givenDate: today }))
    setShowForm(true)
  }

  // Group records by baby
  const babies = records.reduce((acc, r) => {
    const key = r.babyName + '_' + r.dob
    if (!acc[key]) acc[key] = { name: r.babyName, dob: r.dob, parentName: r.parentName, parentPhone: r.parentPhone, records: [] }
    acc[key].records.push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vaccination Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">EPI immunisation tracking for baby clinic</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Record Vaccination
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[['records', 'Records'], ['schedule', 'EPI Schedule']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (tab === v ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>{l}</button>
          ))}
        </div>
        {tab === 'records' && <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by baby name..." className="input-field text-sm max-w-xs" />}
      </div>

      {tab === 'schedule' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Zimbabwe EPI Immunisation Schedule</h2>
            <p className="text-xs text-gray-500 mt-0.5">Standard schedule — click any row to pre-fill a new vaccination record</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide"><th className="text-left px-5 py-3">Vaccine</th><th className="text-left px-5 py-3">Dose</th><th className="text-left px-5 py-3">Age</th><th className="text-left px-5 py-3">Site</th><th className="px-5 py-3"></th></tr></thead>
              <tbody>
                {EPI_SCHEDULE.map((item, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{item.vaccine}</td>
                    <td className="px-5 py-3 text-gray-600">{item.dose}</td>
                    <td className="px-5 py-3 text-gray-600">{item.ageWeeks === 0 ? 'At birth' : `${item.ageWeeks} weeks`}</td>
                    <td className="px-5 py-3 text-gray-500">{item.site}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => fillFromEPI(item)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Record →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
              : Object.keys(babies).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No vaccination records yet.</p>
                </div>
              ) : Object.entries(babies).map(([key, baby]) => (
                <div key={key} className={'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ' + (selected === key ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100')} onClick={() => setSelected(selected === key ? null : key)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{baby.name}</p>
                        <p className="text-xs text-gray-400">DOB: {baby.dob} · {baby.parentName} · {baby.parentPhone}</p>
                      </div>
                    </div>
                    <span className="badge bg-pink-100 text-pink-700 text-xs">{baby.records.length} dose{baby.records.length !== 1 ? 's' : ''}</span>
                  </div>
                  {selected === key && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        {baby.records.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{r.vaccine} <span className="font-normal text-gray-500">({r.dose})</span></p>
                              <p className="text-[11px] text-gray-400">{r.givenDate} · by {r.givenBy} {r.site ? `· ${r.site}` : ''}</p>
                            </div>
                            <div className="text-right">
                              {r.nextDueDate && <p className="text-[11px] text-amber-600 font-medium">Next: {r.nextDueDate}</p>}
                              {r.batchNo && <p className="text-[10px] text-gray-400">Batch: {r.batchNo}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div>
            {showForm ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 text-sm">Record Vaccination</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-3">
                  <div><label className="text-xs text-gray-500 font-medium">Baby&apos;s Name *</label><input required value={form.babyName} onChange={e => setForm({ ...form, babyName: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-500 font-medium">Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="input-field text-sm mt-1" /></div>
                    <div><label className="text-xs text-gray-500 font-medium">Given Date *</label><input required type="date" value={form.givenDate} onChange={e => setForm({ ...form, givenDate: e.target.value })} className="input-field text-sm mt-1" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 font-medium">Parent/Guardian</label><input value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">Phone</label><input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-500 font-medium">Vaccine *</label><input required value={form.vaccine} onChange={e => setForm({ ...form, vaccine: e.target.value })} placeholder="e.g. BCG" className="input-field text-sm mt-1" /></div>
                    <div><label className="text-xs text-gray-500 font-medium">Dose</label><input value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} placeholder="1st, 2nd..." className="input-field text-sm mt-1" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-500 font-medium">Site</label><input value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} placeholder="e.g. Left thigh" className="input-field text-sm mt-1" /></div>
                    <div><label className="text-xs text-gray-500 font-medium">Batch No.</label><input value={form.batchNo} onChange={e => setForm({ ...form, batchNo: e.target.value })} className="input-field text-sm mt-1" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 font-medium">Given By *</label><input required value={form.givenBy} onChange={e => setForm({ ...form, givenBy: e.target.value })} placeholder="Nurse / Doctor" className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">Next Due Date</label><input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} className="input-field text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500 font-medium">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field text-sm mt-1 resize-none" /></div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-xs text-gray-600">Total doses recorded</span><span className="badge bg-pink-100 text-pink-700 text-xs">{records.length}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-xs text-gray-600">Unique babies</span><span className="badge bg-teal-100 text-teal-700 text-xs">{Object.keys(babies).length}</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-xs text-gray-600">With next due date</span><span className="badge bg-amber-100 text-amber-700 text-xs">{records.filter(r => r.nextDueDate).length}</span></div>
                </div>
                <button onClick={() => setTab('schedule')} className="w-full btn-secondary text-xs text-center">View EPI Schedule →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
