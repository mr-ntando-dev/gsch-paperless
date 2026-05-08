'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) toast.error('Invalid email or password')
      else { toast.success('Welcome back!'); router.push('/dashboard'); router.refresh() }
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-primary-300 blur-2xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20 overflow-hidden">
            <Image src="/logo.png" alt="GSCH" width={80} height={80} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 leading-tight">GSCH MediFile</h1>
          <p className="text-primary-300 text-lg">Gweru Specialist Children's Hospital</p>
          <div className="mt-10 space-y-3 text-left">
            {[
              { label: 'Paperless Records', desc: 'All hospital documents digitised' },
              { label: 'Cross-Department Routing', desc: 'Seamless inter-department workflow' },
              { label: 'Role-Based Access', desc: 'Secure, audited access control' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <span className="text-white text-sm font-medium">{item.label}</span>
                  <span className="text-primary-300 text-xs ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-primary-400 text-xs">© 2026 Gweru Specialist Children's Hospital</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-3 overflow-hidden">
              <Image src="/logo.png" alt="GSCH" width={56} height={56} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">GSCH MediFile</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">Sign in to access your department</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all"
                  placeholder="your.name@gsch.co.zw" required autoComplete="email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all"
                  placeholder="••••••••" required autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg><span>Sign In</span></>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-gray-500 text-center">Account access is managed by your administrator.</p>
              <p className="text-xs text-gray-400 text-center mt-0.5">Contact IT or Management for login issues.</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-8">© 2026 Gweru Specialist Children's Hospital · MediFile v2</p>
        </div>
      </div>
    </div>
  )
}
