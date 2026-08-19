import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getUnassignedComplaints, getAllComplaints_admin, getAgentsByCategory, assignComplaint, getAllAgents } from '../api'

const STATUS_COLORS = {
  'Open': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Re-opened': 'bg-red-100 text-red-800'
}

export default function AdminComplaints(){
  const [searchParams] = useSearchParams()
  const showOnlyUnassigned = searchParams.get('filter') !== 'all'
  
  const [complaints, setComplaints] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [assigningComplaint, setAssigningComplaint] = useState(null)
  const [categoryAgents, setCategoryAgents] = useState([])

  useEffect(() => {
    fetchComplaints()
    fetchAgents()
  }, [showOnlyUnassigned])

  const fetchComplaints = async () => {
    try {
      const res = showOnlyUnassigned ? await getUnassignedComplaints() : await getAllComplaints_admin()
      setComplaints(res.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const res = await getAllAgents()
      setAgents(res.data.data || [])
    } catch (err) {
      console.error('Failed to load agents')
    }
  }

  const handleAssignClick = async (complaint) => {
    setSelectedComplaint(complaint)
    try {
      const res = await getAgentsByCategory(complaint.ticketId)
      setCategoryAgents(res.data.data || [])
    } catch (err) {
      setCategoryAgents([])
    }
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAgent) {
      setError('Please select an agent')
      return
    }

    setAssigningComplaint(selectedComplaint._id)
    try {
      await assignComplaint(selectedComplaint.ticketId, { agentId: selectedAgent })
      setMessage('Complaint assigned successfully!')
      setSelectedComplaint(null)
      setSelectedAgent('')
      fetchComplaints()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign complaint')
    } finally {
      setAssigningComplaint(null)
    }
  }

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
            {showOnlyUnassigned ? 'Complaints to Assign' : 'All Complaints'}
          </h1>
          <p className="text-gray-600 mt-2">{showOnlyUnassigned ? 'Manage unassigned complaints' : 'View all system complaints'}</p>
        </div>

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

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-700 text-lg font-semibold">{showOnlyUnassigned ? '✓ All complaints have been assigned!' : 'No complaints found'}</p>
              <p className="text-gray-600 mt-2">There are no complaints to display at this time.</p>
            </div>
          ) : (
            complaints.map(complaint => (
              <div key={complaint._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all p-6">
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
                      <p className="text-xs font-semibold text-gray-600 uppercase">Registered</p>
                      <p className="font-semibold text-gray-800">{new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Section */}
                {complaint.assignedTo ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Assigned to</p>
                      <p className="font-bold text-green-700 text-lg">{complaint.assignedTo?.name || 'Agent'}</p>
                      <p className="text-sm text-green-600">{complaint.assignedTo?.email || ''}</p>
                    </div>
                  </div>
                ) : (complaint.status === 'Open' || complaint.status === 'Re-opened') ? (
                  <button
                    onClick={() => handleAssignClick(complaint)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Assign to Agent
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              Assign Complaint
            </h2>
            <p className="text-gray-600 mb-6">
              Assigning complaint to an agent in the <strong className="text-indigo-600">{selectedComplaint.category}</strong> category.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  Select Agent *
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800"
                >
                  <option value="">-- Choose an agent --</option>
                  {categoryAgents.length > 0 ? (
                    categoryAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No agents available for this category</option>
                  )}
                </select>
                {categoryAgents.length === 0 && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-2">
                    No agents assigned to this category
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={assigningComplaint === selectedComplaint._id || !selectedAgent}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigningComplaint === selectedComplaint._id ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedComplaint(null)
                    setSelectedAgent('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
