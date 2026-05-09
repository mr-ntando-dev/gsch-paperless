'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [width, setWidth] = useState(0)
  const prevPath = useRef(pathname)
  const timerRef = useRef(null)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      // Start loading bar
      setLoading(true)
      setWidth(0)

      let w = 0
      timerRef.current = setInterval(() => {
        w = Math.min(w + Math.random() * 20 + 8, 92)
        setWidth(w)
        if (w >= 92) clearInterval(timerRef.current)
      }, 100)

      // Complete after small delay
      const done = setTimeout(() => {
        clearInterval(timerRef.current)
        setWidth(100)
        setTimeout(() => {
          setLoading(false)
          setWidth(0)
        }, 300)
      }, 600)

      return () => {
        clearInterval(timerRef.current)
        clearTimeout(done)
      }
    }
  }, [pathname])

  if (!loading) return null

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9998] h-0.5">
        <div
          className="h-full transition-all duration-200 ease-out"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #06b6d4, #1d4ed8)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            boxShadow: '0 0 8px rgba(29, 78, 216, 0.6)'
          }}
        />
      </div>

      {/* Tiny logo spinner in corner */}
      <div className="fixed top-3 right-4 z-[9998] flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-3 py-1.5 shadow-lg">
        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 animate-pulse">
          <Image src="/logo.png" alt="Loading" width={20} height={20} className="object-contain" />
        </div>
        <span className="text-xs text-gray-500 font-medium">Loading...</span>
      </div>
    </>
  )
}
