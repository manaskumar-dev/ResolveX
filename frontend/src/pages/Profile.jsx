import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile, deleteUser, getAllComplaints } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Profile(){
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [complaintStats, setComplaintStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, completed: 0 })
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect non-users
    if (user?.role !== 'user') {
      navigate('/not-found')
      return
    }
    if (user && user.name) {
      setName(user.name)
      setError(null)
    } else if (user && !user.name) {
      setError('User information not available')
    }
    fetchComplaintStats()
    setLoading(false)
  }, [user, navigate])

  const fetchComplaintStats = async () => {
    try {
      const res = await getAllComplaints()
      if (res.data.data) {
        const complaints = res.data.data
        const stats = {
          total: complaints.length,
          open: complaints.filter(c => c.status === 'Open').length,
          inProgress: complaints.filter(c => c.status === 'In Progress').length,
          resolved: complaints.filter(c => c.status === 'Resolved').length,
          completed: complaints.filter(c => c.status === 'Completed').length
        }
        setComplaintStats(stats)
      }
    } catch (err) {
      console.error('Failed to fetch complaint stats')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }

    try {
      const res = await updateProfile({ name })
      setMessage('Profile updated successfully!')
      setName(name)
      setEditing(false)
      setTimeout(() => setMessage(null), 3000)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser()
        alert('Account deleted successfully')
        logout()
        navigate('/login')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete account')
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 text-lg">Loading your profile...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and view summary</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
            <div>
              <p className="font-semibold text-green-800">Success</p>
              <p className="text-green-700">{message}</p>
            </div>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Profile Info Cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Name Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-800">{user.name}</p>
                  )}
                </div>

                {/* Email Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 break-all">{user?.email || 'N/A'}</p>
                </div>

                {/* Member Since Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Member Since</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                </div>

                {/* Account Type Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Type</label>
                  </div>
                  <p className="text-lg font-semibold text-orange-600 capitalize">{user.role || 'User'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap">
                {editing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setName(user.name)
                      }}
                      className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complaint Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Total Complaints */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{complaintStats.total}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">Total</p>
                  </div>
                </div>

                {/* Open */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{complaintStats.open}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">Open</p>
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{complaintStats.inProgress}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">In Progress</p>
                  </div>
                </div>

                {/* Resolved */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{complaintStats.resolved}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">Resolved</p>
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{complaintStats.completed}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
              <div>
                <p className="font-semibold text-blue-900 mb-1">Account Information</p>
                <p className="text-blue-800 text-sm">Your profile data is stored securely. You can update your name at any time, but your email cannot be changed.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
