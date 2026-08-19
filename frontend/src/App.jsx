import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CreateComplaint from './pages/CreateComplaint'
import ComplaintsList from './pages/ComplaintsList'
import ComplaintDetails from './pages/ComplaintDetails'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import AdminAgents from './pages/AdminAgents'
import AdminUsers from './pages/AdminUsers'
import AdminComplaints from './pages/AdminComplaints'
import AgentDashboard from './pages/AgentDashboard'
import AgentComplaints from './pages/AgentComplaints'
import ComplaintDetailAgent from './pages/ComplaintDetailAgent'
import { useAuth } from './context/AuthContext'

function Protected({ children, role }){
  const { token, user } = useAuth();
  if(!token) return <Navigate to="/login" replace />
  if(role && user?.role !== role) return <Navigate to="/not-found" replace />
  return children;
}

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User Routes */}
          <Route path="/complaints" element={<Protected><ComplaintsList /></Protected>} />
          <Route path="/complaint/:ticketId" element={<Protected><ComplaintDetails /></Protected>} />
          <Route path="/create" element={<Protected><CreateComplaint /></Protected>} />
          <Route path="/profile" element={<Protected role="user"><Profile /></Protected>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/agents" element={<Protected role="admin"><AdminAgents /></Protected>} />
          <Route path="/admin/users" element={<Protected role="admin"><AdminUsers /></Protected>} />
          <Route path="/admin/complaints" element={<Protected role="admin"><AdminComplaints /></Protected>} />

          {/* Agent Routes */}
          <Route path="/agent/dashboard" element={<Protected role="agent"><AgentDashboard /></Protected>} />
          <Route path="/agent/complaints" element={<Protected role="agent"><AgentComplaints /></Protected>} />
          <Route path="/agent/complaint/:ticketId" element={<Protected role="agent"><ComplaintDetailAgent /></Protected>} />

          {/* Default & Not Found */}
          <Route path="/" element={<Navigate to="/complaints" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}
