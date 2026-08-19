import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setError(null)

    if(!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try{
      const res = await login(email, password)
      if(res?.data?.token){
        const role = res?.data?.role
        if(role === 'admin') {
          navigate('/admin/dashboard')
        } else if(role === 'agent') {
          navigate('/agent/dashboard')
        } else {
          navigate('/complaints')
        }
      }
    }
    catch(err){
      setError(err?.response?.data?.message || 'Login failed')
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

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Don't have an account?</span>
            </div>
          </div>

          <Link
            to="/signup"
            className="w-full block text-center bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  )
}
