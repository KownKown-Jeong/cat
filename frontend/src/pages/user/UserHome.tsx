import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
  text: string
  isUser?: boolean
}

interface Mission {
  _id: string
  title: string
  isPublic: boolean
}

export default function Home() {
  const navigate = useNavigate()
  const { login, token, logout } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTyping, setCurrentTyping] = useState('')
  const [inputDisabled, setInputDisabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [missions, setMissions] = useState<Mission[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentTyping])

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch('/api/missions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error('미션을 불러오는데 실패했습니다')
        const data = await response.json()
        setMissions(data)
      } catch (error) {
        console.error('미션을 불러오는데 실패했습니다:', error)
      }
    }

    fetchMissions()
  }, [token])

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !inputDisabled) {
      const inputValue = e.currentTarget.value
      setMessages((prev) => [...prev, { text: inputValue, isUser: true }])

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleMissionClick = (missionId: string) => {
    navigate('/user/missions', { state: { missionId: missionId } })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen w-full flex items-top justify-center bg-[#faf7f5] fixed inset-0">
      <div className="h-full flex flex-col bg-[#faf7f5] w-full">
        {/* 헤더 영역 */}
        <header className="w-full border-b border-gray-200 bg-white flex-shrink-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-900 hover:text-[#6854C8] transition-colors">
              CAT
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-[#6854C8] rounded-md hover:bg-[#5843b7] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          <div className="flex flex-col space-y-3 mb-4 max-w-2xl mx-auto">
            {missions.map((mission) => (
              <button
                key={mission._id}
                onClick={() => handleMissionClick(mission._id)}
                className="w-full bg-white rounded-lg p-4 shadow-md 
                         hover:shadow-lg transition-all duration-200 
                         hover:bg-gray-50 hover:translate-x-1
                         text-left border border-gray-100"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {mission.title}
                </h3>
              </button>
            ))}
          </div>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-fit rounded-lg p-4 shadow-md ${
                  msg.isUser
                    ? 'bg-[#6854C8] text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {currentTyping && (
            <div className="flex justify-start">
              <div className="max-w-fit bg-white rounded-lg p-4 shadow-md">
                {currentTyping}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            className={`w-full p-3 border rounded-full ${
              inputDisabled ? 'bg-gray-100' : 'bg-white'
            }`}
            placeholder="메시지를 입력하세요..."
            onKeyPress={handleInputSubmit}
            disabled={inputDisabled}
          />
        </div>
      </div>
    </div>
  )
}
