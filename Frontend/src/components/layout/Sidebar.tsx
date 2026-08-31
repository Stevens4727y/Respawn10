/* eslint-disable */
// @ts-nocheck
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'

const normalizarRol = (rol) => {
  if (!rol) return 'Docente'
  if (rol === 'Admin') return 'Admin MINED'
  if (rol === 'Usuario') return 'Docente'
  return rol
}

// Menú por rol
const MENU_POR_ROL = {
  'Admin MINED': [
    { icon:'🏠', label:'Inicio',            ruta:'/dashboard'       },
    { icon:'📦', label:'Inventario',        ruta:'/inventario'      },
    { icon:'➕', label:'Registrar recurso', ruta:'/registrar'       },
    { icon:'📋', label:'Reportes',          ruta:'/reportes'        },
    { icon:'📨', label:'Solicitudes',       ruta:'/solicitudes'     },
    { icon:'🚚', label:'Distribución',      ruta:'/distribucion'    },
    { icon:'🏗️', label:'Infraestructura',   ruta:'/infraestructura' },
    { icon:'📊', label:'Estadísticas',      ruta:'/estadisticas'    },
    { icon:'👥', label:'Usuarios',          ruta:'/usuarios'        },
    { icon:'🔍', label:'Auditoría',         ruta:'/auditoria'       },
    { icon:'⚙️', label:'Ajustes',           ruta:'/ajustes'         },
  ],
  'Supervisor': [
    { icon:'🏠', label:'Inicio',          ruta:'/dashboard'       },
    { icon:'📦', label:'Inventario',      ruta:'/inventario'      },
    { icon:'📋', label:'Reportes',        ruta:'/reportes'        },
    { icon:'📨', label:'Solicitudes',     ruta:'/solicitudes'     },
    { icon:'🚚', label:'Distribución',    ruta:'/distribucion'    },
    { icon:'🏗️', label:'Infraestructura', ruta:'/infraestructura' },
    { icon:'📊', label:'Estadísticas',    ruta:'/estadisticas'    },
  ],
  'Director': [
    { icon:'🏠', label:'Inicio',         ruta:'/dashboard'   },
    { icon:'📦', label:'Inventario',     ruta:'/inventario'  },
    { icon:'➕', label:'Registrar',      ruta:'/registrar'   },
    { icon:'📋', label:'Reportes',       ruta:'/reportes'    },
    { icon:'📨', label:'Solicitudes',    ruta:'/solicitudes' },
    { icon:'🏗️', label:'Infraestructura',ruta:'/infraestructura' },
    { icon:'📊', label:'Estadísticas',   ruta:'/estadisticas'},
  ],
  'Docente': [
    { icon:'🏠', label:'Inicio',      ruta:'/dashboard'   },
    { icon:'📦', label:'Inventario',  ruta:'/inventario'  },
    { icon:'📋', label:'Reportes',    ruta:'/reportes'    },
    { icon:'📨', label:'Solicitudes', ruta:'/solicitudes' },
  ],
  'Estudiante': [
    { icon:'🏠', label:'Inicio',      ruta:'/dashboard'   },
    { icon:'📨', label:'Solicitudes', ruta:'/solicitudes' },
  ],
  'Auditor': [
    { icon:'🏠', label:'Inicio',          ruta:'/dashboard'       },
    { icon:'📦', label:'Inventario',      ruta:'/inventario'      },
    { icon:'📋', label:'Reportes',        ruta:'/reportes'        },
    { icon:'📨', label:'Solicitudes',     ruta:'/solicitudes'     },
    { icon:'🏗️', label:'Infraestructura', ruta:'/infraestructura' },
    { icon:'📊', label:'Estadísticas',    ruta:'/estadisticas'    },
    { icon:'🔍', label:'Auditoría',       ruta:'/auditoria'       },
  ],
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { usuario, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()
  const rol       = normalizarRol(usuario?.rol)
  const menu      = MENU_POR_ROL[rol] || MENU_POR_ROL['Docente']

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      width:         collapsed ? '68px' : '220px',
      minHeight:     '100vh',
      background:    '#000080',
      display:       'flex',
      flexDirection: 'column',
      position:      'fixed',
      left:0, top:0, bottom:0,
      zIndex:        100,
      overflowX:     'hidden',
      transition:    'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      boxShadow:     '2px 0 16px rgba(0,0,0,0.2)',
    }}>

      {/* Logo */}
      <div style={{
        padding:        '16px 12px',
        borderBottom:   '1px solid rgba(255,255,255,0.08)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight:      '64px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', overflow:'hidden' }}>
          <img src={logo} alt="SNIE"
            style={{ height:'36px', width:'auto', flexShrink:0, cursor:'pointer' }}
            onClick={() => navigate('/dashboard')}
          />
          {!collapsed && (
            <div>
              <p style={{ color:'#fff', fontWeight:800, fontSize:'16px', margin:0, letterSpacing:'-0.02em' }}>
                SNIE
              </p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'9px', margin:0, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                MINED Nicaragua
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            background:'rgba(255,255,255,0.08)', border:'none',
            borderRadius:'8px', color:'rgba(255,255,255,0.6)',
            cursor:'pointer', padding:'4px 8px', fontSize:'12px',
          }}>◀</button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            position:'absolute', right:'-12px', top:'22px',
            background:'#000080', border:'2px solid #f5f6fa',
            borderRadius:'50%', color:'#fff', cursor:'pointer',
            width:'24px', height:'24px', fontSize:'9px', zIndex:101,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>▶</button>
        )}
      </div>

      {/* Info usuario */}
      {!collapsed && (
        <div style={{
          padding:'12px',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
          background:'rgba(0,0,0,0.15)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              width:'34px', height:'34px', borderRadius:'10px',
              background:'linear-gradient(135deg, #FF00CC, #6600AA)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'13px', fontWeight:700, color:'#fff', flexShrink:0,
            }}>
              {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{
                color:'#fff', fontSize:'12px', fontWeight:600,
                margin:0, whiteSpace:'nowrap', overflow:'hidden',
                textOverflow:'ellipsis',
              }}>
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p style={{ color:'#FF00CC', fontSize:'10px', margin:0, fontWeight:500 }}>
                {rol}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación dinámica por rol */}
      <nav style={{ flex:1, padding:'8px', overflowY:'auto' }}>
        {!collapsed && (
          <p style={{
            color:'rgba(255,255,255,0.28)', fontSize:'9px', fontWeight:700,
            letterSpacing:'0.1em', textTransform:'uppercase',
            padding:'8px 8px 6px', margin:0,
          }}>
            NAVEGACIÓN
          </p>
        )}
        {menu.map((item) => {
          const active = location.pathname === item.ruta
          return (
            <button
              key={item.ruta}
              onClick={() => navigate(item.ruta)}
              title={collapsed ? item.label : ''}
              style={{
                width:'100%', display:'flex', alignItems:'center',
                gap: collapsed ? 0 : '10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding:'9px 10px', borderRadius:'9px',
                border:'none', cursor:'pointer', marginBottom:'2px',
                background: active ? 'rgba(255,0,204,0.18)' : 'transparent',
                borderLeft: active ? '3px solid #FF00CC' : '3px solid transparent',
                transition:'all 0.18s ease',
                textAlign:'left', overflow:'hidden',
              }}
              onMouseEnter={(e) => { if(!active) e.currentTarget.style.background='rgba(255,255,255,0.07)' }}
              onMouseLeave={(e) => { if(!active) e.currentTarget.style.background='transparent' }}
            >
              <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.68)',
                  fontSize:'13px', fontWeight: active ? 600 : 400,
                  whiteSpace:'nowrap', transition:'opacity 0.2s',
                  letterSpacing:'0.01em',
                }}>
                  {item.label}
                </span>
              )}
              {active && !collapsed && (
                <div style={{
                  marginLeft:'auto', width:'6px', height:'6px',
                  borderRadius:'50%', background:'#FF00CC', flexShrink:0,
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Toggle tema + Logout */}
      <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div style={{
            display:'flex', gap:'3px',
            background:'rgba(0,0,0,0.2)',
            borderRadius:'9px', padding:'3px',
            marginBottom:'6px',
          }}>
            {[
              { v:'light', i:'☀️' },
              { v:'dark',  i:'🌙' },
              { v:'system',i:'💻' },
            ].map((t) => (
              <button key={t.v} onClick={() => setTheme(t.v)} title={t.v}
                style={{
                  flex:1, padding:'5px', borderRadius:'7px',
                  border:'none', cursor:'pointer', fontSize:'13px',
                  background: theme===t.v ? '#FF00CC' : 'transparent',
                  transition:'all 0.2s',
                }}>
                {t.i}
              </button>
            ))}
          </div>
        )}
        <button onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : ''}
          style={{
            width:'100%', display:'flex', alignItems:'center',
            gap: collapsed ? 0 : '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding:'9px 10px', borderRadius:'9px',
            border:'none', cursor:'pointer',
            background:'rgba(255,0,204,0.1)',
            transition:'all 0.18s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,0,204,0.28)'}
          onMouseLeave={(e) => e.currentTarget.style.background='rgba(255,0,204,0.1)'}
        >
          <span style={{ fontSize:'16px' }}>🚪</span>
          {!collapsed && (
            <span style={{ color:'#FF00CC', fontSize:'13px', fontWeight:600 }}>
              Cerrar sesión
            </span>
          )}
        </button>
      </div>
    </div>
  )
}