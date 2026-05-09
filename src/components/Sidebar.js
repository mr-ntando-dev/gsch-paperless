'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
  { name: 'Documents', href: '/dashboard/documents', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  { name: 'Forms', href: '/dashboard/forms', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z' },
  { name: 'Messages', href: '/dashboard/messages', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z' },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.073-.867a9.116 9.116 0 0 0-3.986 2.348l-.344.344a10.25 10.25 0 0 0-.566 1.003M11.42 15.17l-4.655 5.653a2.548 2.548 0 0 1-3.586-3.586l5.654-4.654' },
  { name: 'Reports', href: '/dashboard/reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
]

const patientCareItems = [
  { name: 'Patients', href: '/dashboard/patients', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0' },
  { name: 'Admissions', href: '/dashboard/admissions', icon: 'M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z' },
  { name: 'Observations', href: '/dashboard/observations', icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  { name: 'Medications', href: '/dashboard/medications', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.698-1.414 2.698H4.213c-1.444 0-2.414-1.698-1.414-2.698L4.2 15.3' },
  { name: 'Appointments', href: '/dashboard/appointments', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
  { name: 'Shift Roster', href: '/dashboard/shifts', icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z' },
  { name: 'Duty Roster', href: '/dashboard/duty-roster', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z' },
  { name: 'Vitals', href: '/dashboard/vitals', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z' },
  { name: 'Lab & Radiology', href: '/dashboard/lab-requests', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.698-1.414 2.698H4.213c-1.444 0-2.414-1.698-1.414-2.698L4.2 15.3' },
  { name: 'Pharmacy', href: '/dashboard/pharmacy', icon: 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  { name: 'Bed Management', href: '/dashboard/beds', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z' },
  { name: 'Day Care', href: '/dashboard/daycare', icon: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z' },
  { name: 'Baby Clinic', href: '/dashboard/baby-clinic', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z' },
  { name: 'Vaccinations', href: '/dashboard/vaccinations', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
  { name: 'Kitchen & Meals', href: '/dashboard/meals', icon: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 13.5l-3 3m0 0-3-3m3 3V21M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z' },
]

const adminItems = [
  { name: 'Users', href: '/dashboard/users', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
  { name: 'IT Inventory', href: '/dashboard/inventory', icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3' },
  { name: 'Dept Hierarchy', href: '/dashboard/hierarchy', icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6' },
]

// Department-based access rules
// Which dept codes can see Patient Care items
const PATIENT_CARE_DEPTS = ['PATIENT_CARE', 'CRD', 'MANAGEMENT', 'HOSPITAL_RELATIONS']
// Which dept codes can see Invoices
const BILLING_DEPTS = ['BILLING', 'ACCOUNTS', 'MANAGEMENT']
// Which dept codes can see Kitchen & Meals
const KITCHEN_DEPTS = ['KITCHEN', 'PATIENT_CARE', 'CRD', 'MANAGEMENT']
// Which dept codes can see IT Inventory (admin-only, handled separately)
// Which dept codes can see Pharmacy
const PHARMACY_DEPTS = ['PATIENT_CARE', 'CRD', 'MANAGEMENT']
// Which dept codes can see Lab & Radiology
const LAB_DEPTS = ['PATIENT_CARE', 'CRD', 'MANAGEMENT']

const HIERARCHY = {
  MANAGEMENT: { tier: 1, label: 'Executive', dot: 'bg-slate-600' },
  HOSPITAL_RELATIONS: { tier: 2, label: 'Relations', dot: 'bg-indigo-500' },
  CRD: { tier: 3, label: 'Clinical', dot: 'bg-blue-500' },
  PATIENT_CARE: { tier: 3, label: 'Clinical', dot: 'bg-teal-500' },
  BILLING: { tier: 4, label: 'Finance', dot: 'bg-green-500' },
  ACCOUNTS: { tier: 4, label: 'Finance', dot: 'bg-emerald-500' },
  IT: { tier: 4, label: 'Finance', dot: 'bg-purple-500' },
  KITCHEN: { tier: 5, label: 'Facilities', dot: 'bg-orange-500' },
  SAFETY_MAINTENANCE: { tier: 5, label: 'Facilities', dot: 'bg-red-500' },
}

function NavIcon({ path }) {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [departments, setDepartments] = useState([])
  const [deptOpen, setDeptOpen] = useState(true)
  const [siteSettings, setSiteSettings] = useState({ siteName: 'GSCH MediFile', logoUrl: null })
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const userDeptCode = session?.user?.departmentCode

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => setDepartments(Array.isArray(d) ? d.filter(x => x.isActive) : []))
      .catch(() => {})
    fetch('/api/admin/site-settings')
      .then(r => r.ok ? r.json() : { siteName: 'GSCH MediFile', logoUrl: null })
      .then(d => setSiteSettings(d))
      .catch(() => {})
  }, [])

  const sortedDepts = [...departments].sort((a, b) => {
    const tA = HIERARCHY[a.code]?.tier ?? 99
    const tB = HIERARCHY[b.code]?.tier ?? 99
    return tA - tB
  })

  const isActive = (href) => pathname === href

  const isAdminOrAbove = ['ADMIN', 'SUPERADMIN'].includes(userRole)
  const isManagerOrAbove = ['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(userRole)

  // Returns true if the current user can see a given section
  const canSeePatientCare = isAdminOrAbove || PATIENT_CARE_DEPTS.includes(userDeptCode)
  const canSeeBilling     = isAdminOrAbove || BILLING_DEPTS.includes(userDeptCode)
  const canSeeKitchen     = isAdminOrAbove || KITCHEN_DEPTS.includes(userDeptCode)
  const canSeePharmacy    = isAdminOrAbove || PHARMACY_DEPTS.includes(userDeptCode)
  const canSeeLab         = isAdminOrAbove || LAB_DEPTS.includes(userDeptCode)

  // Filter patient care items based on dept
  const visiblePatientCareItems = patientCareItems.filter(item => {
    if (item.href === '/dashboard/invoices')    return canSeeBilling
    if (item.href === '/dashboard/meals')       return canSeeKitchen
    if (item.href === '/dashboard/pharmacy')    return canSeePharmacy
    if (item.href === '/dashboard/lab-requests') return canSeeLab
    // All remaining patient care items require patient care access
    return canSeePatientCare
  })

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-64'} bg-white border-r border-gray-100 min-h-screen flex flex-col transition-all duration-300 relative z-10`}>
      {/* Header */}
      <div className="px-3 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
          {siteSettings.logoUrl ? (
            <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Image src="/logo.png" alt="GSCH" width={28} height={28} />
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{siteSettings.siteName || 'GSCH MediFile'}</p>
            <p className="text-[10px] text-gray-400">Digital Records System</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
          <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* User card */}
      {!collapsed && session?.user && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">{session.user.name?.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{session.user.name}</p>
              <p className="text-[10px] text-primary-500 truncate">{userRole} {userDeptCode ? `· ${userDeptCode}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-sm ${
                active ? 'bg-primary-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}>
              <NavIcon path={item.icon} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}

        {/* Patient Care — only shown to departments with access */}
        {visiblePatientCareItems.length > 0 && (
          <div className="pt-2">
            {!collapsed && <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-2.5 pb-1.5 pt-1">Patient Care</p>}
            {collapsed && <hr className="border-gray-100 my-2" />}
            {visiblePatientCareItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-sm ${
                    active ? 'bg-primary-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}>
                  <NavIcon path={item.icon} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        )}

        {/* Admin */}
        {['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole) && (
          <div className="pt-2">
            {!collapsed && <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-2.5 pb-1.5 pt-1">Administration</p>}
            {collapsed && <hr className="border-gray-100 my-2" />}
            {adminItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-sm ${
                    active ? 'bg-primary-600 text-white font-medium' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}>
                  <NavIcon path={item.icon} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        )}

        {/* Departments */}
        <div className="pt-2">
          {!collapsed ? (
            <button onClick={() => setDeptOpen(!deptOpen)}
              className="w-full flex items-center justify-between px-2.5 pb-1.5 pt-1">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Departments</span>
              <svg className={`w-3 h-3 text-gray-300 transition-transform ${deptOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          ) : (
            <hr className="border-gray-100 my-2" />
          )}

          {(deptOpen || collapsed) && (
            <div className="space-y-0.5">
              {sortedDepts.map((dept, idx) => {
                const h = HIERARCHY[dept.code]
                const isMyDept = dept.code === userDeptCode
                const active = pathname === `/dashboard/department/${dept.code}`
                const prevTier = idx > 0 ? (HIERARCHY[sortedDepts[idx - 1]?.code]?.tier ?? 99) : 0
                const thisTier = h?.tier ?? 99

                return (
                  <div key={dept.id}>
                    {!collapsed && thisTier !== prevTier && idx > 0 && (
                      <div className="flex items-center gap-2 px-2.5 py-1">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-[8px] text-gray-300 uppercase tracking-wider">{h?.label}</span>
                        <div className="h-px flex-1 bg-gray-100" />
                      </div>
                    )}
                    <Link href={`/dashboard/department/${dept.code}`} title={collapsed ? dept.name : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-xs ${
                        active ? 'bg-primary-50 text-primary-700 border border-primary-100 font-medium'
                          : isMyDept ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[8px] font-bold ${
                        active ? 'bg-primary-600 text-white' : isMyDept ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        {dept.shortName.substring(0, 2).toUpperCase()}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{dept.name}</span>
                          {h && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.dot}`} />}
                        </>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
        {userRole === 'SUPERADMIN' && (
          <Link href="/admin"
            className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-sm font-medium ${
              pathname.startsWith('/admin') ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-50'
            }`}>
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {!collapsed && <span>System Admin</span>}
          </Link>
        )}
        <Link href="/dashboard/profile" title={collapsed ? 'My Profile' : undefined}
          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-sm ${
            pathname === '/dashboard/profile' ? 'bg-primary-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}>
          <NavIcon path="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          {!collapsed && <span>My Profile</span>}
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
          <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
