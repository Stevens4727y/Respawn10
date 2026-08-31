/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const normalizarRol = (rol) => {
  if (!rol) return 'Docente'
  if (rol === 'Admin') return 'Admin MINED'
  if (rol === 'Usuario') return 'Docente'
  return rol
}

export default function Inventario() {
  const { usuario }     = useAuth()
  const navigate        = useNavigate()
  const rol             = normalizarRol(usuario?.rol)

  const [inventarios,   setInventarios]   = useState([])
  const [categorias,    setCategorias]    = useState([])
  const [items,         setItems]         = useState([])
  const [instituciones, setInstituciones] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filtroCateg,   setFiltroCateg]   = useState('')
  const [filtroInst,    setFiltroInst]    = useState('')
  const [busqueda,      setBusqueda]      = useState('')
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [invRes, catRes, itemRes, instRes] = await Promise.all([
        api.get('/inventario/inventarios/'),
        api.get('/inventario/'),
        api.get('/inventario/items/'),
        api.get('/auth/instituciones/'),
      ])
      setInventarios(invRes.data)
      setCategorias(catRes.data)
      setItems(itemRes.data)
      setInstituciones(instRes.data)
    } catch {
      setError('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await api.delete('/inventario/inventarios/' + id + '/')
      setSuccess('Eliminado correctamente')
      cargarDatos()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al eliminar')
    }
  }

  const getEstadoBadge = (inv) => {
    if (inv.cantidad_total === 0)
      return { label:'Sin stock',  bg:'#F9FAFB', color:'#6B7280' }
    if (inv.cantidad_malo > 0 && inv.cantidad_malo === inv.cantidad_total)
      return { label:'Crítico',    bg:'#FEF2F2', color:'#EF4444' }
    if (inv.cantidad_regular > inv.cantidad_bueno)
      return { label:'Regular',    bg:'#FFFBEB', color:'#F59E0B' }
    return { label:'Disponible',   bg:'#F0FDF4', color:'#22C55E' }
  }

  const filtrados = inventarios.filter(inv => {
    const matchBusq = !busqueda ||
      inv.item_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      inv.escuela_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ('INV-' + String(inv.id).padStart(3,'0')).includes(busqueda.toUpperCase())
    const matchCat  = !filtroCateg || inv.categoria_nombre === filtroCateg
    const matchInst = !filtroInst  || inv.escuela_nombre === filtroInst ||
                      String(inv.escuela) === filtroInst
    return matchBusq && matchCat && matchInst
  })

  return (
    <div style={{ fontFamily:'Inter, sans-serif' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, margin:'0 0 4px', color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            Inventario
          </h1>
          <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>
            {rol === 'Admin MINED' && 'Vista nacional — todos los recursos del sistema'}
            {(rol === 'Director' || rol === 'Docente') && 'Recursos de tu institución asignada'}
            {rol === 'Auditor' && 'Vista de solo lectura'}
          </p>
        </div>
        {rol === 'Admin MINED' && (
          <button onClick={() => navigate('/registrar')}
            style={{
              background:'linear-gradient(135deg, #000080, #0000cc)',
              color:'#fff', border:'none', borderRadius:'10px',
              padding:'10px 20px', fontSize:'13px', fontWeight:600,
              cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,128,0.3)',
            }}>
            + Agregar bien
          </button>
        )}
      </div>

      {/* Barra de filtros */}
      <div style={{
        display:'flex', gap:'10px', marginBottom:'16px',
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'12px', padding:'14px', flexWrap:'wrap',
      }}>
        {/* Buscador */}
        <div style={{ position:'relative', flex:2, minWidth:'200px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:'var(--text-tertiary)' }}>🔍</span>
          <input type="text" value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar recurso, código INV-001..."
            style={{
              width:'100%', height:'38px', paddingLeft:'36px', paddingRight:'14px',
              borderRadius:'9px', border:'1.5px solid var(--border)',
              background:'var(--bg-base)', color:'var(--text-primary)',
              fontSize:'13px', fontFamily:'Inter, sans-serif', outline:'none',
            }}
            onFocus={(e) => e.target.style.borderColor='#000080'}
            onBlur={(e)  => e.target.style.borderColor='var(--border)'}
          />
        </div>

        {/* Filtro por categoría */}
        <select value={filtroCateg}
          onChange={(e) => setFiltroCateg(e.target.value)}
          style={{
            height:'38px', padding:'0 14px', borderRadius:'9px',
            border:'1.5px solid var(--border)', background:'var(--bg-base)',
            color:'var(--text-primary)', fontSize:'13px',
            fontFamily:'Inter, sans-serif', cursor:'pointer', outline:'none',
            minWidth:'160px',
          }}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>

        {/* Filtro por institución — solo Admin */}
        {rol === 'Admin MINED' && (
          <select value={filtroInst}
            onChange={(e) => setFiltroInst(e.target.value)}
            style={{
              height:'38px', padding:'0 14px', borderRadius:'9px',
              border:'1.5px solid var(--border)', background:'var(--bg-base)',
              color:'var(--text-primary)', fontSize:'13px',
              fontFamily:'Inter, sans-serif', cursor:'pointer', outline:'none',
              minWidth:'200px',
            }}>
            <option value="">Todas las instituciones</option>
            {instituciones.map(i => (
              <option key={i.id} value={i.nombre}>
                {i.nombre} ({i.tipo})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Mensajes */}
      {error && <div style={{ marginBottom:'12px', padding:'10px 14px', borderRadius:'10px', background:'var(--error-bg)', border:'1px solid var(--error-border)', color:'var(--error-text)', fontSize:'13px' }}>⚠️ {error}</div>}
      {success && <div style={{ marginBottom:'12px', padding:'10px 14px', borderRadius:'10px', background:'var(--success-bg)', border:'1px solid var(--success-border)', color:'var(--success-text)', fontSize:'13px' }}>✅ {success}</div>}

      {/* Tabla */}
      <div style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'14px', overflow:'hidden',
        boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#000080' }}>
              {['Código','Nombre','Categoría','Institución','Cantidad','Estado','Acciones'].map(h => (
                <th key={h} style={{
                  padding:'12px 16px', textAlign:'left',
                  fontSize:'11px', fontWeight:700,
                  color:'rgba(255,255,255,0.9)',
                  letterSpacing:'0.05em', textTransform:'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'var(--text-tertiary)', fontSize:'13px' }}>⏳ Cargando inventario...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding:'40px', textAlign:'center' }}>
                  <div style={{ fontSize:'36px', marginBottom:'8px' }}>📦</div>
                  <p style={{ color:'var(--text-secondary)', fontSize:'13px', margin:'0 0 12px' }}>
                    No hay recursos registrados
                  </p>
                  {rol === 'Admin MINED' && (
                    <button onClick={() => navigate('/registrar')}
                      style={{
                        background:'#000080', color:'#fff', border:'none',
                        borderRadius:'9px', padding:'8px 18px',
                        fontSize:'12px', cursor:'pointer', fontWeight:600,
                      }}>
                      + Agregar primer bien
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtrados.map((inv, idx) => {
                const codigo = 'INV-' + String(inv.id).padStart(3, '0')
                const badge  = getEstadoBadge(inv)
                return (
                  <tr key={inv.id}
                    style={{
                      background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)',
                      borderBottom:'1px solid var(--border)',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background=idx%2===0?'var(--bg-card)':'var(--bg-base)'}
                  >
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        fontFamily:'monospace', fontSize:'12px', fontWeight:700,
                        color:'#000080', background:'#EEEEFF',
                        padding:'3px 8px', borderRadius:'6px',
                      }}>
                        {codigo}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:'var(--text-primary)' }}>
                        {inv.item_nombre}
                      </p>
                      <p style={{ margin:0, fontSize:'11px', color:'var(--text-tertiary)' }}>
                        {inv.unidad_medida}
                      </p>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:'12px', color:'var(--text-secondary)' }}>
                      {inv.categoria_nombre}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:'12px', color:'var(--text-secondary)' }}>
                      {inv.escuela_nombre || '—'}
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div>
                        <span style={{ fontSize:'15px', fontWeight:800, color:'var(--text-primary)' }}>
                          {inv.cantidad_total}
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:'4px', marginTop:'3px' }}>
                        <span style={{ fontSize:'10px', color:'#22C55E' }}>✓{inv.cantidad_bueno}</span>
                        <span style={{ fontSize:'10px', color:'#F59E0B' }}>~{inv.cantidad_regular}</span>
                        <span style={{ fontSize:'10px', color:'#EF4444' }}>✗{inv.cantidad_malo}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        fontSize:'11px', padding:'4px 10px',
                        borderRadius:'20px', fontWeight:600,
                        background:badge.bg, color:badge.color,
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {rol !== 'Auditor' && (
                          <button style={{
                            fontSize:'12px', padding:'5px 12px',
                            borderRadius:'7px', border:'1px solid var(--border)',
                            cursor:'pointer', fontWeight:600,
                            background:'var(--bg-base)', color:'var(--text-primary)',
                          }}>
                            Editar
                          </button>
                        )}
                        <button style={{
                          fontSize:'12px', padding:'5px 12px',
                          borderRadius:'7px', border:'none',
                          cursor:'pointer', fontWeight:600,
                          background:'#EEEEFF', color:'#000080',
                        }}>
                          Ver
                        </button>
                        {rol === 'Admin MINED' && (
                          <button onClick={() => handleEliminar(inv.id)}
                            style={{
                              fontSize:'12px', padding:'5px 12px',
                              borderRadius:'7px', border:'none',
                              cursor:'pointer', fontWeight:600,
                              background:'#FEF2F2', color:'#EF4444',
                            }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {filtrados.length > 0 && (
          <div style={{
            padding:'10px 16px', borderTop:'1px solid var(--border)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{ fontSize:'12px', color:'var(--text-tertiary)' }}>
              Mostrando {filtrados.length} de {inventarios.length} registros
            </span>
            {filtroInst && (
              <span style={{
                fontSize:'11px', padding:'3px 10px', borderRadius:'20px',
                background:'#EEEEFF', color:'#000080', fontWeight:600,
              }}>
                🏫 Filtrando: {filtroInst}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}