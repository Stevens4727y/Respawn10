/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Estadisticas() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()
  const rol         = usuario?.rol

  const [resumen,    setResumen]    = useState(null)
  const [reportes,   setReportes]   = useState([])
  const [solicitudes,setSolicitudes]= useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [resRes, repRes, solRes] = await Promise.all([
        api.get('/inventario/resumen/'),
        api.get('/reportes/'),
        api.get('/solicitudes/'),
      ])
      setResumen(resRes.data)
      setReportes(repRes.data)
      setSolicitudes(solRes.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const pctBueno   = resumen?.total_general > 0
    ? Math.round((resumen.total_bueno   / resumen.total_general) * 100) : 0
  const pctRegular = resumen?.total_general > 0
    ? Math.round((resumen.total_regular / resumen.total_general) * 100) : 0
  const pctMalo    = resumen?.total_general > 0
    ? Math.round((resumen.total_malo    / resumen.total_general) * 100) : 0

  return (
    <div style={{ fontFamily:'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{
          fontSize:'22px', fontWeight:800, margin:'0 0 4px',
          color:'var(--text-primary)', letterSpacing:'-0.02em',
        }}>
          Estadísticas
        </h1>
        <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>
          {rol === 'Admin MINED' && 'Panel nacional completo — MINED Nicaragua'}
          {rol === 'Supervisor'  && 'Estadísticas de tu departamento'}
          {rol === 'Director'    && 'Estadísticas de tu escuela'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>📊</div>
          <p style={{ color:'var(--text-tertiary)', fontSize:'13px' }}>
            Cargando estadísticas...
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(4,1fr)',
            gap:'16px', marginBottom:'24px',
          }}>
            {[
              { icon:'📦', label:'Total Items',         value:resumen?.total_items   || 0, color:'#000080', bg:'#EEEEFF' },
              { icon:'✅', label:'En Buen Estado',      value:resumen?.total_bueno   || 0, color:'#15803D', bg:'#F0FDF4' },
              { icon:'⚠️', label:'Reportes Activos',    value:reportes.filter(r=>r.estado!=='Resuelto').length, color:'#B91C1C', bg:'#FEF2F2' },
              { icon:'📨', label:'Solicitudes Pendientes', value:solicitudes.filter(s=>s.estado==='Pendiente').length, color:'#B45309', bg:'#FFFBEB' },
            ].map((kpi) => (
              <div key={kpi.label} style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:'14px', padding:'20px',
                boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width:'44px', height:'44px', borderRadius:'12px',
                  background:kpi.bg, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:'22px', marginBottom:'12px',
                }}>
                  {kpi.icon}
                </div>
                <p style={{
                  fontSize:'30px', fontWeight:800, margin:'0 0 4px',
                  color:'var(--text-primary)', letterSpacing:'-0.03em',
                }}>
                  {kpi.value}
                </p>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0, fontWeight:500 }}>
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          {/* Gráficas */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>

            {/* Estado inventario */}
            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'14px', padding:'20px',
            }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, margin:'0 0 20px', color:'var(--text-primary)' }}>
                📦 Estado del Inventario
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {[
                  { label:'Buen estado',    value:resumen?.total_bueno   || 0, pct:pctBueno,   color:'#22C55E' },
                  { label:'Estado regular', value:resumen?.total_regular || 0, pct:pctRegular, color:'#F59E0B' },
                  { label:'Mal estado',     value:resumen?.total_malo    || 0, pct:pctMalo,    color:'#EF4444' },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'12px', color:'var(--text-secondary)', fontWeight:500 }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:item.color }}>
                        {item.value} ({item.pct}%)
                      </span>
                    </div>
                    <div style={{
                      height:'10px', borderRadius:'5px',
                      background:'var(--bg-base)', overflow:'hidden',
                    }}>
                      <div style={{
                        height:'100%', borderRadius:'5px',
                        width:`${item.pct}%`, background:item.color,
                        transition:'width 1s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reportes por urgencia */}
            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'14px', padding:'20px',
            }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, margin:'0 0 16px', color:'var(--text-primary)' }}>
                ⚠️ Reportes por Urgencia
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { label:'Crítico', value:reportes.filter(r=>r.nivel_urgencia==='Critico').length, color:'#EF4444', bg:'#FEF2F2' },
                  { label:'Alto',    value:reportes.filter(r=>r.nivel_urgencia==='Alto').length,    color:'#F97316', bg:'#FFF7ED' },
                  { label:'Medio',   value:reportes.filter(r=>r.nivel_urgencia==='Medio').length,   color:'#F59E0B', bg:'#FFFBEB' },
                  { label:'Bajo',    value:reportes.filter(r=>r.nivel_urgencia==='Bajo').length,    color:'#22C55E', bg:'#F0FDF4' },
                ].map((item) => (
                  <div key={item.label} style={{
                    display:'flex', alignItems:'center',
                    justifyContent:'space-between',
                    padding:'10px 14px', borderRadius:'10px',
                    background:item.bg,
                  }}>
                    <span style={{ fontSize:'13px', fontWeight:500, color:item.color }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize:'20px', fontWeight:800, color:item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solicitudes y Reportes por estado */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'14px', padding:'20px',
            }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, margin:'0 0 16px', color:'var(--text-primary)' }}>
                📋 Reportes por Estado
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { label:'Pendientes',  value:reportes.filter(r=>r.estado==='Pendiente').length,  color:'#F59E0B', bg:'#FFFBEB' },
                  { label:'En Proceso',  value:reportes.filter(r=>r.estado==='En proceso').length, color:'#3B82F6', bg:'#EFF6FF' },
                  { label:'Resueltos',   value:reportes.filter(r=>r.estado==='Resuelto').length,   color:'#22C55E', bg:'#F0FDF4' },
                ].map((item) => (
                  <div key={item.label} style={{
                    display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'10px 14px',
                    borderRadius:'10px', background:item.bg,
                  }}>
                    <span style={{ fontSize:'13px', fontWeight:500, color:item.color }}>{item.label}</span>
                    <span style={{ fontSize:'20px', fontWeight:800, color:item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'14px', padding:'20px',
            }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, margin:'0 0 16px', color:'var(--text-primary)' }}>
                📨 Solicitudes por Estado
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { label:'Pendientes', value:solicitudes.filter(s=>s.estado==='Pendiente').length,  color:'#F59E0B', bg:'#FFFBEB' },
                  { label:'Aprobadas',  value:solicitudes.filter(s=>s.estado==='Aprobada').length,   color:'#22C55E', bg:'#F0FDF4' },
                  { label:'Rechazadas', value:solicitudes.filter(s=>s.estado==='Rechazada').length,  color:'#EF4444', bg:'#FEF2F2' },
                  { label:'Entregadas', value:solicitudes.filter(s=>s.estado==='Entregada').length,  color:'#3B82F6', bg:'#EFF6FF' },
                ].map((item) => (
                  <div key={item.label} style={{
                    display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'10px 14px',
                    borderRadius:'10px', background:item.bg,
                  }}>
                    <span style={{ fontSize:'13px', fontWeight:500, color:item.color }}>{item.label}</span>
                    <span style={{ fontSize:'20px', fontWeight:800, color:item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}