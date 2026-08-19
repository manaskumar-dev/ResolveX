import React, { useEffect, useState } from 'react'
import { getAgentComplaints } from '../api'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  'Open': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Re-opened': 'bg-red-100 text-red-800'
}

export default function AgentComplaints(){
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const res = await getAgentComplaints()
      setComplaints(res.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'all') return true
    return c.status === filterStatus
  })

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <p className="text-gray-600 text-lg">Loading complaints...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            My Assigned Complaints
          </h1>
          <p className="text-gray-600 mt-2">Manage all complaints assigned to you</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {['all', 'Open', 'In Progress', 'Resolved', 'Completed', 'Re-opened'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <span>
                {status === 'all' ? '' : 
                 status === 'Open' ? '' : 
                 status === 'In Progress' ? '' : 
                 status === 'Resolved' ? '' : 
                 status === 'Completed' ? '' : ''}
              </span>
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-700 text-lg font-semibold">No complaints found</p>
              <p className="text-gray-600 mt-2">There are no complaints for this filter</p>
            </div>
          ) : (
            filteredComplaints.map(complaint => (
              <div key={complaint._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all p-6 cursor-pointer" onClick={() => navigate(`/agent/complaint/${complaint.ticketId}`)}>
                {/* Header with Title and Status */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {complaint.category}
                    </h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">{complaint.desc.substring(0, 120)}...</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
                    {complaint.status || 'Open'}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Ticket ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-800">{complaint.ticketId.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">User</p>
                      <p className="font-semibold text-gray-800">{complaint.userId?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                      <p className="text-sm text-gray-800 break-all">{complaint.userId?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Created</p>
                      <p className="font-semibold text-gray-800">{new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/agent/complaint/${complaint.ticketId}`)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredComplaints.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Complaints Assigned</p>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{filteredComplaints.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
