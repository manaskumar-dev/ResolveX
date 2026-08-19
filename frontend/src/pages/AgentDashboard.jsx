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

export default function AgentDashboard(){
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0
  })
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const res = await getAgentComplaints()
      const data = res.data.data || []
      setComplaints(data)

      const counts = {
        open: data.filter(c => c.status === 'Open').length,
        inProgress: data.filter(c => c.status === 'In Progress').length,
        resolved: data.filter(c => c.status === 'Resolved').length
      }
      setStats(counts)
      setError(null)
    } catch (err) {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const navigate = useNavigate()
  if (loading) return <div className="mt-8 text-center text-gray-600">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mt-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Manage and resolve assigned complaints</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Open Complaints</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.open}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">Waiting for assignment</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                <p className="text-4xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">Currently working on</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Resolved</p>
                <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">Completed resolutions</p>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assigned Complaints</h2>
          
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 font-semibold mb-2">No complaints assigned yet</p>
              <p className="text-gray-600">New complaints will appear here once assigned by admin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 8).map(complaint => (
                <button 
                  key={complaint._id} 
                  onClick={() => navigate(`/agent/complaint/${complaint.ticketId}`)} 
                  className="w-full text-left bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-indigo-50 p-5 rounded-lg border border-gray-200 hover:border-indigo-300 transition group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{complaint.category}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{complaint.desc}</p>
                      <p className="text-xs text-gray-500 mt-2">Registered: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
                      {complaint.status || 'Open'}
                    </span>
                  </div>
                </button>
              ))}
              {complaints.length > 8 && (
                <button onClick={() => navigate('/agent/complaints')} className="w-full text-center text-indigo-600 hover:text-indigo-700 font-semibold py-3 mt-4">
                  View all {complaints.length} complaints →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
