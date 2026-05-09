'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const steps = [15, 35, 55, 72, 88, 100]
    let i = 0
    const tick = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(tick)
        // Brief pause at 100% then fade out
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(() => onDone?.(), 500)
        }, 300)
      }
    }, 180)
    return () => clearInterval(tick)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 60%, #f0f7f4 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #1e40af, transparent)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #065f46, transparent)', transform: 'translate(30%, 30%)' }} />

      {/* Logo container */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Pulsing ring behind logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full animate-ping opacity-10" style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)', animationDuration: '2s' }} />
          <div className="absolute w-28 h-28 rounded-full animate-pulse opacity-15" style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)' }} />

          {/* Logo card */}
          <div className="relative w-24 h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center border border-gray-100" style={{ boxShadow: '0 20px 60px rgba(29, 78, 216, 0.15), 0 4px 16px rgba(0,0,0,0.08)' }}>
            <Image
              src="/logo.png"
              alt="GSCH Logo"
              width={72}
              height={72}
              className="object-contain rounded-xl"
              priority
            />
          </div>
        </div>

        {/* Hospital name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">
            Gweru Specialist
          </h1>
          <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: '#1d4ed8' }}>
            Children&apos;s Hospital
          </h2>
          <p className="text-xs text-gray-400 mt-2 font-medium tracking-widest uppercase">
            MediFile · Digital Record System
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-56">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)'
              }}
            />
          </div>
          <p className="text-center text-xs text-gray-300 mt-2 font-mono">{progress}%</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-xs text-gray-300">© {new Date().getFullYear()} Gweru Specialist Children&apos;s Hospital</p>
      </div>
    </div>
  )
}
