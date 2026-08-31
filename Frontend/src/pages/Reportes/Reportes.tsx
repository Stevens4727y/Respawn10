/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const URGENCIA_COLORS = {
  Bajo:    { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  Medio:   { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  Alto:    { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  Critico: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A' },
}

const ESTADO_COLORS = {
  Pendiente:   { bg: '#FFF8E1', text: '#F57F17' },
  'En proceso':{ bg: '#E3F2FD', text: '#1565C0' },
  Resuelto:    { bg: '#E8F5E9', text: '#2E7D32' },
}

export default function Reportes() {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()
  const [reportes,    setReportes]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [filtroEstado,setFiltroEstado]= useState('Todos')
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  const [form, setForm] = useState({
    descripcion_daño: '',
    nivel_urgencia:   'Bajo',
    inventario:       '',
    foto:             null,
    observaciones:    '',
  })

  useEffect(() => { cargarReportes() }, [])

  const cargarReportes = async () => {
    try {
      setLoading(true)
      const res = await api.get('/reportes/')
      setReportes(res.data)
    } catch {
      setError('Error al cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const formData = new FormData()
      formData.append('descripcion_daño', form.descripcion_daño)
      formData.append('nivel_urgencia',   form.nivel_urgencia)
      formData.append('inventario',       form.inventario)
      formData.append('observaciones',    form.observaciones)
      if (form.foto) formData.append('foto', form.foto)

      await api.post('/reportes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Reporte creado correctamente')
      setShowForm(false)
      setForm({ descripcion_daño:'', nivel_urgencia:'Bajo', inventario:'', foto:null, observaciones:'' })
      cargarReportes()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al crear el reporte. Verifica los datos.')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/reportes/${id}/`, { estado: nuevoEstado })
      cargarReportes()
    } catch {
      setError('Error al actualizar el estado')
    }
  }

  const reportesFiltrados = filtroEstado === 'Todos'
    ? reportes
    : reportes.filter(r => r.estado === filtroEstado)

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
              ⚠️ Reportes de Daños
            </h1>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Gestión de daños en recursos escolares
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background:'linear-gradient(135deg, #000080, #0000cc)',
              boxShadow:'0 4px 15px rgba(0,0,128,0.3)' }}>
            + Nuevo Reporte
          </button>
        </div>

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

        {/* Formulario nuevo reporte */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background:'#fff', border:'1.5px solid #e0e0f0',
              boxShadow:'0 4px 20px rgba(0,0,128,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color:'#000080' }}>
              Nuevo Reporte de Daño
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Descripción del daño *
                </label>
                <textarea
                  value={form.descripcion_daño}
                  onChange={(e) => setForm({...form, descripcion_daño: e.target.value})}
                  placeholder="Describe detalladamente el daño encontrado..."
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
                  Nivel de urgencia *
                </label>
                <select
                  value={form.nivel_urgencia}
                  onChange={(e) => setForm({...form, nivel_urgencia: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}>
                  <option value="Bajo">🟢 Bajo</option>
                  <option value="Medio">🟡 Medio</option>
                  <option value="Alto">🟠 Alto</option>
                  <option value="Critico">🔴 Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  ID del Inventario *
                </label>
                <input
                  type="number"
                  value={form.inventario}
                  onChange={(e) => setForm({...form, inventario: e.target.value})}
                  placeholder="ID del item dañado"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Fotografía del daño
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({...form, foto: e.target.files[0]})}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Observaciones adicionales
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({...form, observaciones: e.target.value})}
                  placeholder="Información adicional sobre el daño..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a', resize:'none' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit"
                  className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
                  style={{ background:'linear-gradient(135deg, #000080, #0000cc)' }}>
                  Enviar Reporte
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
          {['Todos', 'Pendiente', 'En proceso', 'Resuelto'].map((estado) => (
            <button key={estado}
              onClick={() => setFiltroEstado(estado)}
              className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
              style={{
                background: filtroEstado === estado ? '#000080' : '#ffffff',
                color:      filtroEstado === estado ? '#ffffff' : '#000080',
                border:     `1.5px solid ${filtroEstado === estado ? '#000080' : '#e0e0f0'}`,
              }}>
              {estado} {estado !== 'Todos' && `(${reportes.filter(r => r.estado === estado).length})`}
            </button>
          ))}
        </div>

        {/* Lista de reportes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p style={{ color:'#6b6b8a' }}>Cargando reportes...</p>
          </div>
        ) : reportesFiltrados.length === 0 ? (
          <div className="text-center py-12 rounded-2xl"
            style={{ background:'#ffffff', border:'1.5px solid #e0e0f0' }}>
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium" style={{ color:'#000080' }}>No hay reportes</p>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Crea el primer reporte con el botón de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportesFiltrados.map((reporte) => {
              const urgColor  = URGENCIA_COLORS[reporte.nivel_urgencia] || URGENCIA_COLORS.Bajo
              const estadoCol = ESTADO_COLORS[reporte.estado]           || ESTADO_COLORS.Pendiente
              return (
                <div key={reporte.id}
                  className="rounded-2xl p-6"
                  style={{ background:'#ffffff', border:'1.5px solid #e0e0f0',
                    boxShadow:'0 2px 8px rgba(0,0,128,0.06)' }}>

                  {/* Header tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:urgColor.bg, color:urgColor.text,
                          border:`1px solid ${urgColor.border}` }}>
                        🚨 {reporte.nivel_urgencia}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:estadoCol.bg, color:estadoCol.text }}>
                        {reporte.estado}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color:'#9999bb' }}>
                      #{reporte.id}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm font-medium mb-2" style={{ color:'#1a1a3a' }}>
                    {reporte.descripcion_daño}
                  </p>

                  {/* Info */}
                  <div className="text-xs mb-3" style={{ color:'#6b6b8a' }}>
                    <p>🏫 {reporte.escuela_nombre || 'Sin escuela'}</p>
                    <p>📦 {reporte.item_nombre    || 'Sin item'}</p>
                    <p>👤 {reporte.usuario_nombre || 'Sin usuario'}</p>
                    <p>📅 {new Date(reporte.fecha_reporte).toLocaleDateString('es-NI')}</p>
                  </div>

                  {/* Foto */}
                  {reporte.foto_url && (
                    <img src={reporte.foto_url} alt="Daño"
                      className="w-full h-32 object-cover rounded-xl mb-3"
                      style={{ border:'1px solid #e0e0f0' }}
                    />
                  )}

                  {/* Observaciones */}
                  {reporte.observaciones && (
                    <p className="text-xs italic mb-3" style={{ color:'#9999bb' }}>
                      "{reporte.observaciones}"
                    </p>
                  )}

                  {/* Cambiar estado — Solo Admin */}
                  {usuario?.rol === 'Admin MINED' && reporte.estado !== 'Resuelto' && (
                    <div className="flex gap-2 mt-3">
                      {reporte.estado === 'Pendiente' && (
                        <button
                          onClick={() => cambiarEstado(reporte.id, 'En proceso')}
                          className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                          style={{ background:'#E3F2FD', color:'#1565C0' }}>
                          → En proceso
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(reporte.id, 'Resuelto')}
                        className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background:'#E8F5E9', color:'#2E7D32' }}>
                        ✓ Marcar resuelto
                      </button>
                    </div>
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