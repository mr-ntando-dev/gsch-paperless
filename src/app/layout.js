import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata = {
  title: 'MediFile - Digital Record Management',
  description: 'Digital Record Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ThemeProvider>
            <AppShell>
              {children}
              <Toaster position="top-right" />
            </AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
