import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, getAllAgents, getAllComplaints_admin } from '../api'

export default function AdminDashboard(){
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalComplaints: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, agentsRes, complaintsRes] = await Promise.all([
        getAllUsers(),
        getAllAgents(),
        getAllComplaints_admin()
      ])
      
      setStats({
        totalUsers: usersRes.data.data?.length || 0,
        totalAgents: agentsRes.data.data?.length || 0,
        totalComplaints: complaintsRes.data.data?.length || 0
      })
      setError(null)
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="mt-8 text-center">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mt-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your complaint system</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-start gap-3">
          <span>{error}</span>
        </div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              View Users <span>→</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Agents</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalAgents}</p>
              </div>
            </div>
            <Link to="/admin/agents" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
              Manage Agents <span>→</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Complaints</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalComplaints}</p>
              </div>
            </div>
            <Link to="/admin/complaints?filter=all" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
              View Complaints <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/agents"
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition font-semibold flex items-center justify-center gap-3 group"
            >
              <span>Manage Agents</span>
            </Link>
            <Link
              to="/admin/complaints"
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:shadow-lg transition font-semibold flex items-center justify-center gap-3 group"
            >
              <span>Assign Complaints</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
