/* eslint-disable */
// @ts-nocheck
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

 const modulos = 
                [
                    { icon:'📦', titulo:'Inventario',      desc:'Gestión de recursos escolares',   ruta:'/inventario' },
                    { icon:'🏗️', titulo:'Infraestructura', desc:'Estado de aulas y laboratorios',  ruta:'/infraestructura' },
                    { icon:'⚠️', titulo:'Reportes',         desc:'Daños y seguimiento',              ruta:'/reportes' },
                    { icon:'📨', titulo:'Solicitudes',      desc:'Recursos y reparaciones',          ruta:'/solicitudes' },
                    { icon:'🚚', titulo:'Distribución',     desc:'Control de entrega',               ruta:'/distribucion' },
                    { icon:'📊', titulo:'Estadísticas',     desc:'Datos nacionales',                 ruta:'/estadisticas' },
                ]


  return (
    <div className="min-h-screen" style={{ background:'#f8f8ff' }}>
      <nav className="flex items-center justify-between px-8 py-4 shadow-md"
        style={{ background:'#000080' }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="Respawn" className="h-10 w-auto" />
          <div>
            <p className="text-white font-bold text-sm">Sistema Respawn</p>
            <p className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>MINED Nicaragua</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-xs" style={{ color:'#FF00CC' }}>{usuario?.rol}</p>
          </div>
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background:'#FF00CC', color:'#fff' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="p-8">
        <div className="rounded-2xl p-8 mb-6" style={{ background:'#000080' }}>
          <h1 className="text-2xl font-bold text-white mb-2">
            Bienvenido, {usuario?.nombre} 👋
          </h1>
          <p style={{ color:'rgba(255,255,255,0.7)' }}>
            Sistema Nacional de Inventario Escolar — MINED Nicaragua
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {modulos.map((mod) => (
            <div key={mod.titulo}
                onClick={() => navigate(mod.ruta)}
                className="rounded-xl p-6 cursor-pointer"
              style={{ background:'#ffffff', border:'1.5px solid #e0e0f0', boxShadow:'0 2px 8px rgba(0,0,128,0.06)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF00CC'
                e.currentTarget.style.boxShadow   = '0 4px 20px rgba(255,0,204,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0f0'
                e.currentTarget.style.boxShadow   = '0 2px 8px rgba(0,0,128,0.06)'
              }}>
              <div className="text-4xl mb-3">{mod.icon}</div>
              <h3 className="font-bold mb-1" style={{ color:'#000080' }}>{mod.titulo}</h3>
              <p className="text-sm" style={{ color:'#6b6b8a' }}>{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}