'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const colorGradient = {
  blue:   'from-blue-600 to-blue-800',
  teal:   'from-teal-600 to-teal-800',
  green:  'from-green-600 to-green-800',
  yellow: 'from-yellow-500 to-yellow-700',
  orange: 'from-orange-500 to-orange-700',
  red:    'from-red-600 to-red-800',
  purple: 'from-purple-600 to-purple-800',
  gray:   'from-gray-600 to-gray-800',
  pink:   'from-pink-600 to-pink-800',
  indigo: 'from-indigo-600 to-indigo-800',
}

const roleLabel = {
  SUPERADMIN: { label: 'System Administrator', badge: 'bg-red-100 text-red-700' },
  ADMIN:      { label: 'Administrator',         badge: 'bg-orange-100 text-orange-700' },
  MANAGER:    { label: 'Manager',               badge: 'bg-yellow-100 text-yellow-700' },
  STAFF:      { label: 'Staff Member',          badge: 'bg-blue-100 text-blue-700' },
  VIEWER:     { label: 'Viewer',                badge: 'bg-gray-100 text-gray-600' },
}

export default function WelcomeModal() {
  const { data: session } = useSession()
  const [show, setShow] = useState(false)
  const [userData, setUserData] = useState(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data?.firstLogin) {
          setUserData(data)
          setShow(true)
        }
      })
      .catch(() => {})
  }, [session])

  const dismiss = async () => {
    await fetch('/api/me', { method: 'PATCH' })
    setShow(false)
  }

  if (!show || !userData) return null

  const dept = userData.department
  const deptCode = dept?.code || ''
  const gradient = colorGradient[dept?.color] || 'from-primary-600 to-primary-800'
  const role = roleLabel[userData.role] || roleLabel.STAFF
  const firstName = userData.name?.split(' ')[0] || userData.name

  // Role / dept-aware welcome headline and subtitle
  const getWelcomeText = () => {
    if (['SUPERADMIN', 'ADMIN'].includes(userData.role)) {
      return {
        headline: `Welcome back, ${firstName}! 🛡️`,
        sub: 'You have full system access. Manage users, departments, and all hospital operations from your dashboard.',
      }
    }
    if (userData.role === 'MANAGER') {
      return {
        headline: `Welcome, ${firstName}! 📋`,
        sub: `You have management access for the ${dept?.name || 'your'} department. Oversee tasks, documents, and your team.`,
      }
    }
    if (['PATIENT_CARE', 'CRD'].includes(deptCode)) {
      return {
        headline: `Welcome, ${firstName}! 🏥`,
        sub: `You are now set up in the ${dept?.name || 'Clinical'} department. You have access to patient records, admissions, medications, and more.`,
      }
    }
    if (deptCode === 'KITCHEN') {
      return {
        headline: `Welcome, ${firstName}! 🍽️`,
        sub: `You are set up in the ${dept?.name || 'Kitchen'} department. You will receive and manage meal requests for patients here.`,
      }
    }
    if (['BILLING', 'ACCOUNTS'].includes(deptCode)) {
      return {
        headline: `Welcome, ${firstName}! 💼`,
        sub: `You are set up in ${dept?.name || 'Finance'}. You have access to invoices, billing records, and financial documents.`,
      }
    }
    if (deptCode === 'IT') {
      return {
        headline: `Welcome, ${firstName}! 💻`,
        sub: `You are set up in ${dept?.name || 'IT'}. You can manage the IT asset inventory and handle system maintenance requests.`,
      }
    }
    if (deptCode === 'SAFETY_MAINTENANCE') {
      return {
        headline: `Welcome, ${firstName}! 🔧`,
        sub: `You are set up in ${dept?.name || 'Maintenance'}. Facility maintenance requests from across the hospital will come to you here.`,
      }
    }
    return {
      headline: `Welcome, ${firstName}! 👋`,
      sub: `Your account has been set up and you are now part of the Gweru Specialist Children's Hospital team.`,
    }
  }

  // Role / dept-aware feature list for step 1
  const getFeatureList = () => {
    const base = [
      { icon: '📄', title: 'Documents', desc: 'Create, track and manage documents for your department' },
      { icon: '✅', title: 'Tasks', desc: 'View and action tasks assigned to you' },
      { icon: '📝', title: 'Forms', desc: 'Fill out and submit digital forms' },
      { icon: '💬', title: 'Messages', desc: 'Communicate securely within your department' },
      { icon: '🏥', title: 'Department Board', desc: `View notices and announcements from ${dept?.shortName || 'your department'}` },
    ]
    if (['PATIENT_CARE', 'CRD'].includes(deptCode) || ['SUPERADMIN', 'ADMIN'].includes(userData.role)) {
      base.push({ icon: '🧒', title: 'Patient Care', desc: 'Access patient records, admissions, observations, vitals, medications and more' })
    }
    if (['BILLING', 'ACCOUNTS'].includes(deptCode) || ['SUPERADMIN', 'ADMIN'].includes(userData.role)) {
      base.push({ icon: '💰', title: 'Invoices', desc: 'Manage and track patient invoices and payment records' })
    }
    if (deptCode === 'KITCHEN' || ['SUPERADMIN', 'ADMIN'].includes(userData.role)) {
      base.push({ icon: '🍽️', title: 'Kitchen & Meals', desc: 'Receive and fulfil meal requests from ward staff' })
    }
    if (deptCode === 'SAFETY_MAINTENANCE' || ['SUPERADMIN', 'ADMIN'].includes(userData.role)) {
      base.push({ icon: '🔧', title: 'Maintenance', desc: 'Submit and track facility maintenance requests' })
    }
    if (['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(userData.role)) {
      base.push({ icon: '⚙️', title: 'Administration', desc: 'Manage users, departments, inventory, and system settings' })
    }
    return base
  }

  const welcomeText = getWelcomeText()
  const featureList = getFeatureList()

  const steps = [
    // Step 0 — big welcome
    <div key="welcome" className="text-center px-2">
      <div className="relative mb-6">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} mx-auto flex items-center justify-center shadow-lg`}>
          <span className="text-white text-4xl font-bold">{firstName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${role.badge} border`}>{role.label}</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
        {welcomeText.headline}
      </h2>
      <p className="text-gray-500 text-base leading-relaxed">
        {welcomeText.sub}
      </p>

      <div className={`mt-6 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white text-left`}>
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Your Department</p>
        <p className="text-2xl font-bold">{dept?.name || 'Unassigned'}</p>
        {dept?.description && <p className="text-white/80 text-sm mt-1">{dept.description}</p>}
      </div>
    </div>,

    // Step 1 — what you can do (personalised per dept/role)
    <div key="features" className="text-left px-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Here&apos;s what you can do</h2>
      <p className="text-gray-500 text-sm mb-5">Everything you need is in the sidebar on the left.</p>

      <div className="space-y-3">
        {featureList.map(item => (
          <div key={item.title} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 2 — ready
    <div key="ready" className="text-center px-2">
      <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">You&apos;re all set, {firstName}!</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        {['SUPERADMIN','ADMIN'].includes(userData.role)
          ? 'You have full administrative access. Your credentials are sensitive — keep them secure.'
          : userData.role === 'MANAGER'
          ? `You can manage your team in ${dept?.name || 'your department'}. Your credentials are sensitive — keep them secure.`
          : `Welcome to the ${dept?.name || 'GSCH'} team. Your login credentials were set up by your administrator. Keep them safe and do not share them.`
        }
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left mb-2">
        <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-2">Your account info</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-800">{userData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Department</span>
            <span className="font-medium text-gray-800">{dept?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${role.badge}`}>{role.label}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-400 text-xs">This welcome screen will not appear again after you close it.</p>
    </div>,
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top bar */}
        <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

        {/* Logo strip */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="GSCH" width={28} height={28} className="rounded" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">GSCH MediFile</span>
          </div>
          <span className="text-xs text-gray-300">{step + 1} / {steps.length}</span>
        </div>

        {/* Step dots */}
        <div className="flex justify-center space-x-1.5 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? `w-6 bg-gradient-to-r ${gradient}` : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-4 min-h-[340px] flex flex-col justify-center">
          {steps[step]}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex space-x-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              className={`flex-1 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md`}>
              Next
            </button>
          ) : (
            <button onClick={dismiss}
              className={`flex-1 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md`}>
              Get Started →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
