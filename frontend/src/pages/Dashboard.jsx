import { useState, useEffect, useCallback } from 'react'
import { leadsApi } from '../api/leads'
import LeadCard from '../components/LeadCard'
import AddLeadModal from '../components/AddLeadModal'
import { timeAgo } from '../utils/helpers'
import { Users, AlertCircle, Flame, BarChart2, LayoutDashboard, Calendar, Settings, MessageSquare, Plus } from 'lucide-react'

const POLL_INTERVAL = 30000

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <Icon size={18} color="#6B7280" strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
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
        <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 16, width: 80 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 20, width: 80, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 20, width: 80, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 48, width: '100%', borderRadius: 6 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 14, width: 80 }} />
        <div className="skeleton" style={{ height: 14, width: 40 }} />
      </div>
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
    } catch {
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

  const FILTERS = [
    { key: 'all', label: 'All Leads' },
    { key: 'priority', label: 'Priority', dot: '#EF4444' },
    { key: 'hot', label: 'Hot', dot: '#10B981' },
    { key: 'warm', label: 'Warm', dot: '#F59E0B' },
    { key: 'cold', label: 'Cold', dot: '#3B82F6' },
  ]

  // Generate some fake recent activity for the right sidebar to make it lively
  const activities = leads.slice(0, 5).map((l, i) => ({
    id: i,
    text: l.lastAiAction ? `Jake messaged ${l.name}` : `New lead added: ${l.name}`,
    time: l.lastContactTime,
    hasAction: !!l.lastAiAction
  }))

  return (
    <>
      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700
            }}>T</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827', lineHeight: 1.1 }}>
                ThrottleResponseBDC
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {lastUpdated && (
              <p style={{ fontSize: 13, color: '#6B7280', display: 'none' }} className="sm:block">
                Refreshed {formatClock(lastUpdated)}
              </p>
            )}



            {priorityCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: 12, fontWeight: 500, borderRadius: 6 }}>
                <AlertCircle size={14} />
                {priorityCount} Alert{priorityCount !== 1 ? 's' : ''}
              </span>
            )}

            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>
      </header>

      {/* ── 3-Column Layout ── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 1 }}>
        
        {/* Left Sidebar */}
        <aside style={{
          width: 260, borderRight: '1px solid #E5E7EB', background: '#FFFFFF',
          padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 4,
          flexShrink: 0
        }} className="hidden lg:flex">
          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 14, marginBottom: 8 }}>Menu</p>
          <div className="sidebar-item active">
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div className="sidebar-item">
            <Users size={18} /> All Leads
          </div>
          <div className="sidebar-item">
            <Calendar size={18} /> Appointments
          </div>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 14, marginTop: 24, marginBottom: 8 }}>AI Settings</p>
          <div className="sidebar-item">
            <Settings size={18} /> Persona config
          </div>
          <div className="sidebar-item">
            <MessageSquare size={18} /> SMS Integration
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Leads" value={leads.length} icon={Users} />
            <StatCard label="Priority Alerts" value={priorityCount} icon={AlertCircle} />
            <StatCard label="Hot Leads (75+)" value={hotCount} icon={Flame} />
            <StatCard label="Avg Score" value={avgScore} icon={BarChart2} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="btn-ghost"
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 13, border: 'none', background: filter === f.key ? '#111827' : 'transparent', color: filter === f.key ? '#FFFFFF' : '#6B7280'
                }}>
                {f.dot && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: f.dot, marginRight: 6 }} />}
                {f.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
              Auto-refreshing every 30s
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', color: '#111827', borderLeft: '3px solid #EF4444', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="#EF4444" />
              {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px solid #E5E7EB', borderRadius: 8 }}>
              <div style={{ color: '#9CA3AF', marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Users size={32} /></div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#111827' }}>No leads yet</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
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
          width: 320, borderLeft: '1px solid #E5E7EB', background: '#FFFFFF',
          padding: '32px 24px', flexShrink: 0
        }} className="hidden xl:block">
          <h2 style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Live Activity Log</h2>
          
          {activities.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6B7280' }}>Waiting for activity...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activities.map(act => (
                <div key={act.id} className="anim-fade-up" style={{ animationDelay: `${act.id * 80}ms`, display: 'flex', gap: 12 }}>
                  <div style={{ marginTop: 4 }}>
                    {act.id === 0 ? (
                      <span style={{ position:'relative', display:'block', width:6, height:6 }}>
                        <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#10B981', opacity:0.4, animation:'ping-dot 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
                        <span style={{ position:'relative', width:6, height:6, borderRadius:'50%', background:'#10B981', display:'block' }} />
                      </span>
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>
                      {act.text}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {timeAgo(act.time)}
                    </p>
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
