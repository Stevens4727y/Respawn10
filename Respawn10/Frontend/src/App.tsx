import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login      from './pages/Login/Login'
import Dashboard  from './pages/Dashboard/Dashboard'
import Reportes   from './pages/Reportes/Reportes'
import Inventario from './pages/Inventario/Inventario'

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background:'#000080' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-white text-sm">Cargando Respawn...</p>
        </div>
      </div>
    )
  }

  return usuario ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <RutaProtegida><Dashboard /></RutaProtegida>
      } />
      <Route path="/reportes" element={
        <RutaProtegida><Reportes /></RutaProtegida>
      } />
      <Route path="/inventario" element={
        <RutaProtegida><Inventario /></RutaProtegida>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App