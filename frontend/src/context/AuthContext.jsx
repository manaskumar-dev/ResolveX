import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, signup as apiSignup } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState({
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
    role: localStorage.getItem('role') || null,
    id: localStorage.getItem('id') || null,
    createdAt: localStorage.getItem('createdAt') || null
  })

  useEffect(()=>{
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(()=>{
    if(user?.name) localStorage.setItem('name', user.name)
    else localStorage.removeItem('name')
    
    if(user?.email) localStorage.setItem('email', user.email)
    else localStorage.removeItem('email')
    
    if(user?.role) localStorage.setItem('role', user.role)
    else localStorage.removeItem('role')

    if(user?.id) localStorage.setItem('id', user.id)
    else localStorage.removeItem('id')

    if(user?.createdAt) localStorage.setItem('createdAt', user.createdAt)
    else localStorage.removeItem('createdAt')
  }, [user])

  const login = async (email, password) =>{
    const res = await apiLogin({ email, password })
    if(res?.data?.token){
      setToken(res.data.token)
      setUser({ name: res.data.name, email: res.data.email, role: res.data.role, id: res.data.id, createdAt: res.data.createdAt })
    }
    return res
  }

  const signup = async (name, email, password) =>{
    return apiSignup({ name, email, password, role: 'user' })
  }

  const logout = () =>{
    setToken(null)
    setUser({ name: null, role: null })
  }

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, setUser, role: user?.role }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
