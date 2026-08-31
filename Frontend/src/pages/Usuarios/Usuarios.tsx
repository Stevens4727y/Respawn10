import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

export default function Usuarios() {
  const [departamentos, setDepartamentos] = useState([])
  const [instituciones, setInstituciones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [departamentoId, setDepartamentoId] = useState('todos')
  const [vista, setVista] = useState('instituciones')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [departamentosResponse, institucionesResponse] = await Promise.all([
          api.get('/auth/departamentos/'),
          api.get('/auth/instituciones/'),
        ])
        setDepartamentos(departamentosResponse.data)
        setInstituciones(institucionesResponse.data)
      } catch {
        setError('No se pudieron cargar departamentos e instituciones')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const institucionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return instituciones.filter((institucion) => {
      const coincideDepartamento = departamentoId === 'todos' || String(institucion.departamento_id) === departamentoId
      const coincideTexto = !texto || [institucion.nombre, institucion.codigo, institucion.tipo, institucion.departamento]
        .some((valor) => String(valor || '').toLowerCase().includes(texto))
      return coincideDepartamento && coincideTexto
    })
  }, [busqueda, departamentoId, instituciones])

  return (
    <main style={{ padding: '28px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <p style={{ color: '#ff00cc', fontSize: '12px', fontWeight: 700, margin: 0 }}>CATALOGO TERRITORIAL</p>
          <h1 style={{ margin: '6px 0', color: '#10213b' }}>Departamentos e instituciones</h1>
          <p style={{ color: '#65738a', margin: 0 }}>Consulta los datos cargados desde el backend.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVista('instituciones')} style={boton(vista === 'instituciones')}>Instituciones</button>
          <button onClick={() => setVista('departamentos')} style={boton(vista === 'departamentos')}>Departamentos</button>
        </div>
      </div>

      {loading && <p style={{ marginTop: '32px' }}>Cargando datos...</p>}
      {error && <p style={{ color: '#b42318', marginTop: '24px' }}>{error}</p>}

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
}

const tarjeta = {
  border: '1px solid #e2e7ef',
  borderRadius: '8px',
  padding: '18px',
  background: '#fff',
  boxShadow: '0 6px 18px rgba(16, 33, 59, 0.06)',
}

const boton = (activo) => ({
  border: activo ? '1px solid #ff00cc' : '1px solid #d6dce5',
  borderRadius: '8px',
  padding: '10px 14px',
  background: activo ? '#fff0fb' : '#fff',
  color: '#10213b',
  cursor: 'pointer',
})
