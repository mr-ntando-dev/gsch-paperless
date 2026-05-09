'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TYPE_COLORS = { ADMISSION: 'bg-red-100 text-red-700 border-red-200', OBSERVATION: 'bg-yellow-100 text-yellow-700 border-yellow-200', DAYCARE: 'bg-blue-100 text-blue-700 border-blue-200', INVOICE: 'bg-green-100 text-green-700 border-green-200' }
const TYPE_ICONS = {
  ADMISSION: 'M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
  OBSERVATION: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  DAYCARE: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  INVOICE: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z',
}

export default function PatientHistoryPage() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/patients/${params.id}/history`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-center py-20 text-gray-400">Loading patient history...</div>
  if (!data) return <div className="text-center py-20 text-gray-500">Patient not found.</div>

  const { patient, timeline } = data
  const age = patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patients" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-gray-500">{patient.patientId}{age ? ` · ${age} years old` : ''} · {patient.careType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Patient Details</h3>
          <div className="space-y-2">
            {[
              ['Gender', patient.gender], ['Blood Type', patient.bloodType],
              ['Guardian', patient.guardianName], ['Phone', patient.guardianPhone],
              ['Address', patient.address],
            ].filter(([, v]) => v && v !== 'UNKNOWN').map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-xs text-gray-400">{k}</span>
                <span className="text-xs text-gray-700 font-medium">{v}</span>
              </div>
            ))}
            {patient.allergies && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-2 mt-2">
                <p className="text-xs text-red-600 font-semibold">Allergies</p>
                <p className="text-xs text-red-700 mt-0.5">{patient.allergies}</p>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label: 'Admissions', value: data.patient.admissions?.length || 0, color: 'bg-red-50 text-red-700' },
              { label: 'Observations', value: data.patient.observations?.length || 0, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Day Care', value: data.patient.dayCareRecords?.length || 0, color: 'bg-blue-50 text-blue-700' },
              { label: 'Invoices', value: data.patient.invoices?.length || 0, color: 'bg-green-50 text-green-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] opacity-70">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex gap-2 flex-wrap">
            <Link href={`/dashboard/admissions?patient=${patient.id}`} className="btn-secondary text-xs flex-1 text-center">Admit</Link>
            <Link href={`/dashboard/invoices?patient=${patient.id}`} className="btn-secondary text-xs flex-1 text-center">Invoice</Link>
            <Link href={`/dashboard/medications?patientId=${patient.id}`} className="btn-secondary text-xs flex-1 text-center">Meds</Link>
          </div>
          {/* QR Wristband */}
          <div className="pt-2">
            <button onClick={() => {
              const win = window.open('', '_blank', 'width=400,height=300')
              win.document.write(`<!DOCTYPE html><html><head><title>Wristband - ${patient.firstName} ${patient.lastName}</title><script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script></head><body style="font-family:sans-serif;padding:16px;max-width:350px;margin:0 auto">
<h3 style="font-size:13px;margin:0 0 4px">${patient.firstName} ${patient.lastName}</h3>
<p style="font-size:11px;color:#666;margin:0 0 2px">ID: ${patient.patientId}</p>
<p style="font-size:11px;color:#666;margin:0 0 8px">DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
${patient.bloodType ? `<p style="font-size:11px;font-weight:bold;color:#dc2626;margin:0 0 8px">Blood: ${patient.bloodType}</p>` : ''}
${patient.allergies ? `<p style="font-size:10px;background:#fee2e2;padding:4px 8px;border-radius:4px;color:#dc2626;margin:0 0 8px">Allergies: ${patient.allergies}</p>` : ''}
<canvas id="qr"></canvas>
<p style="font-size:9px;color:#999;margin-top:4px">Scan to open full record</p>
<script>QRCode.toCanvas(document.getElementById('qr'),'${window.location.origin}/dashboard/patients/${patient.id}',{width:120,margin:1},function(){})<\/script>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`)
              win.document.close()
            }} className="w-full btn-secondary text-xs flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /></svg>
              Print Wristband QR
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Visit Timeline</h3>
          {timeline.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-sm">No history yet.</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200"></div>
              {timeline.map((item, i) => (
                <div key={item.id} className="relative flex gap-4 pb-4">
                  <div className={`relative z-10 w-10 h-10 rounded-xl border flex-shrink-0 flex items-center justify-center ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[item.type] || ''} />
                    </svg>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`badge text-xs ${TYPE_COLORS[item.type] || 'bg-gray-100'}`}>{item.type}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(item.date).toLocaleDateString('en-ZW')}</p>
                      </div>
                    </div>
                    {/* Vitals snippet for observations */}
                    {item.type === 'OBSERVATION' && item.meta?.vitals && Array.isArray(item.meta.vitals) && item.meta.vitals.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 mb-1">Latest vitals</p>
                        <div className="flex gap-3 text-xs text-gray-600">
                          {Object.entries(item.meta.vitals[item.meta.vitals.length - 1]).filter(([k]) => !['recordedAt','recordedBy'].includes(k)).map(([k, v]) => (
                            <span key={k}>{k}: <strong>{v}</strong></span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
