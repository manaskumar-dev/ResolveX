import React, { useEffect, useState } from 'react'
import { getAllComplaints, getCompletedComplaints } from '../api'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  'Open': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Re-opened': 'bg-red-100 text-red-800'
}

export default function ComplaintsList(){
  const [activeComplaints, setActiveComplaints] = useState([])
  const [completedComplaints, setCompletedComplaints] = useState([])
  const [error, setError] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingCompleted, setLoadingCompleted] = useState(false)

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await getAllComplaints()
        if(res.data.data){
          const all = res.data.data
          setActiveComplaints(all.filter(c => c.status !== 'Completed'))
        }
        else setError(res.data.message)

        // Fetch completed complaints count
        try{
          const completedRes = await getCompletedComplaints()
          if(completedRes.data.data){
            setCompletedComplaints(completedRes.data.data)
          }
        }
        catch(err){
          console.error('Unable to load completed complaints count')
        }
      }
      catch(e){
        setError('Unable to fetch complaints')
      }
      finally {
        setLoading(false)
      }
    })();
  }, [])

  const loadCompleted = async () => {
    setShowCompleted(!showCompleted)
  }

  if(loading) return <div className="mt-8 text-center text-gray-600">Loading your complaints...</div>

  const displayComplaints = showCompleted ? completedComplaints : activeComplaints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">My Complaints</h1>
            <p className="text-gray-600">Track and manage your submitted complaints</p>
          </div>
          <Link to="/create" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center gap-2 group">
            New Complaint
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-start gap-3">
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex gap-1 mb-6">
          <button
            onClick={() => setShowCompleted(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              !showCompleted 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              Active <span className="bg-opacity-20 bg-white px-2 py-1 rounded text-sm">({activeComplaints.length})</span>
            </span>
          </button>
          <button
            onClick={loadCompleted}
            disabled={loadingCompleted}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              showCompleted 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <span className="flex items-center gap-2">
              Completed <span className="bg-opacity-20 bg-white px-2 py-1 rounded text-sm">({completedComplaints.length})</span>
            </span>
          </button>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {displayComplaints.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <p className="text-gray-700 font-semibold mb-2">
                {showCompleted ? 'No completed complaints' : 'No active complaints yet'}
              </p>
              <p className="text-gray-600 mb-6">
                {showCompleted ? 'Your resolved complaints will appear here' : 'Create your first complaint to get started'}
              </p>
              {!showCompleted && (
                <Link to="/create" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Create a complaint →
                </Link>
              )}
            </div>
          ) : (
            displayComplaints.map(complaint => (
              <Link key={complaint._id} to={`/complaint/${complaint.ticketId}`} className="block">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{complaint.category}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{complaint.desc}</p>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
                      {complaint.status || 'Open'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ticket ID</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{complaint.ticketId.substring(0, 12)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="text-sm text-gray-900">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600 font-semibold text-sm hover:text-indigo-700">View Details →</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
