// src/pages/Home.tsx
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="w-full max-w-[90%]">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 md:mb-8 text-gray-900">
          Welcome to CAT
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 md:mb-12 text-gray-600">
          Chat-Consulting Assistant Tool for your team
        </p>
        
        <div className="grid gap-4 md:gap-6 max-w-md md:max-w-full mx-auto">
          <Link 
            to="/admin"
            className="p-4 md:p-6 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg md:text-xl w-full"
          >
            Admin Login
          </Link>
          <div className="text-center text-gray-500 text-base md:text-lg">
            or enter your team URL to get started
          </div>
          <div className="flex gap-2 md:gap-4">
            <input
              type="text"
              placeholder="Enter team name"
              className="flex-1 p-4 md:p-6 border rounded-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="px-6 md:px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base md:text-lg"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
