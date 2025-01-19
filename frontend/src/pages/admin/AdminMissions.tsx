// src/pages/admin/AdminMissions.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Mission {
  id: string
  title: string
  isPublic: boolean
  introduction?: string
  mainContent: string
  examples: string[]
  conclusion?: string
}

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Missions Management
          </h1>
          
          <Link
            to="/admin/missions/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Mission
          </Link>
        </div>

        {/* 미션 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium text-gray-500">
            <div className="col-span-4">Title</div>
            <div className="col-span-4">Content Preview</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {missions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No missions created yet. Create your first mission!
            </div>
          ) : (
            missions.map(mission => (
              <div key={mission.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50">
                <div className="col-span-4 font-medium">{mission.title}</div>
                <div className="col-span-4 truncate text-gray-500">
                  {mission.mainContent}
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    mission.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mission.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="col-span-2 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}