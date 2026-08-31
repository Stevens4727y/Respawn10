/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const ESTADO_COLORS = {
  Pendiente:   { bg: '#FFF8E1', text: '#F57F17' },
  'En proceso':{ bg: '#E3F2FD', text: '#1565C0' },
  Completada:  { bg: '#E8F5E9', text: '#2E7D32' },
}

export default function Solicitudes() {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [filtroEstado,setFiltroEstado]= useState('Todos')
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [inventarios, setInventarios] = useState([])

  const [form, setForm] = useState({
    descripcion: '',
    estado:      'Pendiente',
    item:        '',
    escuela:     '',
    cantidad:    1,
  })

  useEffect(() => { 
    cargarSolicitudes()
    cargarInventarios()
  }, [])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      const res = await api.get('/solicitudes/')
      setSolicitudes(res.data)
    } catch {
      setError('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const cargarInventarios = async () => {
    try {
      const res = await api.get('/inventario/inventarios/')
      setInventarios(res.data)
    } catch {
      console.error('Error al cargar inventarios')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (usuario?.rol !== 'Admin MINED') {
      setError('Solo Admin MINED puede crear solicitudes')
      return
    }
    
    setError('')
    try {
      await api.post('/solicitudes/', {
        descripcion: form.descripcion,
        estado:      form.estado,
        item:        form.item,
        escuela:     form.escuela,
        cantidad:    form.cantidad,
      })
      setSuccess('Solicitud creada correctamente')
      setShowForm(false)
      setForm({ descripcion:'', estado:'Pendiente', item:'', escuela:'', cantidad:1 })
      cargarSolicitudes()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la solicitud')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    if (usuario?.rol !== 'Admin MINED') {
      setError('Solo Admin MINED puede cambiar el estado')
      return
    }
    try {
      await api.patch(`/solicitudes/${id}/`, { estado: nuevoEstado })
      cargarSolicitudes()
    } catch {
      setError('Error al actualizar el estado')
    }
  }

  const borrarSolicitud = async (id) => {
    if (usuario?.rol !== 'Admin MINED') {
      setError('Solo Admin MINED puede borrar solicitudes')
      return
    }
    if (!window.confirm('¿Está seguro que desea eliminar esta solicitud?')) return
    try {
      await api.delete(`/solicitudes/${id}/`)
      setSuccess('Solicitud eliminada correctamente')
      cargarSolicitudes()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al eliminar la solicitud')
    }
  }

  const solicitudesFiltradas = filtroEstado === 'Todos'
    ? solicitudes
    : solicitudes.filter(s => s.estado === filtroEstado)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="min-h-screen" style={{ background:'#f8f8ff' }}>

      {/* Navbar */}
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
          <button onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background:'rgba(255,255,255,0.15)', color:'#fff' }}>
            ← Dashboard
          </button>
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color:'#000080' }}>
              📋 Solicitudes de Recursos
            </h1>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Gestión de solicitudes de recursos escolares
            </p>
          </div>
          {usuario?.rol === 'Admin MINED' && (
            <button onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
              style={{ background:'linear-gradient(135deg, #000080, #0000cc)',
                boxShadow:'0 4px 15px rgba(0,0,128,0.3)' }}>
              + Nueva Solicitud
            </button>
          )}
        </div>

        {/* Mensaje de restricción */}
        {usuario?.rol !== 'Admin MINED' && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background:'#FFF8E1', border:'1px solid #FFE082', color:'#F57F17' }}>
            ℹ️ Solo Admin MINED puede crear y gestionar solicitudes
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background:'#fff0f8', border:'1px solid #ffb3e6', color:'#cc0066' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background:'#f0fff4', border:'1px solid #9ae6b4', color:'#276749' }}>
            ✅ {success}
          </div>
        )}

        {/* Formulario nueva solicitud — Solo Admin */}
        {showForm && usuario?.rol === 'Admin MINED' && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background:'#fff', border:'1.5px solid #e0e0f0',
              boxShadow:'0 4px 20px rgba(0,0,128,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color:'#000080' }}>
              Nueva Solicitud de Recurso
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Descripción *
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({...form, descripcion: e.target.value})}
                  placeholder="Describe la solicitud de recurso..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a', resize:'none' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Estado inicial *
                </label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({...form, estado: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={(e) => setForm({...form, cantidad: parseInt(e.target.value)})}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit"
                  className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
                  style={{ background:'linear-gradient(135deg, #000080, #0000cc)' }}>
                  Crear Solicitud
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-semibold cursor-pointer"
                  style={{ background:'#f0f0f8', color:'#000080' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {['Todos', 'Pendiente', 'En proceso', 'Completada'].map((estado) => (
            <button key={estado}
              onClick={() => setFiltroEstado(estado)}
              className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
              style={{
                background: filtroEstado === estado ? '#000080' : '#ffffff',
                color:      filtroEstado === estado ? '#ffffff' : '#000080',
                border:     `1.5px solid ${filtroEstado === estado ? '#000080' : '#e0e0f0'}`,
              }}>
              {estado} {estado !== 'Todos' && `(${solicitudes.filter(s => s.estado === estado).length})`}
            </button>
          ))}
        </div>

        {/* Lista de solicitudes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p style={{ color:'#6b6b8a' }}>Cargando solicitudes...</p>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-12 rounded-2xl"
            style={{ background:'#ffffff', border:'1.5px solid #e0e0f0' }}>
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium" style={{ color:'#000080' }}>No hay solicitudes</p>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              {usuario?.rol === 'Admin MINED' 
                ? 'Crea la primera solicitud con el botón de arriba'
                : 'Solo Admin MINED puede crear solicitudes'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitudesFiltradas.map((solicitud) => {
              const estadoCol = ESTADO_COLORS[solicitud.estado] || ESTADO_COLORS.Pendiente
              return (
                <div key={solicitud.id}
                  className="rounded-2xl p-6"
                  style={{ background:'#ffffff', border:'1.5px solid #e0e0f0',
                    boxShadow:'0 2px 8px rgba(0,0,128,0.06)' }}>

                  {/* Header tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:estadoCol.bg, color:estadoCol.text }}>
                        {solicitud.estado}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:'#E8F5E9', color:'#2E7D32' }}>
                        x{solicitud.cantidad || 1}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color:'#9999bb' }}>
                      #{solicitud.id}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm font-medium mb-2" style={{ color:'#1a1a3a' }}>
                    {solicitud.descripcion}
                  </p>

                  {/* Info */}
                  <div className="text-xs mb-3" style={{ color:'#6b6b8a' }}>
                    {solicitud.escuela_nombre && <p>🏫 {solicitud.escuela_nombre}</p>}
                    {solicitud.item_nombre && <p>📦 {solicitud.item_nombre}</p>}
                    {solicitud.usuario_nombre && <p>👤 {solicitud.usuario_nombre}</p>}
                    {solicitud.fecha_solicitud && (
                      <p>📅 {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-NI')}</p>
                    )}
                  </div>

                  {/* Cambiar estado — Solo Admin */}
                  {usuario?.rol === 'Admin MINED' && solicitud.estado !== 'Completada' && (
                    <div className="flex gap-2 mt-3">
                      {solicitud.estado === 'Pendiente' && (
                        <button
                          onClick={() => cambiarEstado(solicitud.id, 'En proceso')}
                          className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                          style={{ background:'#E3F2FD', color:'#1565C0' }}>
                          → En proceso
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(solicitud.id, 'Completada')}
                        className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background:'#E8F5E9', color:'#2E7D32' }}>
                        ✓ Completada
                      </button>
                    </div>
                  )}

                  {/* Botón de borrar — Solo Admin */}
                  {usuario?.rol === 'Admin MINED' && (
                    <button
                      onClick={() => borrarSolicitud(solicitud.id)}
                      className="w-full py-2 rounded-lg text-xs font-medium cursor-pointer mt-3"
                      style={{ background:'#FFEBEE', color:'#B71C1C' }}>
                      🗑️ Eliminar solicitud
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}