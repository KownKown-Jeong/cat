import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('isAdmin', data.user.isAdmin)
        // 토큰 저장 및 context 업데이트
        login(data.token)

        // admin 페이지로 리다이렉트
        navigate('/admin')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#faf7f5]">
      {/* 헤더 영역 */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">CAT</span>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span>←</span>
          </button>
        </div>
      </header>
      <div className="flex items-center justify-center mt-8">
        <label
          htmlFor="username"
          className="w-20 text-3xl font-bold text-gray-700"
        >
          Login
        </label>
      </div>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center justify-center">
            <label
              htmlFor="username"
              className="w-20 text-xl font-bold text-gray-700"
            >
              ID
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-3/5 h-10 rounded-md border-gray-300 shadow-sm focus:border-[#6854C8] focus:ring-[#6854C8]"
              required
            />
          </div>

          <div className="flex items-center justify-center">
            <label
              htmlFor="password"
              className="w-20 text-xl font-bold text-gray-700"
            >
              PW
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-3/5 h-10 rounded-md border-gray-300 shadow-sm focus:border-[#6854C8] focus:ring-[#6854C8]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-[300px] mx-auto block p-3 bg-[#e5e2de] text-gray-800 rounded-full hover:bg-[#dad7d3] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-3xl font-medium border border-gray-200"
          >
            로그인
          </button>
        </form>
      </div>

      {/* 이거 꼼수야. 화면 가로로 유동적으로 운영하려는 거라서 넣음. 지우지마 */}
      <div className="text-[#faf7f5]">
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      </div>
    </div>
  )
}
