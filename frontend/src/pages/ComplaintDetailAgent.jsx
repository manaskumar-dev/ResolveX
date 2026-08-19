import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAgentComplaints, updateComplaintInProgress, updateComplaintResolved } from '../api'
import ChatPortal from '../components/ChatPortal'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  'Open': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Re-opened': 'bg-red-100 text-red-800'
}

export default function ComplaintDetailAgent(){
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [resolveMode, setResolveMode] = useState(false)
  const [resolutionMsg, setResolutionMsg] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    fetchComplaint()
  }, [ticketId])

  const fetchComplaint = async () => {
    try {
      const res = await getAgentComplaints()
      const found = (res.data.data || []).find(c => c.ticketId === ticketId)
      if (found) {
        setComplaint(found)
        setError(null)
      } else {
        setError('Complaint not found')
      }
    } catch (err) {
      setError('Failed to load complaint')
    } finally {
      setLoading(false)
    }
  }

  const handleStartProgress = async () => {
    setUpdatingStatus(true)
    try {
      await updateComplaintInProgress(complaint.ticketId)
      setMessage('Complaint status updated to In Progress')
      fetchComplaint()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!resolutionMsg.trim()) {
      setError('Please provide a resolution message')
      return
    }

    setUpdatingStatus(true)
    try {
      await updateComplaintResolved(complaint.ticketId, { resolutionMsg })
      setMessage('Complaint resolved successfully!')
      setResolveMode(false)
      setResolutionMsg('')
      fetchComplaint()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resolve complaint')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <p className="text-gray-600 text-lg">Loading complaint...</p>
      </div>
    </div>
  )
  if (!complaint) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-700 text-xl font-semibold">{error || 'Complaint not found'}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/agent/complaints')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition hover:gap-3"
        >
          <span>←</span>
          Back to Complaints
        </button>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{complaint.category}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                Ticket: <span className="font-mono bg-gray-100 px-3 py-1 rounded">{complaint.ticketId}</span>
              </p>
            </div>
            <span className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
              {complaint.status || 'Open'}
            </span>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Description
            </h3>
            <p className="text-gray-800 leading-relaxed">{complaint.desc}</p>
          </div>

          {/* Attachment */}
          {complaint.img && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Attachment
              </h3>
              <img src={complaint.img} alt="complaint" className="max-w-md rounded-xl border-2 border-gray-200 shadow-lg" />
            </div>
          )}

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                User Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{complaint.userId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800 break-all">{complaint.userId?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Timeline
              </h3>
              <div>
                <p className="text-sm text-gray-600">Created on</p>
                <p className="font-semibold text-gray-800">{new Date(complaint.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Resolution Message */}
          {complaint.resolutionMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 flex items-start gap-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Resolution Message</h3>
                <p className="text-green-800 mb-2">{complaint.resolutionMessage}</p>
                <p className="text-sm text-green-700">Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* User Feedback/Review */}
          {complaint.review && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                User Feedback & Review
              </h3>
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <p className="text-sm text-amber-700 font-semibold mb-2">Rating</p>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(num => (
                        <span key={num} className={`text-2xl ${complaint.review.rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xl font-bold text-amber-700">{complaint.review.rating}/5</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-sm text-amber-700 font-semibold mb-2">Comment</p>
                  <p className="text-amber-900 bg-white rounded p-3 border border-amber-200">{complaint.review.comment}</p>
                </div>

                {/* Satisfaction Status */}
                <div>
                  <p className="text-sm text-amber-700 font-semibold mb-2">Satisfaction Status</p>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${complaint.review.result === 'Satisfied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {complaint.review.result === 'Satisfied' ? 'Satisfied' : 'Not Satisfied'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(complaint.status === 'Open' || complaint.status === 'Re-opened') && (
              <button
                onClick={handleStartProgress}
                disabled={updatingStatus}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingStatus ? 'Updating...' : 'Start Progress'}
              </button>
            )}

            {complaint.status === 'In Progress' && (
              <button
                onClick={() => setResolveMode(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Mark as Resolved
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                complaint.status === 'Completed'
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:from-purple-600 hover:to-purple-700'
              }`}
              disabled={complaint.status === 'Completed'}
            >
              {showChat ? 'Close Chat' : 'Open Chat'}
            </button>
          </div>

          {/* Resolve Form */}
          {resolveMode && (
            <form onSubmit={handleResolve} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-green-900 mb-4 flex items-center gap-2">
                Mark Complaint as Resolved
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  Resolution Message *
                </label>
                <textarea
                  value={resolutionMsg}
                  onChange={(e) => setResolutionMsg(e.target.value)}
                  rows="5"
                  placeholder="Describe how the issue was resolved..."
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800 resize-none"
                />
                <p className="text-sm text-gray-600 mt-2">{resolutionMsg.length} characters</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingStatus ? 'Resolving...' : 'Confirm Resolve'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResolveMode(false)
                    setResolutionMsg('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Chat Portal */}
          {showChat && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-lg text-purple-900 mb-4 flex items-center gap-2">
                Chat with User
              </h3>
              <ChatPortal ticketId={complaint.ticketId} userRole={role} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
