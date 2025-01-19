// src/pages/admin/AdminMissions.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Mission {
  _id: string
  title: string
  isPublic: boolean
  introduction?: string
  mainContent: string
  examples: string[]
  conclusion?: string
}

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:4000/api/missions', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('미션 목록을 불러오는데 실패했습니다')
        }

        const data = await response.json()
        setMissions(data)
      } catch (error) {
        console.error('미션 목록 로딩 중 에러:', error)
        setError(
          error instanceof Error
            ? error.message
            : '알 수 없는 에러가 발생했습니다'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('token')
      console.log('Mission ID type:', typeof id, 'Value:', id)

      const response = await fetch(`http://localhost:4000/api/missions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      console.log('Delete Response Status:', response.status)
      const responseData = await response.json()
      console.log('Delete Response Data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || '미션 삭제에 실패했습니다')
      }

      setMissions(missions.filter((mission) => mission._id !== id))
      alert('미션이 성공적으로 삭제되었습니다')
    } catch (error) {
      console.error('미션 삭제 중 에러:', error)
      alert(
        error instanceof Error
          ? error.message
          : '미션 삭제 중 오류가 발생했습니다'
      )
    }
  }

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#faf7f5] p-8">
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
            missions.map((mission) => (
              <div
                key={mission._id}
                className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div className="col-span-4 font-medium">{mission.title}</div>
                <div className="col-span-4 truncate text-gray-500">
                  {mission.mainContent}
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      mission.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {mission.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="col-span-2 space-x-2">
                  <Link
                    to={`/admin/missions/edit/${mission._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(mission._id)}
                    className="text-red-600 hover:text-red-800"
                  >
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
