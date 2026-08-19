import React, { useState } from 'react'
import { createComplaint } from '../api'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Electricity', 'Water', 'Gas', 'Road', 'Sewer']

export default function CreateComplaint(){
  const [category, setCategory] = useState(CATEGORIES[0])
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setError(null)

    if (!category || !desc.trim()) {
      setError('Category and description are required')
      return
    }

    if (desc.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    setLoading(true)
    try{
      const res = await createComplaint({ category, desc, img })
      setMessage('Complaint registered successfully!')
      setTimeout(() => {
        navigate('/complaints')
      }, 1500)
    }
    catch(e){
      setError(e?.response?.data?.message || 'Failed to register complaint')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register New Complaint</h1>
          <p className="text-gray-600">Tell us about the issue you're facing</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Category *</label>
              <select
                value={category}
                onChange={e=>setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">Select the category that best describes your issue</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Description *</label>
              <textarea
                value={desc}
                onChange={e=>setDesc(e.target.value)}
                rows="6"
                placeholder="Please describe your complaint in detail. Be specific about the issue, location, and any relevant details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-600">Minimum 10 characters required</p>
                <p className={`text-xs font-medium ${desc.length > 500 ? 'text-red-600' : 'text-gray-600'}`}>
                  {desc.length} / 500
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Image URL (optional)</label>
              <input
                type="url"
                value={img}
                onChange={e=>setImg(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
              />
              <p className="text-xs text-gray-600 mt-2">Add an image to support your complaint (e.g., broken road, damaged property)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  Registering...
                </>
              ) : (
                <>
                  Register Complaint
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for better complaints:</h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>Be specific about the location and time</li>
            <li>Describe the issue clearly with details</li>
            <li>Include relevant photos if possible</li>
            <li>Mention any safety concerns</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

