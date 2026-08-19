import React, { useEffect, useState } from 'react'
import { getAllUsers } from '../api'

export default function AdminUsers(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data.data || [])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <p className="text-gray-600 text-lg">Loading users...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-4">
            Users Management
          </h1>
          <p className="text-gray-600">View and manage all registered users</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-700 text-lg font-semibold">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 break-all">{user.email}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 flex items-center gap-2 w-fit">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Users</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{filteredUsers.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
