'use client'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export default function AdminBrandingPage() {
  const [settings, setSettings] = useState({ siteName: 'MediFile', logoUrl: null, hospitalName: '', tagline: '', footerText: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [tagline, setTagline] = useState('')
  const [footerText, setFooterText] = useState('')
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setSiteName(data.siteName || 'MediFile')
        setHospitalName(data.hospitalName || '')
        setTagline(data.tagline || '')
        setFooterText(data.footerText || '')
        setPreview(data.logoUrl || null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!siteName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName }),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast.success('Site name updated! Refresh any open pages to see the change.')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBranding = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName, tagline, footerText }),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast.success('Branding updated! Refresh other pages to see changes.')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Local preview before upload
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error('Choose a file first'); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await fetch('/api/admin/upload-logo', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setSettings(s => ({ ...s, logoUrl: data.logoUrl }))
        setPreview(data.logoUrl)
        toast.success('Logo updated! Refresh any open pages to see the change.')
        // Reset file input
        if (fileRef.current) fileRef.current.value = ''
      } else {
        const d = await res.json()
        toast.error(d.error || 'Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove the custom logo and revert to default?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: null }),
      })
      if (res.ok) {
        setSettings(s => ({ ...s, logoUrl: null }))
        setPreview(null)
        if (fileRef.current) fileRef.current.value = ''
        toast.success('Logo removed — default logo restored.')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to remove logo')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Site Branding</h2>
        <p className="text-gray-400 text-sm mt-1">Customise the site name and logo displayed across the entire system.</p>
      </div>

      {/* Current Logo Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Current Branding</h3>
        <div className="flex items-center gap-5 p-4 bg-gray-950 rounded-xl border border-gray-800">
          {preview ? (
            <img src={preview} alt="Site Logo" className="h-12 w-auto object-contain rounded" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-white font-bold text-lg">{settings.siteName}</p>
            <p className="text-gray-500 text-xs">{preview ? 'Custom logo active' : 'Default icon active'}</p>
          </div>
        </div>
      </div>

      {/* Site Name */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-1">Site Name</h3>
        <p className="text-gray-500 text-xs mb-4">Shown in the sidebar, browser tab title, and system header.</p>
        <form onSubmit={handleSaveName} className="flex gap-3">
          <input
            type="text"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            maxLength={60}
            placeholder="e.g. MediFile, GSCH DMS, ..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={saving || !siteName.trim() || siteName.trim() === settings.siteName}
            className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Logo Upload */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-1">Hospital Identity</h3>
        <p className="text-gray-500 text-xs mb-4">Shown on the login page, splash screen, and footer. Clear fields to remove branding.</p>
        <form onSubmit={handleSaveBranding} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hospital / Organisation Name</label>
            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} maxLength={100} placeholder="e.g. Gweru Specialist Children's Hospital" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 placeholder:text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tagline</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={80} placeholder="e.g. Digital Record System" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 placeholder:text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Footer Text</label>
            <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} maxLength={120} placeholder="e.g. © 2026 Your Hospital Name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 placeholder:text-gray-600" />
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </form>
      </div>

      {/* Logo Upload */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-1">Site Logo</h3>
        <p className="text-gray-500 text-xs mb-4">Upload a PNG, JPG, WebP or SVG. Max 2 MB. Recommended height: 48 px.</p>

        <div className="space-y-4">
          {/* Drop zone / file picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-red-600 rounded-xl p-8 text-center cursor-pointer transition-colors group"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto h-16 object-contain rounded mb-2" />
            ) : (
              <svg className="mx-auto w-10 h-10 text-gray-600 group-hover:text-red-500 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            )}
            <p className="text-gray-400 text-sm">{preview ? 'Click to change logo' : 'Click to select logo file'}</p>
            <p className="text-gray-600 text-xs mt-1">PNG · JPG · WebP · SVG · GIF</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
            onChange={handleLogoChange}
            className="hidden"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLogoUpload}
              disabled={uploading || !fileRef.current?.files?.[0]}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>
            {settings.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={saving}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-4 text-yellow-400 text-xs">
        <span className="font-semibold">Note:</span> After saving changes, all users must refresh their browser page to see the updated branding.
      </div>
    </div>
  )
}
