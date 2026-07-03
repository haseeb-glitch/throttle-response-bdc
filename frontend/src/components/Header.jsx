import { useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut, Plus } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Header({ onAddLead, showAddLead = false, priorityCount = 0 }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('trbdc_token')
    localStorage.removeItem('trbdc_auth')
    localStorage.removeItem('trbdc_user')
    localStorage.removeItem('trbdc_role')
    navigate('/login')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        padding: '12px 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: '#F97316',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 700
          }}>T</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            ThrottleResponseBDC
          </h1>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {priorityCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', background: '#FEF2F2',
              border: '1px solid #FCA5A5', color: '#EF4444',
              fontSize: 12, fontWeight: 500, borderRadius: 6
            }}>
              {priorityCount} Alert{priorityCount !== 1 ? 's' : ''}
            </span>
          )}

          <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px 10px' }} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {showAddLead && onAddLead && (
            <button onClick={onAddLead} className="btn-primary">
              <Plus size={16} /> Add Lead
            </button>
          )}

          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 10px' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}