/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const ESTADO_COLOR = {
  bueno:   { bg:'#E8F5E9', text:'#2E7D32', label:'Bueno' },
  regular: { bg:'#FFF8E1', text:'#F57F17', label:'Regular' },
  malo:    { bg:'#FFEBEE', text:'#B71C1C', label:'Malo' },
}

export default function Inventario() {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()

  const [inventarios,  setInventarios]  = useState([])
  const [categorias,   setCategorias]   = useState([])
  const [items,        setItems]        = useState([])
  const [resumen,      setResumen]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [filtro,       setFiltro]       = useState('')
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [editando,     setEditando]     = useState(null)

  const [form, setForm] = useState({
    escuela:          '',
    item:             '',
    cantidad_total:   0,
    cantidad_bueno:   0,
    cantidad_regular: 0,
    cantidad_malo:    0,
    observaciones:    '',
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [invRes, catRes, itemRes, resRes] = await Promise.all([
        api.get('/inventario/inventarios/'),
        api.get('/inventario/'),
        api.get('/inventario/items/'),
        api.get('/inventario/resumen/'),
      ])
      setInventarios(invRes.data)
      setCategorias(catRes.data)
      setItems(itemRes.data)
      setResumen(resRes.data)
    } catch {
      setError('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editando) {
        await api.patch(`/inventario/inventarios/${editando}/`, form)
        setSuccess('Inventario actualizado correctamente')
      } else {
        await api.post('/inventario/inventarios/', form)
        setSuccess('Item agregado al inventario')
      }
      setShowForm(false)
      setEditando(null)
      setForm({ escuela:'', item:'', cantidad_total:0, cantidad_bueno:0, cantidad_regular:0, cantidad_malo:0, observaciones:'' })
      cargarDatos()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al guardar. Verifica los datos.')
    }
  }

  const handleEditar = (inv) => {
    setEditando(inv.id)
    setForm({
      escuela:          inv.escuela,
      item:             inv.item,
      cantidad_total:   inv.cantidad_total,
      cantidad_bueno:   inv.cantidad_bueno,
      cantidad_regular: inv.cantidad_regular,
      cantidad_malo:    inv.cantidad_malo,
      observaciones:    inv.observaciones || '',
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return
    try {
      await api.delete(`/inventario/inventarios/${id}/`)
      setSuccess('Registro eliminado')
      cargarDatos()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al eliminar')
    }
  }

  const inventariosFiltrados = inventarios.filter(inv =>
    inv.item_nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    inv.escuela_nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    inv.categoria_nombre?.toLowerCase().includes(filtro.toLowerCase())
  )

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
              📦 Inventario Escolar
            </h1>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Gestión de recursos educativos
            </p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditando(null) }}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background:'linear-gradient(135deg, #000080, #0000cc)',
              boxShadow:'0 4px 15px rgba(0,0,128,0.3)' }}>
            + Agregar Item
          </button>
        </div>

        {/* Tarjetas de resumen */}
        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label:'Total Items',  value:resumen.total_items,   color:'#000080', bg:'#EEEEFF' },
              { label:'Total Unidades',value:resumen.total_general,color:'#000080', bg:'#EEEEFF' },
              { label:'En Buen Estado',value:resumen.total_bueno,  color:'#2E7D32', bg:'#E8F5E9' },
              { label:'En Regular',   value:resumen.total_regular, color:'#F57F17', bg:'#FFF8E1' },
              { label:'En Mal Estado',value:resumen.total_malo,    color:'#B71C1C', bg:'#FFEBEE' },
            ].map((stat) => (
              <div key={stat.label}
                className="rounded-xl p-4 text-center"
                style={{ background:stat.bg, border:`1.5px solid ${stat.color}22` }}>
                <div className="text-2xl font-bold" style={{ color:stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color:stat.color }}>
                  {stat.label}
                </div>
              </div>
            ))}
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

        {/* Formulario */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background:'#fff', border:'1.5px solid #e0e0f0',
              boxShadow:'0 4px 20px rgba(0,0,128,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color:'#000080' }}>
              {editando ? 'Editar Item de Inventario' : 'Agregar Item al Inventario'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {!editando && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                      ID de la Escuela *
                    </label>
                    <input type="number"
                      value={form.escuela}
                      onChange={(e) => setForm({...form, escuela: e.target.value})}
                      placeholder="ID de la escuela"
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                      onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                      onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                    />
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
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} ({item.unidad_medida})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Cantidad Total *
                </label>
                <input type="number" min="0"
                  value={form.cantidad_total}
                  onChange={(e) => setForm({...form, cantidad_total: parseInt(e.target.value) || 0})}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#2E7D32' }}>
                  Cantidad en Buen Estado
                </label>
                <input type="number" min="0"
                  value={form.cantidad_bueno}
                  onChange={(e) => setForm({...form, cantidad_bueno: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #A5D6A7', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #2E7D32'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #A5D6A7'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#F57F17' }}>
                  Cantidad en Estado Regular
                </label>
                <input type="number" min="0"
                  value={form.cantidad_regular}
                  onChange={(e) => setForm({...form, cantidad_regular: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #FFE082', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #F57F17'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #FFE082'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color:'#B71C1C' }}>
                  Cantidad en Mal Estado
                </label>
                <input type="number" min="0"
                  value={form.cantidad_malo}
                  onChange={(e) => setForm({...form, cantidad_malo: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border:'1.5px solid #EF9A9A', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #B71C1C'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #EF9A9A'}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color:'#000080' }}>
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({...form, observaciones: e.target.value})}
                  placeholder="Notas adicionales sobre el estado del inventario..."
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
                  {editando ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditando(null) }}
                  className="px-6 py-3 rounded-xl font-semibold cursor-pointer"
                  style={{ background:'#f0f0f8', color:'#000080' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="🔍 Buscar por item, escuela o categoría..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background:'#fff', border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
            onFocus={(e) => e.target.style.border='1.5px solid #000080'}
            onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
          />
        </div>

        {/* Tabla de inventario */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p style={{ color:'#6b6b8a' }}>Cargando inventario...</p>
          </div>
        ) : inventariosFiltrados.length === 0 ? (
          <div className="text-center py-12 rounded-2xl"
            style={{ background:'#ffffff', border:'1.5px solid #e0e0f0' }}>
            <div className="text-5xl mb-4">📦</div>
            <p className="font-medium" style={{ color:'#000080' }}>No hay items en el inventario</p>
            <p className="text-sm mt-1" style={{ color:'#6b6b8a' }}>
              Agrega el primer item con el botón de arriba
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ border:'1.5px solid #e0e0f0', boxShadow:'0 2px 8px rgba(0,0,128,0.06)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background:'#000080' }}>
                  {['#', 'Item', 'Categoría', 'Escuela', 'Total', 'Bueno', 'Regular', 'Malo', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventariosFiltrados.map((inv, idx) => {
                  const pctBueno   = inv.cantidad_total > 0 ? Math.round((inv.cantidad_bueno   / inv.cantidad_total) * 100) : 0
                  const pctRegular = inv.cantidad_total > 0 ? Math.round((inv.cantidad_regular / inv.cantidad_total) * 100) : 0
                  const pctMalo    = inv.cantidad_total > 0 ? Math.round((inv.cantidad_malo    / inv.cantidad_total) * 100) : 0
                  return (
                    <tr key={inv.id}
                      style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8f8ff',
                        borderBottom:'1px solid #e0e0f0' }}>
                      <td className="px-4 py-3 text-xs" style={{ color:'#9999bb' }}>{inv.id}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color:'#1a1a3a' }}>
                        {inv.item_nombre}
                        <div className="text-xs" style={{ color:'#9999bb' }}>{inv.unidad_medida}</div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color:'#6b6b8a' }}>
                        {inv.categoria_nombre}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color:'#6b6b8a' }}>
                        {inv.escuela_nombre}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color:'#000080' }}>
                        {inv.cantidad_total}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background:'#E8F5E9', color:'#2E7D32' }}>
                          {inv.cantidad_bueno} ({pctBueno}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background:'#FFF8E1', color:'#F57F17' }}>
                          {inv.cantidad_regular} ({pctRegular}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background:'#FFEBEE', color:'#B71C1C' }}>
                          {inv.cantidad_malo} ({pctMalo}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditar(inv)}
                            className="text-xs px-3 py-1 rounded-lg cursor-pointer font-medium"
                            style={{ background:'#E3F2FD', color:'#1565C0' }}>
                            Editar
                          </button>
                          {usuario?.rol === 'Admin MINED' && (
                            <button onClick={() => handleEliminar(inv.id)}
                              className="text-xs px-3 py-1 rounded-lg cursor-pointer font-medium"
                              style={{ background:'#FFEBEE', color:'#B71C1C' }}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}