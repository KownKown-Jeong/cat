// src/pages/Home.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [currentText, setCurrentText] = useState('냐옹')
  const [isVisible, setIsVisible] = useState(true)
  const [isVertical, setIsVertical] = useState(
    window.innerHeight > window.innerWidth
  )

  const texts = [
    '미야옹',
    '전 CAT예옹',
    '어서오세옹',
    '냐야옹',
    '오늘도 즐겨옹',
    '아프지마용',
    '아래 시작 버튼을',
    '눌러 보세옹',
    '미야옹',
    '전 고양이예옹',
    '어서오세옹',
    '냐야옹',
    '시작이 어때옹',
    '커피 한잔 했나옹',
    '아래 시작을',
    '눌러 보세옹',
    '냐옹',
    '나는 낭만고양이',
    '슬픈 도시를 비춰',
    '춤추는 작은 별빛',
    '에췽',
    '고양이가 좋아하는',
    '랜덤 게임 랜덤 게임',
    '게임 스타트',
    '아파트 아파트',
    '아파트 아파트',
  ]

  useEffect(() => {
    let currentIndex = 0

    const interval = setInterval(() => {
      setIsVisible(false) // 페이드 아웃 시작

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length
        setCurrentText(texts[currentIndex])
        setIsVisible(true) // 페이드 인 시작
      }, 1500) // 페이드 아웃 후 텍스트 변경
    }, 5000) // 5초마다 텍스트 변경

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight
      const width = window.innerWidth
      const isVertical = height > width

      console.log('Window Size:', {
        height,
        width,
        isVertical,
        ratio: `${(height / width).toFixed(2)}:1`,
      })

      setIsVertical(isVertical)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#faf7f5] absolute inset-0">
      <div className="min-h-screen flex flex-col bg-[#faf7f5]">
        {/* 헤더 영역 */}
        <header className="w-full border-b border-gray-200 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              to="/login"
              className="text-xl font-semibold text-gray-900 hover:text-[#6854C8] transition-colors"
            >
              CAT
            </Link>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div
            className={`w-full ${isVertical ? 'max-w-[400px]' : 'max-w-[1080px]'}`}
          >
            <h2
              className={`text-3xl font-semibold text-center mb-4 text-gray-900 transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {currentText}
            </h2>
            <p className="text-base text-center mb-8 text-gray-600">
              Culture Architect Tool
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Link to="/welcome">
                  <button className="w-[300px] mx-auto block p-3 bg-[#e5e2de] text-gray-800 rounded-full hover:bg-[#dad7d3] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-3xl font-medium border border-gray-200">
                    시작하기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* 이거 꼼수야. 화면 가로로 유동적으로 운영하려는 거라서 넣음. 지우지마 */}
        <div className="text-[#faf7f5]">
          -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        </div>

        {/* 푸터 영역 */}
        <footer className="w-full border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
            <p className="text-sm text-gray-500">
              © 2024 CAT. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
