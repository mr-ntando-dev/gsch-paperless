import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'GSCH Paperless - Gweru Specialist Children\'s Hospital',
  description: 'Digital Document Management System for Gweru Specialist Children\'s Hospital',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
