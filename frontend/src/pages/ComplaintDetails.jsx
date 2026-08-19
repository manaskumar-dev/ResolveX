import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getComplaint, addReview } from '../api'
import ChatPortal from '../components/ChatPortal'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  'Open': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Re-opened': 'bg-red-100 text-red-800'
}

export default function ComplaintDetails(){
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const authContext = useAuth()
  const role = authContext?.role || 'user'
  const [complaint, setComplaint] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [result, setResult] = useState('Satisfied')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await getComplaint(ticketId)
        setComplaint(res.data.data)
        setError(null)
      }
      catch(e){
        setError('Unable to fetch complaint details')
      }
      finally {
        setLoading(false)
      }
    })();
  }, [ticketId])

  const handleReview = async (e) =>{
    e.preventDefault()
    if (!comment.trim()) {
      setError('Please provide a comment')
      return
    }
    
    setReviewLoading(true)
    try{
      const res = await addReview(ticketId, { rating: parseInt(rating), comment, result })
      setMessage('Review submitted successfully!')
      setTimeout(() => {
        navigate('/complaints')
      }, 1500)
    }
    catch(e){
      setError(e?.response?.data?.message || 'Failed to add review')
    }
    finally {
      setReviewLoading(false)
    }
  }

  if(loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <p className="text-gray-600 text-lg">Loading complaint details...</p>
      </div>
    </div>
  )
  
  if(!complaint) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-700 text-xl font-semibold">Complaint not found</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/complaints')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition hover:gap-3"
        >
          <span>←</span>
          Back to Complaints
        </button>

        {/* Main Complaint Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          {/* Header with Status */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{complaint.category}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                Ticket ID: <span className="font-mono bg-gray-100 px-3 py-1 rounded">{complaint.ticketId}</span>
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

          {/* Attached Image */}
          {complaint.img && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Attached Image
              </h3>
              <div className="relative group">
                <img src={complaint.img} alt="complaint" className="max-w-md rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition" />
              </div>
            </div>
          )}

          {/* Timeline Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div>
                  <p className="text-sm text-gray-600">Registered on</p>
                  <p className="font-semibold text-gray-800">{new Date(complaint.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {complaint.resolvedAt && (
                <div className="flex items-start gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Resolved on</p>
                    <p className="font-semibold text-gray-800">{new Date(complaint.resolvedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Message */}
          {complaint.resolutionMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 flex items-start gap-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Resolution Message</h3>
                <p className="text-green-800">{complaint.resolutionMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Portal */}
        {complaint.status !== 'Completed' && complaint.status !== 'Open' && (
          <ChatPortal ticketId={ticketId} userRole={role} />
        )}

        {/* Review Section */}
        {complaint.status === 'Resolved' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              Share Your Feedback
            </h2>
            <p className="text-gray-600 mb-6">Help us improve by rating your experience</p>

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

            <form onSubmit={handleReview} className="space-y-6">
              {/* Rating */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  Rating (1-5) *
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`text-4xl transition-transform hover:scale-110 ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mt-3 font-medium">Your Rating: <span className="text-yellow-600 text-lg">{rating}/5</span></p>
              </div>

              {/* Feedback Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  Your Feedback *
                </label>
                <textarea
                  value={comment}
                  onChange={e=>setComment(e.target.value)}
                  rows="4"
                  placeholder="Please share your experience with this complaint resolution..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800 resize-none"
                />
                <p className="text-sm text-gray-600 mt-2">{comment.length} characters</p>
              </div>

              {/* Resolution Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  Resolution Status *
                </label>
                <select
                  value={result}
                  onChange={e=>setResult(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800"
                >
                  <option value="Satisfied">Satisfied - Issue resolved</option>
                  <option value="Not Satisfied">Not Satisfied - Issue not fully resolved</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {complaint.status !== 'Resolved' && complaint.status !== 'Completed' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 flex items-start gap-4">
            <div>
              <p className="text-blue-900 font-semibold mb-2">Feedback Coming Soon</p>
              <p className="text-blue-800">Feedback will be available once your complaint status becomes <strong>Resolved</strong>.</p>
              <p className="text-blue-700 text-sm mt-2">Current Status: <strong className="text-lg">{complaint.status || 'Open'}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
