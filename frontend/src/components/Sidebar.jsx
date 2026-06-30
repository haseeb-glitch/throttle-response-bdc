import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, BarChart2,
  Settings, MessageSquare, PauseCircle
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/',             icon: LayoutDashboard, label: 'Dashboard'     },
      { to: '/leads',        icon: Users,           label: 'All Leads'     },
      { to: '/appointments', icon: Calendar,        label: 'Appointments'  },
      { to: '/analytics',    icon: BarChart2,       label: 'Analytics'     },
    ]
  },
  {
    label: 'AI Settings',
    items: [
      { to: '/settings',     icon: Settings,        label: 'Configuration' },
      { to: '/sms',          icon: MessageSquare,   label: 'SMS / Twilio'  },
    ]
  }
]

export default function Sidebar({ priorityCount = 0, manualTakeoverCount = 0 }) {
  const { pathname } = useLocation()

  return (
    <aside style={{
      width: 240,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-sidebar)',
      padding: '28px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flexShrink: 0,
      position: 'sticky',
      top: 61,
      height: 'calc(100vh - 61px)',
      overflowY: 'auto',
    }}>
      {NAV_SECTIONS.map(section => (
        <div key={section.label} style={{ marginBottom: 8 }}>
          <p style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginLeft: 12, marginBottom: 4, marginTop: 12
          }}>
            {section.label}
          </p>
          {section.items.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-tag)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.12s, color 0.12s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                {label}
                {/* Priority badge on Dashboard */}
                {to === '/' && priorityCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#FEE2E2',
                    color: '#EF4444',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 99,
                    lineHeight: '18px',
                  }}>
                    {priorityCount}
                  </span>
                )}
                {/* Takeover badge on Dashboard */}
                {to === '/' && manualTakeoverCount > 0 && priorityCount === 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#FEF3C7',
                    color: '#D97706',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 99,
                    lineHeight: '18px',
                  }}>
                    {manualTakeoverCount} paused
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10B981',
            boxShadow: '0 0 0 2px rgba(16,185,129,0.25)'
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Jake is active</span>
        </div>
      </div>
    </aside>
  )
}