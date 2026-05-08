import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import WelcomeModal from '@/components/WelcomeModal'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <WelcomeModal />
    </div>
  )
}
