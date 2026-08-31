/* eslint-disable */
// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div className="hidden lg:flex lg:w-3/5 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #000080 0%, #0a0a6e 50%, #10104d 100%)' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'#FF00CC', opacity:0.10 }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'256px', height:'256px', borderRadius:'50%', background:'#FF00CC', opacity:0.10 }} />
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-8 p-6 rounded-3xl"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <img src={logo} alt="Respawn" className="w-52 h-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            Sistema Nacional de<br />
            <span style={{ color:'#FF00CC' }}>Inventario Escolar</span>
          </h1>
          <p className="text-base mb-8" style={{ color:'rgba(255,255,255,0.65)', maxWidth:'360px', lineHeight:'1.7' }}>
            Plataforma oficial del Ministerio de Educación de Nicaragua para la gestión centralizada de recursos educativos.
          </p>
          <div className="flex gap-8">
            {[
              { numero:'~11,000', label:'Escuelas' },
              { numero:'1.6M',    label:'Estudiantes' },
              { numero:'17',      label:'Departamentos' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color:'#FF00CC' }}>{s.numero}</div>
                <div className="text-xs mt-1" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
          © 2025 Respawn — MINED Nicaragua
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center px-8 py-12"
        style={{ background:'#f8f8ff' }}>
        <div className="lg:hidden mb-8 text-center">
          <img src={logo} alt="Respawn" className="w-36 h-auto mx-auto mb-3" />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="w-12 h-1 rounded-full mb-4" style={{ background:'#FF00CC' }} />
            <h2 className="text-3xl font-bold mb-1" style={{ color:'#000080' }}>Bienvenido</h2>
            <p className="text-sm" style={{ color:'#6b6b8a' }}>Ingresa tus credenciales para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color:'#000080' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📧</span>
                <input type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@mined.gob.ni"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background:'#ffffff', border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color:'#000080' }}>
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none"
                  style={{ background:'#ffffff', border:'1.5px solid #e0e0f0', color:'#1a1a3a' }}
                  onFocus={(e) => e.target.style.border='1.5px solid #000080'}
                  onBlur={(e)  => e.target.style.border='1.5px solid #e0e0f0'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color:'#6b6b8a' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium cursor-pointer"
                style={{ color:'#FF00CC' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {error && (
              <div className="text-sm px-4 py-3 rounded-xl"
                style={{ background:'#fff0f8', border:'1px solid #ffb3e6', color:'#cc0066' }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm cursor-pointer"
              style={{
                background: loading ? '#6666aa' : 'linear-gradient(135deg, #000080 0%, #0000cc 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,128,0.35)',
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background='linear-gradient(135deg, #FF00CC 0%, #cc00aa 100%)' }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background='linear-gradient(135deg, #000080 0%, #0000cc 100%)' }}
            >
              {loading ? '⏳ Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <div className="mt-8 pt-6" style={{ borderTop:'1px solid #e0e0f0' }}>
            <p className="text-xs text-center mb-3" style={{ color:'#9999bb' }}>
              Acceso por roles del sistema
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['Admin MINED','Supervisor','Director','Docente'].map((rol) => (
                <span key={rol} className="text-xs px-3 py-1 rounded-full"
                  style={{ background:'#eeeeff', color:'#000080', border:'1px solid #ccccee' }}>
                  {rol}
                </span>
              ))}
            </div>
          </div>
          <p className="text-center text-xs mt-8" style={{ color:'#bbbbcc' }}>
            Sistema protegido — Solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}