import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

interface Message {
  text: string
  isUser?: boolean
}

export default function MissionChat() {
  const location = useLocation()
  const missionId = location.state?.missionId
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTyping, setCurrentTyping] = useState('')
  const [typing, setTyping] = useState(false)
  const [userInput, setUserInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const typeMessage = async (message: string) => {
    // 문장 단위로 분리 (마침표, 느낌표, 물음표로 구분)
    const sentences = message
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => sentence.trim() !== '')

    // 각 문장별로 타이핑 효과 적용
    for (const sentence of sentences) {
      let index = 0
      setTyping(true)
      setCurrentTyping('')

      await new Promise<void>((resolve) => {
        const typingInterval = setInterval(() => {
          if (index < sentence.length) {
            setCurrentTyping(sentence.slice(0, index + 1))
            index++
          } else {
            clearInterval(typingInterval)
            setTyping(false)
            setMessages((prev) => [...prev, { text: sentence, isUser: false }])
            setCurrentTyping('')
            resolve()
          }
        }, 50)
      })

      // 문장 사이 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 700))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || typing) return

    setMessages((prev) => [...prev, { text: userInput, isUser: true }])
    const currentInput = userInput
    setUserInput('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `/api/missions/${missionId}/chat/continue`,
        {
          message: currentInput,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // 백엔드에서 완성된 메시지를 받아서 문장별로 타이핑 효과 적용
      await typeMessage(response.data.message)
    } catch (error) {
      console.error('메시지 전송 오류:', error)
    }
  }

  // 컴포넌트 마운트 시 채팅 시작
  useEffect(() => {
    if (!missionId) return

    let isSubscribed = true // cleanup 플래그

    console.log('Sending chat start request...')
    const token = localStorage.getItem('token')

    if (isSubscribed) {
      // 요청 전 체크
      axios
        .post(
          `/api/missions/${missionId}/chat/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (isSubscribed) {
            // 응답 처리 전 체크
            console.log('Chat start response received:', response.data)
            typeMessage(response.data.message)
          }
        })
        .catch((error) => {
          if (isSubscribed) {
            console.error('채팅 초기화 오류:', error)
          }
        })
    }

    return () => {
      isSubscribed = false // cleanup
    }
  }, [])

  // 새 메시지나 타이핑 시 스크롤 자동으로 내리기
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentTyping])

  const completeMission = async () => {
    try {
      const response = await axios.post(`/api/missions/${missionId}/complete`)
      if (!response.data.ok) throw new Error(response.data.error)

      // 미션 완료 후 처리 (예: 알림 표시, 페이지 이동 등)
    } catch (error) {
      console.error('미션 완료 오류:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf7f5]">
      {/* 헤더 영역 */}
      <header className="w-full border-b border-gray-200 bg-white flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-900 hover:text-[#6854C8] transition-colors">
            CAT
          </div>
        </div>
      </header>
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {typing && <span className="animate-pulse">|</span>}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6854C8]"
            placeholder="메시지를 입력하세요..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#6854C8] text-white rounded-lg hover:bg-[#5843b7]"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  )
}
