/* eslint-disable */
// @ts-nocheck
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const guardado = localStorage.getItem('usuario')
    if (guardado) setUsuario(JSON.parse(guardado))
    setLoading(false)
  }, [])

  async function login(email, password) {
    const response = await api.post('/auth/login/', { email, password })
    const { access, refresh, usuario: user } = response.data
    localStorage.setItem('access_token',  access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('usuario',       JSON.stringify(user))
    setUsuario(user)
  }

  async function logout() {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/auth/logout/', { refresh })
    } finally {
      localStorage.clear()
      setUsuario(null)
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}