import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AdminMissions from './ManageMissions'
import AdminUsers from './ManageUsers'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminHome() {
  const [activeComponent, setActiveComponent] = useState<string>('')
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin only</h1>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="로그아웃"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
        {activeComponent === 'missions' ? (
          <AdminMissions />
        ) : activeComponent === 'users' ? (
          <AdminUsers />
        ) : (
          <Outlet />
        )}
      </div>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8"></main>

      {/* 푸터 영역 */}
      <footer className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center space-x-4">
          <p className="text-sm text-gray-500">
            <button
              onClick={() => setActiveComponent('missions')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              미션 관리
            </button>
          </p>
          <p className="text-sm text-gray-500">
            <button
              onClick={() => setActiveComponent('users')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              사용자 관리
            </button>
          </p>
        </div>
      </footer>
      {/* 이거 꼼수야. 화면 가로로 유동적으로 운영하려는 거라서 넣음. 지우지마 */}
      <div className="text-[#faf7f5]">
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      </div>
    </div>
  )
}
