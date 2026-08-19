import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default function ChatPortal({ ticketId, userRole }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const role = userRole || 'user'

  useEffect(() => {
    if (ticketId) {
      fetchMessages()
    }
  }, [ticketId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const endpoint = role === 'user' 
        ? `/message/user/complaint/${ticketId}/messages`
        : `/message/agent/complaint/${ticketId}/messages`
      
      const res = await API.get(endpoint)
      setMessages(res.data.data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      if (err.response?.status !== 404) {
        setError('Failed to load messages')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) {
      setError('Message cannot be empty')
      return
    }

    try {
      const endpoint = role === 'user'
        ? `/message/user/complaint/${ticketId}/message`
        : `/message/agent/complaint/${ticketId}/message`
      
      await API.post(endpoint, { message: newMessage })
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">💬 Communication Portal</h3>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto mb-4 border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === role ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === role
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  )
}
