import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAgentComplaints } from '../api'

export default function NavBar(){
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false)
  const [quickComplaints, setQuickComplaints] = useState([])

  useEffect(() => {
    if (user?.role === 'agent') {
      (async () => {
        try {
          const res = await getAgentComplaints()
          setQuickComplaints((res.data.data || []).slice(0, 6))
        } catch (e) {
          // ignore
        }
      })()
    }
  }, [user])

  const handleLogout = () =>{
    logout();
    navigate('/login');
  }

  const getDashboardLink = () => {
    switch(user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'agent':
        return '/agent/dashboard';
      default:
        return '/complaints';
    }
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={token ? getDashboardLink() : '/login'} className="font-bold text-xl text-gray-900 hover:text-indigo-600 transition flex items-center gap-2">
          <span>ComplaintMS</span>
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              {user?.role === 'user' && (
                <>
                  <Link to="/complaints" className="text-gray-700 hover:text-indigo-600 transition font-medium">My Complaints</Link>
                  <Link to="/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">+ Register</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-indigo-600 transition font-medium">Dashboard</Link>
                  <Link to="/admin/agents" className="text-gray-700 hover:text-indigo-600 transition font-medium">Agents</Link>
                  <Link to="/admin/complaints" className="text-gray-700 hover:text-indigo-600 transition font-medium">Complaints</Link>
                </>
              )}
              {user?.role === 'agent' && (
                <>
                  <Link to="/agent/dashboard" className="text-gray-700 hover:text-indigo-600 transition font-medium">Dashboard</Link>
                  <div className="relative inline-block">
                    <button onClick={() => setShowDropdown(s => !s)} className="text-gray-700 hover:text-indigo-600 transition font-medium flex items-center gap-1">
                      <span>Complaints</span>
                      <span className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 text-gray-800 p-4 border border-gray-200">
                        <div className="text-sm font-bold text-gray-900 mb-3">Assigned Complaints</div>
                        {quickComplaints.length === 0 ? (
                          <div className="text-sm text-gray-500 text-center py-3">No assigned complaints</div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {quickComplaints.map(c => (
                              <button key={c._id} onClick={() => { setShowDropdown(false); navigate(`/agent/complaint/${c.ticketId}`) }} className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg transition border border-gray-200 hover:border-indigo-300">
                                <div className="font-semibold text-gray-900">{c.category}</div>
                                <div className="text-xs text-gray-600 mt-1">{c.ticketId.substring(0,8)}...</div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    c.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                                    c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    c.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {c.status}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 text-center border-t pt-3">
                          <Link to="/agent/complaints" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View all complaints →</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                {user?.role === 'user' && (
                  <Link to="/profile" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2 font-medium">
                    <span className="text-lg">👤</span>
                    <span className="max-w-24 truncate">{user?.name || 'Profile'}</span>
                  </Link>
                )}
                {user?.role !== 'user' && (
                  <span className="text-gray-700 flex items-center gap-2 font-medium">
                    <span className="text-lg">👤</span>
                    <span className="max-w-24 truncate">{user?.name || 'User'}</span>
                  </span>
                )}
                <button onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-medium text-sm">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition font-medium">Login</Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
