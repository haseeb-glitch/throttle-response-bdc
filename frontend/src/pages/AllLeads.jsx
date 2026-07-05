import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leads'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { timeAgo } from '../utils/helpers'
import { Users, AlertCircle, Search, ChevronUp, ChevronDown } from 'lucide-react'

function ScoreBadge({ score }) {
  const color = score >= 90 ? '#22C55E'
    : score >= 75 ? '#EF4444'
    : score >= 60 ? '#F97316'
    : score >= 40 ? '#EAB308'
    : score >= 20 ? '#3B82F6'
    : '#94A3B8'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 48, height: 24, borderRadius: 6,
      background: `${color}22`, border: `1px solid ${color}`,
      fontSize: 12, fontWeight: 700, color
    }}>
      {score}
    </span>
  )
}

export default function AllLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('score')
  const [sortDir, setSortDir] = useState('desc')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const fetchLeads = useCallback(async () => {
    try {
      const res = await leadsApi.getAll()
      setLeads(res.data.leads || [])
      setError(null)
    } catch {
      setError('Cannot connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const priorityCount = leads.filter(l => l.priority).length

  const filtered = leads
    .filter(l => {
      if (filter === 'priority') return l.priority
      if (filter === 'hot') return l.score >= 75
      if (filter === 'warm') return l.score >= 40 && l.score < 75
      if (filter === 'cold') return l.score < 40
      return true
    })
    .filter(l => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.bikeInterest?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'lastContactTime') { av = new Date(av); bv = new Date(bv) }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'priority', label: 'Priority', dot: '#EF4444' },
    { key: 'hot', label: 'Hot', dot: '#10B981' },
    { key: 'warm', label: 'Warm', dot: '#F59E0B' },
    { key: 'cold', label: 'Cold', dot: '#3B82F6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar priorityCount={priorityCount} />
        <main style={{ flex: 1, padding: '32px', minWidth: 0, overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>All Leads</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{leads.length} total leads</p>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, phone, bike..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base"
                style={{ paddingLeft: 36, width: 260 }}
              />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="btn-ghost"
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 13, border: 'none',
                  background: filter === f.key ? '#F97316' : 'transparent',
                  color: filter === f.key ? '#FFFFFF' : 'var(--text-secondary)'
                }}>
                {f.dot && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: f.dot, marginRight: 6 }} />}
                {f.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', color: '#EF4444', borderLeft: '3px solid #EF4444', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {[
                      { key: 'name', label: 'Customer' },
                      { key: 'bikeInterest', label: 'Bike Interest' },
                      { key: 'score', label: 'Score' },
                      { key: 'priority', label: 'Priority' },
                      { key: 'lastContactTime', label: 'Last Contact' },
                      { key: null, label: 'Signals' },
                      { key: null, label: 'Action' },
                    ].map((col, i) => (
                      <th key={i}
                        onClick={() => col.key && handleSort(col.key)}
                        style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          cursor: col.key ? 'pointer' : 'default',
                          userSelect: 'none', whiteSpace: 'nowrap',
                          background: 'var(--bg-card)'
                        }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}>
                            <div className="skeleton" style={{ height: 16, width: j === 0 ? 120 : 80, borderRadius: 4 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Users size={28} style={{ color: 'var(--text-muted)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                          {search ? 'No leads match your search.' : 'No leads yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((lead, i) => (
                      <tr key={lead.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-app)',
                          transition: 'background 0.1s',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/lead/${lead.id}`)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-app)'}
                      >
                        {/* Customer */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: '#F97316', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 600, flexShrink: 0
                            }}>
                              {lead.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{lead.name}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Bike */}
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {lead.bikeInterest || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>

                        {/* Score */}
                        <td style={{ padding: '14px 16px' }}>
                          <ScoreBadge score={lead.score} />
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '14px 16px' }}>
                          {lead.priority ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#EF4444', background: '#FEF2F2', padding: '2px 8px', borderRadius: 99 }}>
                              <AlertCircle size={10} /> Alert
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Last Contact */}
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {timeAgo(lead.lastContactTime)}
                        </td>

                        {/* Signals */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(lead.buyingSignals || []).slice(0, 2).map((s, j) => (
                              <span key={j} style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', background: 'var(--bg-tag)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)' }}>
                                {s.signal}
                              </span>
                            ))}
                            {(lead.buyingSignals || []).length > 2 && (
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{lead.buyingSignals.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/lead/${lead.id}`) }}
                            className="btn-ghost"
                            style={{ fontSize: 12, padding: '4px 10px' }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}