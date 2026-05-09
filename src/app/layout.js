import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'

export const metadata = {
  title: 'GSCH - Gweru Specialist Children\'s Hospital',
  description: 'Digital Document Management System for Gweru Specialist Children\'s Hospital',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <AppShell>
            {children}
            <Toaster position="top-right" />
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
