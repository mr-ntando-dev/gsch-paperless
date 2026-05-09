'use client'
import { useState } from 'react'
import SplashScreen from './SplashScreen'
import PageLoader from './PageLoader'

export default function AppShell({ children }) {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <PageLoader />
      <div className={`transition-opacity duration-300 ${splashDone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {children}
      </div>
    </>
  )
}
