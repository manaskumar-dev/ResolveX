import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Large 404 with emoji */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">404</h1>
        </div>

        {/* Text Content */}
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 inline-flex items-center justify-center gap-2">
            Go Back Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            Go Back
          </button>
        </div>

        {/* Decorative Message */}
        <div className="mt-16">
          <p className="text-gray-500 text-sm">Lost? Try one of these:</p>
          <div className="mt-4 space-y-2">
            <Link to="/complaints" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">View Complaints</Link>
            <Link to="/create" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">Create Complaint</Link>
            <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">My Profile</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
