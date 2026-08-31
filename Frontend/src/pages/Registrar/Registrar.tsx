/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Registrar() {
  const navigate = useNavigate()
  const [items,   setItems]   = useState([])
  const [infras,  setInfras]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(null)

  const [form, setForm] = useState({
    escuela: '', item: '',
    cantidad_total: '', cantidad_bueno: '',
    cantidad_regular: '', cantidad_malo: '',
    ubicacion: '', observaciones: '', imagen: null,
  })

  useEffect(() => {
    const cargar = async () => {
      try {
        const [itemRes, infraRes] = await Promise.all([
          api.get('/inventario/items/'),
          api.get('/infraestructura/'),
        ])
        setItems(itemRes.data)
        setInfras(infraRes.data)
      } catch (e) {
        console.log(e)
      }
    }
    cargar()
  }, [])

  const handleImagen = (e) => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    setForm({ ...form, imagen: file })
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') {
          fd.append(k, v)
        }
      })
      await api.post('/inventario/inventarios/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Recurso registrado correctamente')
      setTimeout(() => navigate('/inventario'), 1500)
    } catch (e) {
      setError('Error al registrar. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  const tiposInfra = [...new Set(infras.map((i) => i.tipo))]

  const iStyle = {
    width: '100%', height: '40px', padding: '0 14px',
    borderRadius: '10px', border: '1.5px solid var(--border)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    fontSize: '13px', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  const lbl = (text, req = false) => (
    <label style={{
      display: 'block', fontSize: '11px', fontWeight: 700,
      color: 'var(--text-secondary)', marginBottom: '6px',
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {text} {req && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
  )

  const card = (children, title) => (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '20px',
    }}>
      <h2 style={{
        fontSize: '13px', fontWeight: 700, margin: '0 0 16px',
        color: 'var(--text-primary)', paddingBottom: '10px',
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '880px' }}>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <button onClick={() => navigate('/inventario')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: '13px', padding: 0,
          }}>
            ← Inventario
          </button>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Registrar recurso
          </span>
        </div>
        <h1 style={{
          fontSize: '22px', fontWeight: 800, margin: 0,
          color: 'var(--text-primary)', letterSpacing: '-0.02em',
        }}>
          Registrar nuevo recurso
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Completa la información del bien a registrar en el inventario
        </p>
      </div>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
          background: 'var(--error-bg)', border: '1px solid var(--error-border)',
          color: 'var(--error-text)', fontSize: '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
          background: 'var(--success-bg)', border: '1px solid var(--success-border)',
          color: 'var(--success-text)', fontSize: '13px',
        }}>
          ✅ {success} — Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {card(
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  {lbl('Producto / Recurso', true)}
                  <select value={form.item} required
                    onChange={(e) => setForm({ ...form, item: e.target.value })}
                    style={{ ...iStyle, cursor: 'pointer' }}
                    onFocus={(e) => (e.target.style.borderColor = '#000080')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  >
                    <option value="">— Selecciona un producto —</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} ({i.unidad_medida})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {lbl('Código')}
                  <div style={{
                    ...iStyle, display: 'flex', alignItems: 'center',
                    background: 'var(--bg-base)', color: 'var(--text-tertiary)',
                    fontFamily: 'monospace', fontWeight: 700,
                  }}>
                    INV-XXX (auto-generado)
                  </div>
                </div>

                <div>
                  {lbl('ID de Escuela', true)}
                  <input type="number" value={form.escuela} required
                    onChange={(e) => setForm({ ...form, escuela: e.target.value })}
                    placeholder="Ej: 1"
                    style={iStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#000080')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                <div>
                  {lbl('Ubicación (Aula / Lab)')}
                  <select value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    style={{ ...iStyle, cursor: 'pointer' }}
                    onFocus={(e) => (e.target.style.borderColor = '#000080')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  >
                    <option value="">— Selecciona ubicación —</option>
                    <option value="Sin ubicación">Sin ubicación especificada</option>
                    {tiposInfra.map((tipo) => (
                      <optgroup key={tipo} label={'── ' + tipo + 's ──'}>
                        {infras.filter((i) => i.tipo === tipo).map((infra) => (
                          <option key={infra.id} value={infra.nombre}>
                            {infra.nombre}
                            {infra.capacidad ? ' (Cap. ' + infra.capacidad + ')' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="── Otras ──">
                      <option value="Bodega">Bodega</option>
                      <option value="Dirección">Dirección</option>
                      <option value="Patio">Patio</option>
                    </optgroup>
                  </select>
                </div>
              </div>,
              '📋 Identificación del recurso'
            )}

            {card(
              <div>
                {preview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={preview} alt="Preview" style={{
                      width: '100%', height: '160px',
                      objectFit: 'cover', borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }} />
                    <button type="button"
                      onClick={() => { setPreview(null); setForm({ ...form, imagen: null }) }}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        border: 'none', borderRadius: '50%',
                        width: '28px', height: '28px', cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: '140px', borderRadius: '10px', cursor: 'pointer',
                    border: '2px dashed var(--border)',
                    background: 'var(--bg-base)',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#000080')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <span style={{ fontSize: '32px', marginBottom: '8px' }}>📸</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Clic para subir imagen
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      PNG, JPG, WEBP — máx 5MB
                    </span>
                    <input type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
                  </label>
                )}
              </div>,
              '🖼️ Imagen del recurso'
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {card(
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  {lbl('Cantidad total', true)}
                  <input type="number" min="0" value={form.cantidad_total} required
                    onChange={(e) => setForm({ ...form, cantidad_total: e.target.value })}
                    placeholder="0" style={iStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#000080')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                {[
                  { key: 'cantidad_bueno',   label: 'En buen estado',   color: '#22C55E', border: '#BBF7D0' },
                  { key: 'cantidad_regular', label: 'En estado regular', color: '#F59E0B', border: '#FDE68A' },
                  { key: 'cantidad_malo',    label: 'En mal estado',     color: '#EF4444', border: '#FCA5A5' },
                ].map((campo) => (
                  <div key={campo.key}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 700,
                      color: campo.color, marginBottom: '6px',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {campo.label}
                    </label>
                    <input type="number" min="0" value={form[campo.key]}
                      onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
                      placeholder="0"
                      style={{ ...iStyle, borderColor: campo.border }}
                      onFocus={(e) => (e.target.style.borderColor = campo.color)}
                      onBlur={(e) => (e.target.style.borderColor = campo.border)}
                    />
                  </div>
                ))}

                {form.cantidad_total && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'var(--bg-base)', border: '1px solid var(--border)',
                    fontSize: '12px',
                  }}>
                    {(() => {
                      const t = parseInt(form.cantidad_total) || 0
                      const b = parseInt(form.cantidad_bueno) || 0
                      const r = parseInt(form.cantidad_regular) || 0
                      const m = parseInt(form.cantidad_malo) || 0
                      const sum = b + r + m
                      const ok = sum === t
                      return (
                        <div style={{ color: ok ? '#22C55E' : '#F59E0B' }}>
                          {ok ? '✅' : '⚠️'} {b} + {r} + {m} = {sum}
                          {!ok && ' (faltan ' + (t - sum) + ' por clasificar)'}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>,
              '🔢 Cantidades por estado'
            )}

            {card(
              <textarea value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Estado actual, características adicionales..."
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: '10px', border: '1.5px solid var(--border)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                  fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#000080')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />,
              '📝 Descripción y notas'
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={() => navigate('/inventario')}
            style={{
              padding: '10px 24px', borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-base)', color: 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            style={{
              padding: '10px 32px', borderRadius: '10px', border: 'none',
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #000080, #0000cc)',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(0,0,128,0.35)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? '⏳ Guardando...' : '💾 Guardar recurso'}
          </button>
        </div>
      </form>
    </div>
  )
}