/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const ESTADO_COLOR = {
  Bueno:           { bg:'#F0FDF4', text:'#15803D', icon:'✅' },
  Regular:         { bg:'#FFFBEB', text:'#B45309', icon:'⚠️' },
  Malo:            { bg:'#FEF2F2', text:'#B91C1C', icon:'❌' },
  'En reparacion': { bg:'#EFF6FF', text:'#1D4ED8', icon:'🔧' },
}

const TIPO_ICONS = {
  Aula:'🏫', Laboratorio:'🔬', Oficina:'🏢',
  Baño:'🚽', Cancha:'⚽', Biblioteca:'📚', Comedor:'🍽️',
}

export default function Infraestructura() {
  const { usuario } = useAuth()
  const rol = usuario?.rol

  const [infras,              setInfras]              = useState([])
  const [loading,             setLoading]             = useState(true)
  const [showForm,            setShowForm]            = useState(false)
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState(null)
  const [filtroTipo,          setFiltroTipo]          = useState('Todos')
  const [error,               setError]               = useState('')
  const [success,             setSuccess]             = useState('')
  const [editando,            setEditando]            = useState(null)

  const [form, setForm] = useState({
    nombre: '', tipo: 'Aula', estado: 'Bueno',
    capacidad: '', año_construccion: '',
    area_m2: '', observaciones: '', escuela: '',
  })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const res = await api.get('/infraestructura/')
      setInfras(res.data)
    } catch {
      setError('Error al cargar infraestructura')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      if (escuelaSeleccionada && !editando) {
        payload.escuela = escuelaSeleccionada
      }
      if (editando) {
        await api.patch('/infraestructura/' + editando + '/', payload)
        setSuccess('Actualizado correctamente')
      } else {
        await api.post('/infraestructura/', payload)
        setSuccess('Espacio registrado correctamente')
      }
      setShowForm(false)
      setEditando(null)
      setForm({ nombre:'', tipo:'Aula', estado:'Bueno', capacidad:'', año_construccion:'', area_m2:'', observaciones:'', escuela:'' })
      cargarDatos()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al guardar')
    }
  }

  const abrirEdicion = (infra) => {
    setEditando(infra.id)
    setForm({
      nombre: infra.nombre,
      tipo: infra.tipo,
      estado: infra.estado,
      capacidad: infra.capacidad || '',
      año_construccion: infra.año_construccion || '',
      area_m2: infra.area_m2 || '',
      observaciones: infra.observaciones || '',
      escuela: infra.escuela,
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const escuelas = [...new Map(
    infras.map(i => [i.escuela, {
      id: i.escuela,
      nombre: i.escuela_nombre,
      departamento: i.departamento,
    }])
  ).values()]

  const infrasDeEscuela = escuelaSeleccionada
    ? infras.filter(i => i.escuela === escuelaSeleccionada)
    : []

  const filtradas = filtroTipo === 'Todos'
    ? infrasDeEscuela
    : infrasDeEscuela.filter(i => i.tipo === filtroTipo)

  const contarEstado = (estado) => infras.filter(i => i.estado === estado).length

  const iStyle = {
    width: '100%', height: '38px', padding: '0 12px',
    borderRadius: '9px', border: '1.5px solid var(--border)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    fontSize: '13px', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  const lbl = (text, req = false) => (
    <label style={{
      display: 'block', fontSize: '11px', fontWeight: 700,
      color: 'var(--text-secondary)', marginBottom: '5px',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {text} {req && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, margin:'0 0 4px', color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            🏗️ Infraestructura Escolar
          </h1>
          <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>
            {rol === 'Admin MINED' && 'Vista nacional — selecciona una escuela'}
            {rol === 'Supervisor'  && 'Escuelas de tu departamento'}
            {rol === 'Director'    && 'Infraestructura de tu escuela'}
            {rol === 'Docente'     && 'Consulta de infraestructura'}
          </p>
        </div>
        {(rol === 'Admin MINED' || rol === 'Director') && escuelaSeleccionada && (
          <button
            onClick={() => { setShowForm(!showForm); setEditando(null) }}
            style={{
              background: 'linear-gradient(135deg, #000080, #0000cc)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,128,0.3)',
            }}
          >
            + Registrar espacio
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        {[
          { label:'Total Espacios', value:infras.length,           icon:'🏫', color:'#000080', bg:'#EEEEFF' },
          { label:'Buen Estado',    value:contarEstado('Bueno'),   icon:'✅', color:'#15803D', bg:'#F0FDF4' },
          { label:'Regular',        value:contarEstado('Regular'), icon:'⚠️', color:'#B45309', bg:'#FFFBEB' },
          { label:'Mal Estado',     value:contarEstado('Malo'),    icon:'❌', color:'#B91C1C', bg:'#FEF2F2' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width:'40px', height:'40px', borderRadius:'10px',
              background: s.bg, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'18px', flexShrink:0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize:'22px', fontWeight:800, margin:0, color:'var(--text-primary)' }}>{s.value}</p>
              <p style={{ fontSize:'11px', color:'var(--text-secondary)', margin:0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mensajes */}
      {error && (
        <div style={{ marginBottom:'12px', padding:'10px 14px', borderRadius:'10px', background:'var(--error-bg)', border:'1px solid var(--error-border)', color:'var(--error-text)', fontSize:'13px' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom:'12px', padding:'10px 14px', borderRadius:'10px', background:'var(--success-bg)', border:'1px solid var(--success-border)', color:'var(--success-text)', fontSize:'13px' }}>
          ✅ {success}
        </div>
      )}

      {/* Layout 2 columnas */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' }}>

        {/* Lista escuelas */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', height:'fit-content' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'#000080' }}>
            <p style={{ margin:0, fontSize:'13px', fontWeight:700, color:'#fff' }}>
              🏫 Escuelas ({escuelas.length})
            </p>
          </div>

          {loading ? (
            <div style={{ padding:'20px', textAlign:'center', color:'var(--text-tertiary)', fontSize:'13px' }}>⏳ Cargando...</div>
          ) : escuelas.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', color:'var(--text-tertiary)', fontSize:'13px' }}>
              No hay datos registrados
            </div>
          ) : (
            <div style={{ maxHeight:'480px', overflowY:'auto' }}>
              {escuelas.map((esc) => {
                const cant   = infras.filter(i => i.escuela === esc.id).length
                const activa = escuelaSeleccionada === esc.id
                return (
                  <button
                    key={esc.id}
                    onClick={() => setEscuelaSeleccionada(esc.id)}
                    style={{
                      width:'100%', padding:'12px 16px',
                      border:'none', borderBottom:'1px solid var(--border)',
                      cursor:'pointer', textAlign:'left',
                      background: activa ? 'var(--primary-light)' : 'transparent',
                      borderLeft: activa ? '3px solid #000080' : '3px solid transparent',
                      transition:'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!activa) e.currentTarget.style.background = 'var(--bg-hover)' }}
                    onMouseLeave={(e) => { if (!activa) e.currentTarget.style.background = 'transparent' }}
                  >
                    <p style={{ margin:0, fontSize:'13px', fontWeight:600, color: activa ? '#000080' : 'var(--text-primary)' }}>
                      {esc.nombre || 'Escuela #' + esc.id}
                    </p>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2px' }}>
                      <p style={{ margin:0, fontSize:'11px', color:'var(--text-tertiary)' }}>
                        {esc.departamento || 'Sin departamento'}
                      </p>
                      <span style={{ fontSize:'10px', fontWeight:700, color: activa ? '#000080' : 'var(--text-tertiary)' }}>
                        {cant} espacios
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div>
          {!escuelaSeleccionada ? (
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'60px 20px', textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>🏫</div>
              <p style={{ fontSize:'15px', fontWeight:600, color:'var(--text-primary)', margin:'0 0 4px' }}>
                Selecciona una escuela
              </p>
              <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>
                Haz clic en una escuela del panel izquierdo para ver sus espacios
              </p>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
                {['Todos','Aula','Laboratorio','Oficina','Baño','Cancha','Biblioteca','Comedor'].map(tipo => (
                  <button key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    style={{
                      padding:'6px 14px', borderRadius:'20px',
                      border: filtroTipo === tipo ? 'none' : '1px solid var(--border)',
                      cursor:'pointer', fontSize:'12px', fontWeight:500,
                      background: filtroTipo === tipo ? '#000080' : 'var(--bg-card)',
                      color:      filtroTipo === tipo ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {tipo !== 'Todos' ? TIPO_ICONS[tipo] + ' ' : ''}{tipo}
                  </button>
                ))}
              </div>

              {/* Formulario */}
              {showForm && (
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px', marginBottom:'14px' }}>
                  <h2 style={{ fontSize:'14px', fontWeight:700, margin:'0 0 16px', color:'var(--text-primary)' }}>
                    {editando ? 'Editar espacio' : 'Registrar nuevo espacio'}
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>

                      <div>
                        {lbl('Nombre', true)}
                        <input type="text" value={form.nombre} required
                          onChange={(e) => setForm({...form, nombre: e.target.value})}
                          placeholder="Ej: Aula 1A"
                          style={iStyle}
                          onFocus={(e) => e.target.style.borderColor='#000080'}
                          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
                        />
                      </div>

                      <div>
                        {lbl('Tipo', true)}
                        <select value={form.tipo}
                          onChange={(e) => setForm({...form, tipo: e.target.value})}
                          style={{ ...iStyle, cursor:'pointer' }}
                        >
                          {['Aula','Laboratorio','Oficina','Baño','Cancha','Biblioteca','Comedor'].map(t => (
                            <option key={t} value={t}>{TIPO_ICONS[t]} {t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {lbl('Estado', true)}
                        <select value={form.estado}
                          onChange={(e) => setForm({...form, estado: e.target.value})}
                          style={{ ...iStyle, cursor:'pointer' }}
                        >
                          <option value="Bueno">✅ Bueno</option>
                          <option value="Regular">⚠️ Regular</option>
                          <option value="Malo">❌ Malo</option>
                          <option value="En reparacion">🔧 En reparación</option>
                        </select>
                      </div>

                      <div>
                        {lbl('Capacidad (personas)')}
                        <input type="number" min="0" value={form.capacidad}
                          onChange={(e) => setForm({...form, capacidad: e.target.value})}
                          placeholder="Ej: 30"
                          style={iStyle}
                          onFocus={(e) => e.target.style.borderColor='#000080'}
                          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
                        />
                      </div>

                      <div>
                        {lbl('Año construcción')}
                        <input type="number" value={form.año_construccion}
                          onChange={(e) => setForm({...form, año_construccion: e.target.value})}
                          placeholder="Ej: 2000"
                          style={iStyle}
                          onFocus={(e) => e.target.style.borderColor='#000080'}
                          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
                        />
                      </div>

                      <div>
                        {lbl('Área (m²)')}
                        <input type="number" value={form.area_m2}
                          onChange={(e) => setForm({...form, area_m2: e.target.value})}
                          placeholder="Ej: 48"
                          style={iStyle}
                          onFocus={(e) => e.target.style.borderColor='#000080'}
                          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
                        />
                      </div>

                      {!editando && (
                        <div>
                          {lbl('ID Escuela')}
                          <input type="number"
                            value={escuelaSeleccionada || form.escuela}
                            readOnly
                            style={{ ...iStyle, background:'var(--bg-base)', color:'var(--text-tertiary)' }}
                          />
                        </div>
                      )}

                      <div style={{ gridColumn:'1/-1' }}>
                        {lbl('Observaciones')}
                        <textarea value={form.observaciones}
                          onChange={(e) => setForm({...form, observaciones: e.target.value})}
                          placeholder="Estado actual, daños visibles..."
                          rows={2}
                          style={{ ...iStyle, height:'auto', padding:'10px 12px', resize:'vertical' }}
                          onFocus={(e) => e.target.style.borderColor='#000080'}
                          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
                        />
                      </div>
                    </div>

                    <div style={{ display:'flex', gap:'10px', marginTop:'14px' }}>
                      <button type="submit" style={{ padding:'9px 20px', borderRadius:'9px', border:'none', background:'#000080', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                        {editando ? 'Actualizar' : 'Registrar'}
                      </button>
                      <button type="button"
                        onClick={() => { setShowForm(false); setEditando(null) }}
                        style={{ padding:'9px 20px', borderRadius:'9px', border:'1px solid var(--border)', background:'var(--bg-base)', color:'var(--text-secondary)', fontSize:'13px', cursor:'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid de espacios */}
              {filtradas.length === 0 ? (
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'40px', textAlign:'center' }}>
                  <div style={{ fontSize:'36px', marginBottom:'8px' }}>🏗️</div>
                  <p style={{ fontSize:'14px', fontWeight:600, color:'var(--text-primary)', margin:'0 0 4px' }}>
                    No hay espacios registrados
                  </p>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>
                    {filtroTipo !== 'Todos' ? 'No hay ' + filtroTipo + 's en esta escuela' : 'Registra el primer espacio'}
                  </p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px' }}>
                  {filtradas.map((infra) => {
                    const ec = ESTADO_COLOR[infra.estado] || ESTADO_COLOR.Bueno
                    return (
                      <div key={infra.id}
                        style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px', transition:'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor='#000080'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,128,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                          <span style={{ fontSize:'24px' }}>{TIPO_ICONS[infra.tipo] || '🏫'}</span>
                          <span style={{ fontSize:'10px', padding:'3px 8px', borderRadius:'20px', fontWeight:600, background:ec.bg, color:ec.text }}>
                            {ec.icon} {infra.estado}
                          </span>
                        </div>
                        <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:700, color:'var(--text-primary)' }}>
                          {infra.nombre}
                        </p>
                        <p style={{ margin:'0 0 10px', fontSize:'11px', color:'var(--text-tertiary)' }}>
                          {infra.tipo}
                          {infra.capacidad ? ' · ' + infra.capacidad + ' personas' : ''}
                          {infra.area_m2   ? ' · ' + infra.area_m2 + 'm²' : ''}
                        </p>
                        {infra.observaciones && (
                          <p style={{ margin:'0 0 10px', fontSize:'11px', color:'var(--text-secondary)', fontStyle:'italic' }}>
                            "{infra.observaciones}"
                          </p>
                        )}
                        {rol !== 'Docente' && (
                          <button
                            onClick={() => abrirEdicion(infra)}
                            style={{ width:'100%', padding:'7px', borderRadius:'8px', border:'1px solid var(--border)', cursor:'pointer', background:'var(--bg-base)', color:'var(--text-secondary)', fontSize:'12px', fontWeight:600, fontFamily:'Inter,sans-serif' }}
                          >
                            ✏️ Editar estado
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}