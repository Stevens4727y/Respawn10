/* eslint-disable */
// @ts-nocheck
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ collapsed }) {
  const { usuario } = useAuth()

  return (
    <div style={{
      position:       'fixed',
      top:0, right:0,
      left:           collapsed ? '68px' : '220px',
      height:         '58px',
      background:     'var(--bg-topbar)',
      borderBottom:   '1px solid var(--border)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 24px',
      zIndex:         99,
      transition:     'left 0.3s cubic-bezier(0.4,0,0.2,1)',
      boxShadow:      '0 1px 0 var(--border)',
    }}>

      {/* Buscador */}
      <div style={{ position:'relative', maxWidth:'380px', flex:1 }}>
        <span style={{
          position:'absolute', left:'12px', top:'50%',
          transform:'translateY(-50%)',
          fontSize:'14px', color:'var(--text-tertiary)',
        }}>🔍</span>
        <input
          type="text"
          placeholder="Buscar..."
          style={{
            width:'100%', height:'36px',
            paddingLeft:'36px', paddingRight:'14px',
            borderRadius:'9px',
            border:'1.5px solid var(--border)',
            background:'var(--bg-base)',
            color:'var(--text-primary)',
            fontSize:'13px',
            fontFamily:'Inter, sans-serif',
            outline:'none',
          }}
          onFocus={(e) => e.target.style.borderColor='#000080'}
          onBlur={(e)  => e.target.style.borderColor='var(--border)'}
        />
      </div>

      {/* Derecha */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <button style={{
          background:'var(--bg-base)', border:'1px solid var(--border)',
          borderRadius:'9px', padding:'7px 10px', cursor:'pointer',
          color:'var(--text-secondary)', fontSize:'15px',
          position:'relative',
        }}>
          🔔
          <span style={{
            position:'absolute', top:'-5px', right:'-5px',
            width:'16px', height:'16px', borderRadius:'50%',
            background:'#FF00CC', color:'#fff',
            fontSize:'9px', fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>3</span>
        </button>

        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'var(--bg-base)',
          border:'1px solid var(--border)',
          borderRadius:'9px', padding:'5px 12px',
        }}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'8px',
            background:'linear-gradient(135deg, #FF00CC, #000080)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'11px', color:'#fff', fontWeight:800,
          }}>
            {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
          </div>
          <div>
            <p style={{ margin:0, fontSize:'12px', fontWeight:600, color:'var(--text-primary)' }}>
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <p style={{ margin:0, fontSize:'10px', color:'var(--text-secondary)' }}>
              {usuario?.rol}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}