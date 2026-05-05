'use client'

const mockAdmissions = [
  { id: 1, patient: 'Tendai Moyo', ward: 'Paediatric A', doctor: 'Dr. Moyo', admitDate: '2024-03-10', status: 'Active', diagnosis: 'Pneumonia' },
  { id: 2, patient: 'Chipo Ndlovu', ward: 'Paediatric B', doctor: 'Dr. Chirwa', admitDate: '2024-03-12', status: 'Active', diagnosis: 'Malaria' },
  { id: 3, patient: 'Kudzai Zimba', ward: 'Surgical', doctor: 'Dr. Sibanda', admitDate: '2024-03-08', status: 'Discharged', diagnosis: 'Appendicitis' },
  { id: 4, patient: 'Tatenda Mhlanga', ward: 'ICU', doctor: 'Dr. Moyo', admitDate: '2024-03-14', status: 'Critical', diagnosis: 'Severe dehydration' },
  { id: 5, patient: 'Rudo Chirwa', ward: 'Paediatric A', doctor: 'Dr. Ndlovu', admitDate: '2024-03-13', status: 'Active', diagnosis: 'Fracture - Left arm' },
]

export default function AdmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admissions Register</h1>
        <p className="text-sm text-gray-500 mt-1">Digital admission and discharge tracking</p>
      </div>

      {/* Ward Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['Paediatric A', 'Paediatric B', 'ICU', 'Neonatal', 'Surgical'].map((ward) => (
          <div key={ward} className="card text-center">
            <p className="text-xs text-gray-500 font-medium">{ward}</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">
              {Math.floor(Math.random() * 10) + 2}
            </p>
            <p className="text-xs text-gray-400">patients</p>
          </div>
        ))}
      </div>

      {/* Admissions Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Admit Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockAdmissions.map((admission) => (
              <tr key={admission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{admission.patient}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{admission.ward}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{admission.doctor}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{admission.diagnosis}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{admission.admitDate}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    admission.status === 'Active' ? 'bg-green-100 text-green-700' :
                    admission.status === 'Critical' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{admission.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
