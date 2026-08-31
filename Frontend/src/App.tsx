import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout          from './components/layout/Layout'
import Login           from './pages/Login/Login'
import Dashboard       from './pages/Dashboard/Dashboard'
import Inventario      from './pages/Inventario/Inventario'
import Registrar       from './pages/Registrar/Registrar'
import Reportes        from './pages/Reportes/Reportes'
import Solicitudes     from './pages/Solicitudes/Solicitudes'
import Distribucion    from './pages/Distribucion/Distribucion'
import Infraestructura from './pages/Infraestructura/Infraestructura'
import Estadisticas    from './pages/Estadisticas/Estadisticas'
import Usuarios        from './pages/Usuarios/Usuarios'

function RutaProtegida({ children }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex',
        alignItems:'center', justifyContent:'center',
        background:'#000080',
      }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🎓</div>
          <p style={{
            color:'#fff', fontSize:'13px',
            margin:0, fontFamily:'Inter, sans-serif',
          }}>
            Cargando SNIE...
          </p>
        </div>
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />

  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"
        element={<RutaProtegida><Dashboard /></RutaProtegida>} />
      <Route path="/inventario"
        element={<RutaProtegida><Inventario /></RutaProtegida>} />
      <Route path="/registrar"
        element={<RutaProtegida><Registrar /></RutaProtegida>} />
      <Route path="/reportes"
        element={<RutaProtegida><Reportes /></RutaProtegida>} />
      <Route path="/solicitudes"
        element={<RutaProtegida><Solicitudes /></RutaProtegida>} />
      <Route path="/distribucion"
        element={<RutaProtegida><Distribucion /></RutaProtegida>} />
      <Route path="/infraestructura"
        element={<RutaProtegida><Infraestructura /></RutaProtegida>} />
      <Route path="/estadisticas"
        element={<RutaProtegida><Estadisticas /></RutaProtegida>} />
      <Route path="/usuarios"
        element={<RutaProtegida><Usuarios /></RutaProtegida>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App