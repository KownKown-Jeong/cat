import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface DialogueStep {
  message: string
  waitForInput?: boolean
  inputType?: 'username' | 'password'
}

interface Message {
  text: string
  isUser?: boolean
}

interface UserInput {
  username: string
  password: string
  teamName: string
}

export default function Welcome() {
  const { login } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [typing, setTyping] = useState(true)
  const [inputDisabled, setInputDisabled] = useState(true)
  const [userInput, setUserInput] = useState<UserInput>({
    username: '',
    password: '',
    teamName: '',
  })

  const dialogueSteps: DialogueStep[] = [
    {
      message: '안녕하세요! CAT 서비스에 오신 여러분 환영합니다.',
    },
    {
      message: 'CAT는 Culture, Art, Technology의 약자로',
    },
    {
      message: '문화, 예술, 기술을 하나로 묶어 모두가 즐길 수 있는...이 아니라',
    },
    {
      message: 'Culture Architect Tool의 약자로',
    },
    {
      message: '신임 CA간사 권권 선임이 효율적인 간사활동을 목적으로 만든',
    },
    {
      message: '최첨단 AI 기술이 접목된 플랫폼입니다.',
    },
    {
      message: '서비스 이용에 앞서 사전 동의를 구합니다.',
    },
    {
      message: '지금부터 여러분이 입력하시는 정보는 모두 기록됩니다.',
    },
    {
      message: 'Debug를 위해 개발자가 열람할 수 있다는 부분을 알려드립니다.',
    },
    {
      message: '동의하시면 "예"라고 입력해주세요',
      waitForInput: true,
    },
    {
      message: '향후 원활한 접속을 위해 몇 가지 정보가 필요합니다.',
    },
    {
      message: '팀이름(EP 기준)을 아주 정확히 입력해 주세요.',
    },
    {
      message: '잘못 기입하면 혼자 다른곳으로 보내집니다.',
      waitForInput: true,
      inputType: 'username',
    },
    {
      message: '아이디를 입력해 주세요. (한글 지원)',
      waitForInput: true,
      inputType: 'username',
    },
    {
      message: '비밀번호를 입력해 주세요. (한글 지원)',
      waitForInput: true,
      inputType: 'password',
    },
    {
      message: '확인 중입니다...',
      waitForInput: false,
    },
  ]

  const [messages, setMessages] = useState<Message[]>([])
  const [currentTyping, setCurrentTyping] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentTyping])

  useEffect(() => {
    if (currentStep >= dialogueSteps.length) return

    let index = 0
    setTyping(true)
    setCurrentTyping('')

    const typingInterval = setInterval(() => {
      if (index < dialogueSteps[currentStep].message.length) {
        setCurrentTyping(dialogueSteps[currentStep].message.slice(0, index + 1))
        index++
      } else {
        clearInterval(typingInterval)
        setTyping(false)

        if (dialogueSteps[currentStep].waitForInput) {
          setInputDisabled(false)
        } else {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { text: dialogueSteps[currentStep].message },
            ])
            setCurrentTyping('')
            setTimeout(() => {
              setCurrentStep((prev) => prev + 1)
            }, 1200)
          }, 300)
        }
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [currentStep])

  useEffect(() => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputDisabled])

  const handleInputSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && !typing && !inputDisabled) {
      const inputValue = e.currentTarget.value
      setMessages((prev) => [
        ...prev,
        { text: dialogueSteps[currentStep].message },
        { text: inputValue, isUser: true },
      ])
      setInputDisabled(true)
      setCurrentTyping('')

      if (currentStep === 9) {
        if (inputValue === '예') {
          setCurrentStep((prev) => prev + 1)
        } else {
          setTimeout(() => {
            setMessages([])
            setCurrentStep(0)
          }, 1000)
        }
      } else if (currentStep === 12) {
        const newTeamName = inputValue
        setUserInput((prev) => ({ ...prev, teamName: newTeamName }))
        setCurrentStep((prev) => prev + 1)
      } else if (currentStep === 13) {
        const newUsername = inputValue
        setUserInput((prev) => ({ ...prev, username: newUsername }))
        setCurrentStep((prev) => prev + 1)
      } else if (currentStep === 14) {
        const newPassword = inputValue
        setUserInput((prev) => {
          console.log('Register attempt with:', {
            teamName: prev.teamName,
            username: prev.username,
            password: newPassword,
          })
          return { ...prev, password: newPassword }
        })

        try {
          console.log('Sending register request...')
          const response = await fetch(
            `/api/auth/${userInput.teamName}/register`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                teamName: userInput.teamName,
                username: userInput.username,
                password: newPassword,
              }),
            }
          )

          console.log('Response received:', response.status)
          const data = await response.json()
          console.log('Response data:', data)

          if (!response.ok) {
            throw new Error(data.message || '팀 멤버는 팀 이름이 필수입니다.')
          }

          if (data.token) {
            console.log('Token received, saving...')
            await login(data.token)
            localStorage.setItem('token', data.token)
            localStorage.setItem('isAdmin', data.user.isAdmin)

            navigate('/user/UserHome')
          } else {
            throw new Error('토큰이 없습니다.')
          }
        } catch (error) {
          console.error('Register error:', error)
          const errorMessage =
            error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다'
          setMessages((prev) => [...prev, { text: errorMessage }])
          setCurrentStep(12)
        }
      }

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
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
          </div>
        </header>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
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
          <div ref={messagesEndRef} /> {/* 스크롤 위치 참조용 */}
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            className={`w-full p-3 border rounded-full ${
              inputDisabled ? 'bg-gray-100' : 'bg-white'
            }`}
            placeholder={
              inputDisabled
                ? '메시지를 기다리는 중...'
                : currentStep === 2
                  ? '아이디를 입력해주세요'
                  : '비밀번호를 입력해주세요'
            }
            onKeyPress={handleInputSubmit}
            disabled={inputDisabled}
            autoFocus={!inputDisabled}
          />
        </div>
      </div>
    </div>
  )
}
