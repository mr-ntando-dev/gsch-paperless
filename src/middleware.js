import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Department access rules — mirrors the frontend Sidebar rules
const PATIENT_CARE_DEPTS = ['PATIENT_CARE', 'CRD', 'MANAGEMENT', 'HOSPITAL_RELATIONS']
const BILLING_DEPTS      = ['BILLING', 'ACCOUNTS', 'MANAGEMENT']
const KITCHEN_DEPTS      = ['KITCHEN', 'PATIENT_CARE', 'CRD', 'MANAGEMENT']
const PHARMACY_DEPTS     = ['PATIENT_CARE', 'CRD', 'MANAGEMENT']
const LAB_DEPTS          = ['PATIENT_CARE', 'CRD', 'MANAGEMENT']

// Routes that are restricted by department
const RESTRICTED_ROUTES = [
  { prefix: '/dashboard/patients',    allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/admissions',  allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/observations',allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/medications', allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/appointments',allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/shifts',      allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/duty-roster', allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/vitals',      allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/daycare',     allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/baby-clinic', allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/vaccinations',allowed: PATIENT_CARE_DEPTS },
  { prefix: '/dashboard/invoices',    allowed: BILLING_DEPTS },
  { prefix: '/dashboard/meals',       allowed: KITCHEN_DEPTS },
  { prefix: '/dashboard/pharmacy',    allowed: PHARMACY_DEPTS },
  { prefix: '/dashboard/lab-requests',allowed: LAB_DEPTS },
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // /admin/* is SUPERADMIN only - redirect everyone else silently
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // /register is disabled - redirect to login
    if (pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Department-based route access control
    // Admins and superadmins bypass all dept restrictions
    const isAdminOrAbove = ['ADMIN', 'SUPERADMIN'].includes(token?.role)
    if (!isAdminOrAbove) {
      const deptCode = token?.departmentCode || ''
      for (const route of RESTRICTED_ROUTES) {
        if (pathname.startsWith(route.prefix)) {
          if (!route.allowed.includes(deptCode)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
          break
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/register'],
}
