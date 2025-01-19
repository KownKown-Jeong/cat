import { useState, useEffect } from 'react'

interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token) // 토큰 확인용

        const response = await fetch('http://localhost:4000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        // 응답 상태 확인
        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error data:', errorData)
          throw new Error(
            errorData.error || '사용자 목록을 불러오는데 실패했습니다'
          )
        }

        const data = await response.json()
        console.log('Fetched users:', data) // 받아온 데이터 확인
        setUsers(data)
      } catch (error) {
        console.error('사용자 목록 로딩 중 에러:', error)
        setError(
          error instanceof Error
            ? error.message
            : '알 수 없는 에러가 발생했습니다'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 사용자를 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '사용자 삭제에 실패했습니다')
      }

      setUsers(users.filter((user) => user._id !== id))
      alert('사용자가 성공적으로 삭제되었습니다')
    } catch (error) {
      console.error('사용자 삭제 중 에러:', error)
      alert(
        error instanceof Error
          ? error.message
          : '사용자 삭제 중 오류가 발생했습니다'
      )
    }
  }

  // 사용자 수정 기능
  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('사용자 정보 수정에 실패했습니다')
      }

      // 사용자 목록 갱신
      setUsers(
        users.map((user) => (user._id === id ? { ...user, ...updates } : user))
      )
    } catch (error) {
      console.error('사용자 수정 중 에러:', error)
      alert(
        error instanceof Error ? error.message : '수정 중 오류가 발생했습니다'
      )
    }
  }

  // 역할 변경 기능
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:4000/api/users/${id}/role`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('역할 변경에 실패했습니다')
      }

      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, role: newRole } : user
        )
      )
    } catch (error) {
      console.error('역할 변경 중 에러:', error)
      alert(
        error instanceof Error
          ? error.message
          : '역할 변경 중 오류가 발생했습니다'
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
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium text-gray-500">
            <div className="col-span-3">Username</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Actions</div>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 사용자가 없습니다.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div className="col-span-3 font-medium">{user.username}</div>
                <div className="col-span-4">{user.email}</div>
                <div className="col-span-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleDelete(user._id)}
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
