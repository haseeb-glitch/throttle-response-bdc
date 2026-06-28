import { useState, useEffect, useCallback } from 'react'
import { leadsApi } from '../api/leads'
import LeadCard from '../components/LeadCard'
import AddLeadModal from '../components/AddLeadModal'
import { getScoreStyle, timeAgo } from '../utils/helpers'

const POLL_INTERVAL = 30000

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.1, marginTop: 2 }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 20, width: 140 }} />
        <div className="skeleton" style={{ height: 60, width: 60, borderRadius: 12 }} />
      </div>
      <div className="skeleton" style={{ height: 16, width: 80 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 24, width: 100, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 64, width: '100%', borderRadius: 10 }} />
      <div className="skeleton" style={{ height: 14, width: 120 }} />
    </div>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await leadsApi.getAll()
      const sorted = (res.data.leads || []).sort((a, b) => {
        if (a.priority && !b.priority) return -1
        if (!a.priority && b.priority) return 1
        return (b.score ?? 0) - (a.score ?? 0)
      })
      setLeads(sorted)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError('Cannot connect to backend. Make sure the server is running on port 3000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(() => fetchLeads(true), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const filteredLeads = leads.filter(lead => {
    if (filter === 'priority') return lead.priority
    if (filter === 'hot') return lead.score >= 75
    if (filter === 'warm') return lead.score >= 40 && lead.score < 75
    if (filter === 'cold') return lead.score < 40
    return true
  })

  const priorityCount = leads.filter(l => l.priority).length
  const hotCount = leads.filter(l => l.score >= 75).length
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.length) : 0
  const avgStyle = getScoreStyle(avgScore)

  const FILTERS = [
    { key: 'all', label: 'All Leads' },
    { key: 'priority', label: '⚠️ Priority' },
    { key: 'hot', label: '🔥 Hot (75+)' },
    { key: 'warm', label: '🌡️ Warm (40-74)' },
    { key: 'cold', label: '❄️ Cold (<40)' },
  ]

  // Generate some fake recent activity for the right sidebar to make it lively
  const activities = leads.slice(0, 5).map((l, i) => ({
    id: i,
    text: l.lastAiAction ? `Jake messaged ${l.name}` : `New lead added: ${l.name}`,
    time: l.lastContactTime,
    icon: l.lastAiAction ? '🤖' : '✨'
  }))

  return (
    <>
      {/* Animated Background Blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-header)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-header)'
      }}>
        <div style={{ margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #EF4444, #F97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif",
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
            }}>T</div>
            <div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                ThrottleResponse<span style={{ color: '#EF4444' }}>BDC</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI-Powered BDC Platform</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {lastUpdated && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'none' }} className="sm:block">
                Refreshed {formatClock(lastUpdated)}
              </p>
            )}

            <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px 10px', borderRadius: 12 }} title="Toggle Dark Mode">
              <span style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</span>
            </button>

            {priorityCount > 0 && (
              <span className="badge anim-slide-right" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 14px' }}>
                 <span style={{ position:'relative', display:'inline-flex', width:8, height:8, marginRight: 6 }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#EF4444', opacity:0.6, animation:'ping-dot 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
                    <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:'#EF4444', display:'block' }} />
                  </span>
                {priorityCount} Alert{priorityCount !== 1 ? 's' : ''}
              </span>
            )}

            <button onClick={() => setShowModal(true)} className="btn-primary">
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Lead
            </button>
          </div>
        </div>
      </header>

      {/* ── 3-Column Layout ── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 1 }}>
        
        {/* Left Sidebar */}
        <aside style={{
          width: 260, borderRight: '1px solid var(--border)', background: 'var(--bg-sidebar)',
          padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 8,
          flexShrink: 0
        }} className="hidden lg:flex">
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 14, marginBottom: 8 }}>Menu</p>
          <div className="sidebar-item active">
            <span style={{ fontSize: 18 }}>📊</span> Dashboard
          </div>
          <div className="sidebar-item">
            <span style={{ fontSize: 18 }}>👥</span> All Leads
          </div>
          <div className="sidebar-item">
            <span style={{ fontSize: 18 }}>📅</span> Appointments
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 14, marginTop: 24, marginBottom: 8 }}>AI Settings</p>
          <div className="sidebar-item">
            <span style={{ fontSize: 18 }}>⚡</span> Persona config
          </div>
          <div className="sidebar-item">
            <span style={{ fontSize: 18 }}>💬</span> SMS Integration
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Leads" value={leads.length} color="#6366F1" icon="👥" />
            <StatCard label="Priority Alerts" value={priorityCount} color="#EF4444" icon="⚠️" />
            <StatCard label="Hot Leads (75+)" value={hotCount} color="#22C55E" icon="🔥" />
            <StatCard label="Avg Score" value={avgScore} color={avgStyle.bg} icon="📊" />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="btn-ghost"
                style={filter === f.key ? { background: 'var(--text-primary)', color: 'var(--bg-app)', borderColor: 'var(--text-primary)' } : {}}>
                {f.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-tag)', padding: '6px 12px', borderRadius: 99 }}>
              Auto-refreshing every 30s
            </span>
          </div>

          {error && (
            <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', border: '2px dashed var(--border)', borderRadius: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏍️</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>No leads yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                {filter !== 'all' ? 'No leads match this filter.' : 'Add your first lead to get started.'}
              </p>
              {filter === 'all' && (
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  + Add First Lead
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredLeads.map((lead, i) => (
                <LeadCard key={lead.id} lead={lead} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Activity Feed */}
        <aside style={{
          width: 320, borderLeft: '1px solid var(--border)', background: 'var(--bg-sidebar)',
          padding: '32px 24px', flexShrink: 0
        }} className="hidden xl:block">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Live Activity Log</h2>
          
          {activities.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for activity...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.map(act => (
                <div key={act.id} className="activity-item anim-fade-up" style={{ animationDelay: `${act.id * 80}ms` }}>
                  <div className="activity-dot" />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{act.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {act.text}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {timeAgo(act.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {showModal && <AddLeadModal onClose={() => setShowModal(false)} onAdded={l => setLeads(p => [l, ...p])} />}
    </>
  )
}

function formatClock(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
}
