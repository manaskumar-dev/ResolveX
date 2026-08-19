import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setError(null)

    if(!name || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if(password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if(password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try{
      const res = await signup(name, email, password)
      if(res?.data?.message) {
        alert('Signup successful! Please login.')
        navigate('/login')
      }
    }
    catch(err){
      setError(err?.response?.data?.message || 'Signup failed')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-100 p-3 rounded-full mb-4">
            <span className="text-4xl">CMS</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ComplaintMS</h1>
          <p className="text-gray-600">Streamlined complaint management</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 text-sm mt-1">Join us today to register complaints</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e=>setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="At least 6 characters"
              />
              <p className="text-xs text-gray-600 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Already have an account?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full block text-center bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
          >
            Login Here
          </Link>
        </div>
      </div>
    </div>
  )
}
