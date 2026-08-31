/* eslint-disable */
// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()
  const [resumen,    setResumen]    = useState(null)
  const [reportes,   setReportes]   = useState([])
  const [solicitudes,setSolicitudes]= useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [r, rep, sol] = await Promise.all([
          api.get('/inventario/resumen/'),
          api.get('/reportes/'),
          api.get('/solicitudes/'),
        ])
        setResumen(r.data)
        setReportes(rep.data)
        setSolicitudes(sol.data)
      } catch {}
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  const fmt = (n) => loading ? '000' : String(n).padStart(3, '0')

  return (
    <div style={{ fontFamily:'Inter, sans-serif' }}>

      {/* Encabezado */}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{
          fontSize:'22px', fontWeight:800, margin:'0 0 4px',
          color:'var(--text-primary)', letterSpacing:'-0.02em',
        }}>
          Panel principal
        </h1>
        <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>
          Bienvenido, {usuario?.nombre} — {new Date().toLocaleDateString('es-NI', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* KPIs — igual que wireframe */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(4, 1fr)',
        gap:'16px',
        marginBottom:'24px',
      }}>
        {[
          { label:'Total bienes',  value:fmt(resumen?.total_items   || 0), icon:'📦', color:'#000080', bg:'#EEEEFF', ruta:'/inventario' },
          { label:'Computadoras',  value:'000',                             icon:'💻', color:'#1565C0', bg:'#E3F2FD', ruta:'/inventario' },
          { label:'Mobiliario',    value:'000',                             icon:'🪑', color:'#2E7D32', bg:'#E8F5E9', ruta:'/inventario' },
          { label:'Libros',        value:'000',                             icon:'📚', color:'#E65100', bg:'#FFF3E0', ruta:'/inventario' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            onClick={() => navigate(kpi.ruta)}
            style={{
              background:    'var(--bg-card)',
              border:        '1px solid var(--border)',
              borderRadius:  '14px',
              padding:       '20px',
              cursor:        'pointer',
              transition:    'all 0.2s ease',
              boxShadow:     '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform  = 'translateY(-2px)'
              e.currentTarget.style.boxShadow  = '0 8px 24px rgba(0,0,128,0.1)'
              e.currentTarget.style.borderColor= '#000080'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform  = 'translateY(0)'
              e.currentTarget.style.boxShadow  = '0 1px 3px rgba(0,0,0,0.04)'
              e.currentTarget.style.borderColor= 'var(--border)'
            }}
          >
            <div style={{
              width:'44px', height:'44px', borderRadius:'12px',
              background:kpi.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'22px', marginBottom:'12px',
            }}>
              {kpi.icon}
            </div>
            <p style={{
              fontSize:'32px', fontWeight:800, margin:'0 0 4px',
              color:'var(--text-primary)', letterSpacing:'-0.03em',
              fontVariantNumeric:'tabular-nums',
            }}>
              {kpi.value}
            </p>
            <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0, fontWeight:500 }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica + Actividad reciente — igual que wireframe */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Área de gráfico/estadísticas */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'14px', padding:'20px',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ fontSize:'14px', fontWeight:700, margin:0, color:'var(--text-primary)' }}>
              📊 Área de Gráfico / Estadísticas
            </h2>
            <span style={{
              fontSize:'11px', color:'var(--text-tertiary)',
              background:'var(--bg-base)', padding:'3px 10px',
              borderRadius:'20px', border:'1px solid var(--border)',
            }}>
              Este mes
            </span>
          </div>

          {/* Barras de estado */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { label:'Buen estado',    value:resumen?.total_bueno   || 0, total:resumen?.total_general || 1, color:'#22C55E', bg:'#F0FDF4' },
              { label:'Estado regular', value:resumen?.total_regular || 0, total:resumen?.total_general || 1, color:'#F59E0B', bg:'#FFFBEB' },
              { label:'Mal estado',     value:resumen?.total_malo    || 0, total:resumen?.total_general || 1, color:'#EF4444', bg:'#FEF2F2' },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                    <span style={{ fontSize:'12px', color:'var(--text-secondary)', fontWeight:500 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize:'12px', fontWeight:700, color:item.color }}>
                      {item.value} <span style={{ fontWeight:400, color:'var(--text-tertiary)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{
                    height:'10px', borderRadius:'5px',
                    background:'var(--bg-base)', overflow:'hidden',
                  }}>
                    <div style={{
                      height:'100%', borderRadius:'5px',
                      width:`${pct}%`, background:item.color,
                      transition:'width 1s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mini resumen */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:'10px', marginTop:'20px',
          }}>
            {[
              { label:'Reportes activos',      value:reportes.filter(r=>r.estado!=='Resuelto').length, color:'#EF4444' },
              { label:'Solicitudes pendientes',value:solicitudes.filter(s=>s.estado==='Pendiente').length, color:'#F59E0B' },
            ].map((s) => (
              <div key={s.label} style={{
                background:'var(--bg-base)', borderRadius:'10px',
                padding:'12px', textAlign:'center',
                border:'1px solid var(--border)',
              }}>
                <p style={{ fontSize:'24px', fontWeight:800, margin:'0 0 2px', color:s.color }}>
                  {s.value}
                </p>
                <p style={{ fontSize:'11px', color:'var(--text-secondary)', margin:0 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'14px', padding:'20px',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h2 style={{ fontSize:'14px', fontWeight:700, margin:0, color:'var(--text-primary)' }}>
              🕐 Actividad reciente
            </h2>
            <button
              onClick={() => navigate('/reportes')}
              style={{
                background:'none', border:'none', cursor:'pointer',
                fontSize:'12px', color:'#000080', fontWeight:600,
              }}
            >
              Ver todo →
            </button>
          </div>

          {reportes.length === 0 ? (
            <div style={{
              textAlign:'center', padding:'40px 0',
              color:'var(--text-tertiary)',
            }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>📭</div>
              <p style={{ fontSize:'13px', margin:0 }}>Sin actividad reciente</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {reportes.slice(0, 6).map((rep) => {
                const urgColor = {
                  Critico:'#EF4444', Alto:'#F97316',
                  Medio:'#F59E0B', Bajo:'#22C55E',
                }[rep.nivel_urgencia] || '#6B7280'
                return (
                  <div key={rep.id} style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'10px 12px', borderRadius:'10px',
                    background:'var(--bg-base)',
                    border:'1px solid var(--border)',
                    transition:'all 0.15s',
                    cursor:'pointer',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor='#000080'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border)'}
                    onClick={() => navigate('/reportes')}
                  >
                    <div style={{
                      width:'8px', height:'8px', borderRadius:'50%',
                      background:urgColor, flexShrink:0,
                    }} />
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <p style={{
                        margin:0, fontSize:'12px', fontWeight:600,
                        color:'var(--text-primary)',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      }}>
                        {rep.descripcion_daño}
                      </p>
                      <p style={{ margin:0, fontSize:'10px', color:'var(--text-tertiary)' }}>
                        {rep.escuela_nombre || 'Sin escuela'} · {new Date(rep.fecha_reporte).toLocaleDateString('es-NI')}
                      </p>
                    </div>
                    <span style={{
                      fontSize:'10px', padding:'2px 8px',
                      borderRadius:'20px', fontWeight:600, flexShrink:0,
                      background: rep.estado==='Resuelto'?'#E8F5E9':rep.estado==='En proceso'?'#E3F2FD':'#FFF8E1',
                      color:      rep.estado==='Resuelto'?'#15803D':rep.estado==='En proceso'?'#1565C0':'#B45309',
                    }}>
                      {rep.estado}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}