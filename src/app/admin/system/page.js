export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Info</h2>
        <p className="text-gray-400 text-sm">MediFile — GSCH Internal System</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Access Control</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center space-x-2"><span className="text-red-400">●</span><span>Self-registration is disabled</span></li>
            <li className="flex items-center space-x-2"><span className="text-red-400">●</span><span>/admin path is SUPERADMIN-only and unlisted</span></li>
            <li className="flex items-center space-x-2"><span className="text-green-400">●</span><span>All users are created by admins</span></li>
            <li className="flex items-center space-x-2"><span className="text-green-400">●</span><span>Departments are fully dynamic</span></li>
            <li className="flex items-center space-x-2"><span className="text-green-400">●</span><span>Activity logging active</span></li>
          </ul>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Role Hierarchy</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span className="text-red-400 font-medium">SUPERADMIN</span><span className="text-gray-500 text-xs">Full system access, hidden</span></li>
            <li className="flex items-center justify-between"><span className="text-orange-400 font-medium">ADMIN</span><span className="text-gray-500 text-xs">Manage users & departments</span></li>
            <li className="flex items-center justify-between"><span className="text-yellow-400 font-medium">MANAGER</span><span className="text-gray-500 text-xs">Cross-dept visibility</span></li>
            <li className="flex items-center justify-between"><span className="text-blue-400 font-medium">STAFF</span><span className="text-gray-500 text-xs">Own department only</span></li>
            <li className="flex items-center justify-between"><span className="text-gray-400 font-medium">VIEWER</span><span className="text-gray-500 text-xs">Read-only access</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
