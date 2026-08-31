/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const MOVIMIENTO_COLORS = {
  Entrada: { bg: '#E8F5E9', text: '#2E7D32', icon: '📦' },
  Salida:  { bg: '#FFF3E0', text: '#E65100', icon: '📤' },
}

const ESTADO_COLORS = {
  Enviado:    { bg: '#FFF8E1', text: '#F57F17' },
  Recibido:   { bg: '#E3F2FD', text: '#1565C0' },
  Confirmado: { bg: '#E8F5E9', text: '#2E7D32' },
}

export default function Distribucion() {
  const { usuario, logout } = useAuth()
  const navigate             = useNavigate()
  const [distribuciones, setDistribuciones] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [filtroEstado,   setFiltroEstado]   = useState('Todos')
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState('')
  const [inventarios,    setInventarios]    = useState([])
  const [escuelas,       setEscuelas]       = useState([])

  const [form, setForm] = useState({
    tipo_movimiento: 'Salida',
    cantidad_enviada: 1,
    item: '',
    escuela: '',
    observaciones: '',
  })

  useEffect(() => { 
    cargarDistribuciones()
    cargarInventarios()
    cargarEscuelas()
  }, [])

  const cargarDistribuciones = async () => {
    try {
      setLoading(true)
      const res = await api.get('/distribucion/')
      setDistribuciones(res.data)
    } catch {
      setError('Error al cargar las distribuciones')
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

  const cargarEscuelas = async () => {
    try {
      const res = await api.get('/auth/instituciones/')
      setEscuelas(res.data)
    } catch {
      console.error('Error al cargar escuelas')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/distribucion/', {
        tipo_movimiento: form.tipo_movimiento,
        cantidad_enviada: form.cantidad_enviada,
        item: form.item,
        escuela: form.escuela,
        observaciones: form.observaciones,
        estado: 'Enviado',
      })
      setSuccess('Solicitud de distribución creada correctamente')
      setShowForm(false)
      setForm({ tipo_movimiento: 'Salida', cantidad_enviada: 1, item: '', escuela: '', observaciones: '' })
      cargarDistribuciones()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la solicitud de distribución')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    if (usuario?.rol !== 'Admin MINED') {
      setError('Solo Admin MINED puede cambiar el estado')
      return
    }
    try {
      await api.patch(`/distribucion/${id}/`, { estado: nuevoEstado })
      cargarDistribuciones()
    } catch {
      setError('Error al actualizar el estado')
    }
  }

  const distribucionesFiltradas = filtroEstado === 'Todos'
    ? distribuciones
    : distribuciones.filter(d => d.estado === filtroEstado)

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
              📦 Distribución de Recursos
            </h1>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Gestión de distribución de items a instituciones por departamento
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background:'linear-gradient(135deg, #000080, #0000cc)',
              boxShadow:'0 4px 15px rgba(0,0,128,0.3)' }}>
            + Nueva Distribución
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

        {/* Formulario nueva distribución */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background:'#fff', border:'1.5px solid #e0e0f0',
              boxShadow:'0 4px 20px rgba(0,0,128,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color:'#000080' }}>
              Nueva Solicitud de Distribución
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Tipo de movimiento *
                </label>
                <select
                  value={form.tipo_movimiento}
                  onChange={(e) => setForm({...form, tipo_movimiento: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}>
                  <option value="Entrada">📥 Entrada</option>
                  <option value="Salida">📤 Salida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Item *
                </label>
                <select
                  value={form.item}
                  onChange={(e) => setForm({...form, item: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}>
                  <option value="">Selecciona un item</option>
                  {inventarios.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.item_nombre || `Item ${inv.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Escuela destino *
                </label>
                <select
                  value={form.escuela}
                  onChange={(e) => setForm({...form, escuela: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}>
                  <option value="">Selecciona una escuela</option>
                  {escuelas.map(esc => (
                    <option key={esc.id} value={esc.id}>
                      {esc.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad_enviada}
                  onChange={(e) => setForm({...form, cantidad_enviada: parseInt(e.target.value)})}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({...form, observaciones: e.target.value})}
                  placeholder="Notas adicionales sobre la distribución..."
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
                  Solicitar Distribución
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
          {['Todos', 'Enviado', 'Recibido', 'Confirmado'].map((estado) => (
            <button key={estado}
              onClick={() => setFiltroEstado(estado)}
              className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
              style={{
                background: filtroEstado === estado ? '#000080' : '#ffffff',
                color:      filtroEstado === estado ? '#ffffff' : '#000080',
                border:     `1.5px solid ${filtroEstado === estado ? '#000080' : '#e0e0f0'}`,
              }}>
              {estado} {estado !== 'Todos' && `(${distribuciones.filter(d => d.estado === estado).length})`}
            </button>
          ))}
        </div>

        {/* Lista de distribuciones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p style={{ color:'#6b6b8a' }}>Cargando distribuciones...</p>
          </div>
        ) : distribucionesFiltradas.length === 0 ? (
          <div className="text-center py-12 rounded-2xl"
            style={{ background:'#ffffff', border:'1.5px solid #e0e0f0' }}>
            <div className="text-5xl mb-4">📦</div>
            <p className="font-medium" style={{ color:'#000080' }}>No hay distribuciones</p>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Crea la primera solicitud de distribución con el botón de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distribucionesFiltradas.map((dist) => {
              const movCol = MOVIMIENTO_COLORS[dist.tipo_movimiento] || MOVIMIENTO_COLORS.Salida
              const estadoCol = ESTADO_COLORS[dist.estado] || ESTADO_COLORS.Enviado
              return (
                <div key={dist.id}
                  className="rounded-2xl p-6"
                  style={{ background:'#ffffff', border:'1.5px solid #e0e0f0',
                    boxShadow:'0 2px 8px rgba(0,0,128,0.06)' }}>

                  {/* Header tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:movCol.bg, color:movCol.text }}>
                        {movCol.icon} {dist.tipo_movimiento}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background:estadoCol.bg, color:estadoCol.text }}>
                        {dist.estado}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color:'#9999bb' }}>
                      #{dist.id}
                    </span>
                  </div>

                  {/* Info principal */}
                  <div className="mb-3">
                    <p className="text-sm font-medium" style={{ color:'#1a1a3a' }}>
                      {dist.item_nombre || 'Sin item'}
                    </p>
                    <p className="text-xs" style={{ color:'#6b6b8a' }}>
                      Cantidad: {dist.cantidad_enviada}
                    </p>
                  </div>

                  {/* Detalles */}
                  <div className="text-xs mb-3" style={{ color:'#6b6b8a' }}>
                    <p>🏫 {dist.escuela_nombre || 'Sin escuela'}</p>
                    <p>👤 Solicitante: {dist.usuario_nombre || 'Sin usuario'}</p>
                    <p>📅 {new Date(dist.fecha_envio).toLocaleDateString('es-NI')}</p>
                    {dist.observaciones && <p className="italic">"{dist.observaciones}"</p>}
                  </div>

                  {/* Cambiar estado — Solo Admin */}
                  {usuario?.rol === 'Admin MINED' && dist.estado !== 'Confirmado' && (
                    <div className="flex gap-2 mt-3">
                      {dist.estado === 'Enviado' && (
                        <button
                          onClick={() => cambiarEstado(dist.id, 'Recibido')}
                          className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                          style={{ background:'#E3F2FD', color:'#1565C0' }}>
                          → Recibido
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(dist.id, 'Confirmado')}
                        className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background:'#E8F5E9', color:'#2E7D32' }}>
                        ✓ Confirmado
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