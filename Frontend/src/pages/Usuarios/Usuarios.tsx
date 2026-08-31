import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

export default function Usuarios() {
  const [departamentos, setDepartamentos] = useState([])
  const [instituciones, setInstituciones] = useState([])
  const [roles, setRoles] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [departamentoId, setDepartamentoId] = useState('todos')
  const [vista, setVista] = useState('usuarios')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [form, setForm] = useState({ rol: '', departamento_asignado: '', institucion: '' })

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [departamentosResponse, institucionesResponse, rolesResponse, usuariosResponse] = await Promise.all([
          api.get('/auth/departamentos/'),
          api.get('/auth/instituciones/'),
          api.get('/auth/roles/'),
          api.get('/auth/usuarios/'),
        ])
        setDepartamentos(departamentosResponse.data)
        setInstituciones(institucionesResponse.data)
        setRoles(rolesResponse.data)
        setUsuarios(usuariosResponse.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'No se pudieron cargar los datos de usuarios')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const institucionPorDepartamento = useMemo(() => {
    const mapa = {}
    instituciones.forEach((inst) => {
      mapa[inst.departamento_id] = mapa[inst.departamento_id] || []
      mapa[inst.departamento_id].push(inst)
    })
    return mapa
  }, [instituciones])

  const institucionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return instituciones.filter((institucion) => {
      const coincideDepartamento = departamentoId === 'todos' || String(institucion.departamento_id) === departamentoId
      const coincideTexto = !texto || [institucion.nombre, institucion.codigo, institucion.tipo, institucion.departamento]
        .some((valor) => String(valor || '').toLowerCase().includes(texto))
      return coincideDepartamento && coincideTexto
    })
  }, [busqueda, departamentoId, instituciones])

  const abrirEdicion = (usuario) => {
    setUsuarioEditando(usuario.id)
    setForm({
      rol: usuario.rol || '',
      departamento_asignado: usuario.departamento_asignado || '',
      institucion: usuario.institucion || '',
    })
  }

  const guardarAsignacion = async (usuarioId) => {
    try {
      const payload = {
        rol: form.rol,
        departamento_asignado: form.departamento_asignado || null,
        institucion: form.institucion || null,
      }

      await api.patch(`/auth/usuarios/${usuarioId}/`, payload)
      const response = await api.get('/auth/usuarios/')
      setUsuarios(response.data)
      setUsuarioEditando(null)
      setMensaje('Asignación actualizada correctamente.')
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.departamento_asignado?.[0] || err.response?.data?.institucion?.[0] || 'No se pudo guardar la asignación.')
    }
  }

  return (
    <main style={{ padding: '28px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <p style={{ color: '#ff00cc', fontSize: '12px', fontWeight: 700, margin: 0 }}>ADMINISTRACION</p>
          <h1 style={{ margin: '6px 0', color: '#10213b' }}>Usuarios y asignaciones</h1>
          <p style={{ color: '#65738a', margin: 0 }}>Asigna supervisores a departamentos y directores/docentes a instituciones.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVista('usuarios')} style={boton(vista === 'usuarios')}>Usuarios</button>
          <button onClick={() => setVista('instituciones')} style={boton(vista === 'instituciones')}>Instituciones</button>
          <button onClick={() => setVista('departamentos')} style={boton(vista === 'departamentos')}>Departamentos</button>
        </div>
      </div>

      {mensaje && <p style={{ color: '#16803c', marginTop: '20px' }}>{mensaje}</p>}
      {loading && <p style={{ marginTop: '32px' }}>Cargando datos...</p>}
      {error && <p style={{ color: '#b42318', marginTop: '24px' }}>{error}</p>}

      {!loading && !error && vista === 'usuarios' && (
        <div style={{ marginTop: '28px', display: 'grid', gap: '16px' }}>
          {usuarios.map((usuario) => {
            const esSupervisor = usuario.rol_nombre === 'Supervisor'
            const esDirectorDocente = ['Director', 'Docente'].includes(usuario.rol_nombre)
            const editando = usuarioEditando === usuario.id

            return (
              <article key={usuario.id} style={tarjeta}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#10213b' }}>{usuario.nombre} {usuario.apellido}</h2>
                    <p style={{ margin: '6px 0 0', color: '#65738a' }}>{usuario.email}</p>
                  </div>
                  <span style={{ ...chip, background: '#fff0fb', color: '#ff00cc' }}>{usuario.rol_nombre || 'Sin rol'}</span>
                </div>

                {!editando ? (
                  <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                    <p style={{ margin: 0, color: '#65738a' }}><strong>Departamento:</strong> {usuario.departamento_nombre || 'Sin asignar'}</p>
                    <p style={{ margin: 0, color: '#65738a' }}><strong>Institución:</strong> {usuario.institucion_nombre || 'Sin asignar'}</p>
                    <button onClick={() => abrirEdicion(usuario)} style={botonPrimario}>Asignar alcance</button>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
                    <select
                      value={form.rol}
                      onChange={(event) => setForm({ ...form, rol: event.target.value })}
                      style={campo}
                    >
                      <option value="">Selecciona rol</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>

                    {roles.find((rol) => String(rol.id) === String(form.rol))?.nombre === 'Supervisor' && (
                      <select
                        value={form.departamento_asignado}
                        onChange={(event) => setForm({ ...form, departamento_asignado: event.target.value, institucion: '' })}
                        style={campo}
                      >
                        <option value="">Selecciona departamento</option>
                        {departamentos.map((dep) => (
                          <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                        ))}
                      </select>
                    )}

                    {(roles.find((rol) => String(rol.id) === String(form.rol))?.nombre === 'Director' ||
                      roles.find((rol) => String(rol.id) === String(form.rol))?.nombre === 'Docente') && (
                      <>
                        <select
                          value={form.departamento_asignado || ''}
                          onChange={(event) => setForm({ ...form, departamento_asignado: event.target.value, institucion: '' })}
                          style={campo}
                        >
                          <option value="">Selecciona departamento</option>
                          {departamentos.map((dep) => (
                            <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                          ))}
                        </select>
                        <select
                          value={form.institucion}
                          onChange={(event) => setForm({ ...form, institucion: event.target.value })}
                          style={campo}
                        >
                          <option value="">Selecciona institución</option>
                          {(institucionPorDepartamento[form.departamento_asignado] || []).map((inst) => (
                            <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                          ))}
                        </select>
                      </>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => guardarAsignacion(usuario.id)} style={botonPrimario}>Guardar</button>
                      <button onClick={() => setUsuarioEditando(null)} style={botonSecundario}>Cancelar</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {!loading && !error && vista === 'instituciones' && (
        <>
          <div style={{ display: 'flex', gap: '12px', margin: '28px 0 18px', flexWrap: 'wrap' }}>
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, codigo o tipo"
              style={campo}
            />
            <select value={departamentoId} onChange={(event) => setDepartamentoId(event.target.value)} style={campo}>
              <option value="todos">Todos los departamentos</option>
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>{departamento.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {institucionesFiltradas.map((institucion) => (
              <article key={institucion.id} style={tarjeta}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#ff00cc', fontSize: '12px', fontWeight: 700 }}>{institucion.tipo}</span>
                  <span style={{ color: institucion.activa ? '#16803c' : '#9b2c2c', fontSize: '12px' }}>{institucion.activa ? 'Activa' : 'Inactiva'}</span>
                </div>
                <h2 style={{ fontSize: '18px', margin: '12px 0 6px', color: '#10213b' }}>{institucion.nombre}</h2>
                <p style={{ color: '#65738a', margin: '4px 0' }}>Codigo: {institucion.codigo || 'Sin codigo'}</p>
                <p style={{ color: '#65738a', margin: '4px 0' }}>{institucion.departamento}{institucion.municipio ? ` / ${institucion.municipio}` : ''}</p>
                {institucion.direccion && <p style={{ color: '#65738a', margin: '12px 0 0' }}>{institucion.direccion}</p>}
              </article>
            ))}
          </div>
          {!institucionesFiltradas.length && <p>No hay instituciones para ese filtro.</p>}
        </>
      )}

      {!loading && !error && vista === 'departamentos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '28px' }}>
          {departamentos.map((departamento) => (
            <button key={departamento.id} onClick={() => { setDepartamentoId(String(departamento.id)); setVista('instituciones') }} style={{ ...tarjeta, textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ color: '#ff00cc', fontWeight: 700 }}>{departamento.codigo}</span>
              <h2 style={{ fontSize: '19px', margin: '10px 0 4px', color: '#10213b' }}>{departamento.nombre}</h2>
              <p style={{ color: '#65738a', margin: 0 }}>{departamento.instituciones_count} instituciones registradas</p>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}

const campo = {
  border: '1px solid #d6dce5',
  borderRadius: '8px',
  padding: '11px 13px',
  minWidth: '250px',
  background: '#fff',
  color: '#10213b',
  width: '100%',
}

const tarjeta = {
  border: '1px solid #e2e7ef',
  borderRadius: '8px',
  padding: '18px',
  background: '#fff',
  boxShadow: '0 6px 18px rgba(16, 33, 59, 0.06)',
}

const chip = {
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 700,
}

const boton = (activo) => ({
  border: activo ? '1px solid #ff00cc' : '1px solid #d6dce5',
  borderRadius: '8px',
  padding: '10px 14px',
  background: activo ? '#fff0fb' : '#fff',
  color: '#10213b',
  cursor: 'pointer',
})

const botonPrimario = {
  border: 'none',
  borderRadius: '8px',
  padding: '10px 14px',
  background: '#ff00cc',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
}

const botonSecundario = {
  border: '1px solid #d6dce5',
  borderRadius: '8px',
  padding: '10px 14px',
  background: '#fff',
  color: '#10213b',
  cursor: 'pointer',
}
