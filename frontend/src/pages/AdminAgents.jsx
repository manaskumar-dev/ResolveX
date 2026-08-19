import React, { useEffect, useState } from 'react'
import { createAgent, getAllAgents } from '../api'

const CATEGORIES = ['Electricity', 'Water', 'Gas', 'Road', 'Sewer']

export default function AdminAgents(){
  const [agents, setAgents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: CATEGORIES[0]
  })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await getAllAgents()
      setAgents(res.data.data || [])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setCreating(true)
    try {
      const res = await createAgent(formData)
      setMessage('Agent created successfully!')
      setAgents([...agents, res.data.data])
      setFormData({ name: '', email: '', password: '', category: CATEGORIES[0] })
      setShowForm(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⌛</div>
        <p className="text-gray-600 text-lg">Loading agents...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              Agents Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage support agents</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2"
          >
            {showForm ? 'Cancel' : 'Create Agent'}
          </button>
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

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Create New Agent
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800"
                    placeholder="Agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800"
                    placeholder="agent@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? 'Creating...' : 'Create Agent'}
              </button>
            </form>
          </div>
        )}

        {/* Agents List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-700 text-lg font-semibold">No agents found</p>
              <p className="text-gray-600 mt-2">Create an agent to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, index) => (
                    <tr key={agent._id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">{agent.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 break-all">{agent.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                          {agent.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(agent.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
