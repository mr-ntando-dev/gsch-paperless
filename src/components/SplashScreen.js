'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [brand, setBrand] = useState({ siteName: 'MediFile', hospitalName: '', tagline: 'Digital Record System', logoUrl: null, footerText: '' })

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then(r => r.ok ? r.json() : {})
      .then(d => setBrand(b => ({ ...b, ...d })))
      .catch(() => {})

    const steps = [15, 35, 55, 72, 88, 100]
    let i = 0
    const tick = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(tick)
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(() => onDone?.(), 500)
        }, 300)
      }
    }, 180)
    return () => clearInterval(tick)
  }, [])

  const logoSrc = brand.logoUrl || '/logo.png'
  const nameParts = (brand.hospitalName || '').split(' ')
  const midpoint = Math.ceil(nameParts.length / 2)
  const line1 = nameParts.slice(0, midpoint).join(' ')
  const line2 = nameParts.slice(midpoint).join(' ')

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 60%, #f0f7f4 100%)' }}
    >
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #1e40af, transparent)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #065f46, transparent)', transform: 'translate(30%, 30%)' }} />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full animate-ping opacity-10" style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)', animationDuration: '2s' }} />
          <div className="absolute w-28 h-28 rounded-full animate-pulse opacity-15" style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)' }} />
          <div className="relative w-24 h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center border border-gray-100" style={{ boxShadow: '0 20px 60px rgba(29, 78, 216, 0.15), 0 4px 16px rgba(0,0,0,0.08)' }}>
            <Image src={logoSrc} alt="Logo" width={72} height={72} className="object-contain rounded-xl" priority />
          </div>
        </div>

        <div className="text-center">
          {brand.hospitalName ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">{line1}</h1>
              {line2 && <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: '#1d4ed8' }}>{line2}</h2>}
            </>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">{brand.siteName}</h1>
          )}
          <p className="text-xs text-gray-400 mt-2 font-medium tracking-widest uppercase">
            {brand.siteName} &middot; {brand.tagline}
          </p>
        </div>

        <div className="w-56">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)' }} />
          </div>
          <p className="text-center text-xs text-gray-300 mt-2 font-mono">{progress}%</p>
        </div>
      </div>

      <div className="absolute bottom-6 text-center">
        <p className="text-xs text-gray-300">{brand.footerText || `\u00A9 ${new Date().getFullYear()} ${brand.hospitalName || brand.siteName}`}</p>
      </div>
    </div>
  )
}
