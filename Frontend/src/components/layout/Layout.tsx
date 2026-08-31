/* eslint-disable */
// @ts-nocheck
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        marginLeft:   collapsed ? '68px' : '220px',
        flex:         1,
        transition:   'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight:    '100vh',
        display:      'flex',
        flexDirection:'column',
      }}>
        <Topbar collapsed={collapsed} />
        <main style={{
          marginTop: '58px',
          flex:      1,
          padding:   '24px',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}