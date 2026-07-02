import { useState, useEffect } from 'react'
import { analyticsApi } from '../api/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts'
import { Users, MessageSquare, AlertCircle, BarChart2, PauseCircle, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const TIER_COLORS = {
  cold:  '#93C5FD',
  warm:  '#FCD34D',
  hot:   '#6EE7B7',
  elite: '#A78BFA',
}

const TIER_LABELS = {
  cold:  'Cold (0–39)',
  warm:  'Warm (40–74)',
  hot:   'Hot (75–89)',
  elite: 'Elite (90+)',
}

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {label}
        </p>
        <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{ padding: 10, background: 'var(--bg-tag)', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }}>
        <Icon size={18} color={accent || 'var(--text-muted)'} strokeWidth={1.75} />
      </div>
    </div>
  )
}

function ChartCard({ title, children, style }) {
  return (
    <div className="card" style={{ padding: 24, ...style }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
        {title}
      </p>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-secondary)' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.get()
      .then(res => setData(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#F97316', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 40, color: '#EF4444', fontSize: 14 }}>Unable to load analytics. Is the backend running?</div>
    </div>
  )

  const tierData = Object.entries(data.tiers).map(([key, count]) => ({
    name: TIER_LABELS[key],
    value: count,
    color: TIER_COLORS[key]
  })).filter(t => t.value > 0)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', minWidth: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Analytics</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Jake's performance and lead pipeline health — live session data</p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Leads"     value={data.totalLeads}          icon={Users}          accent="var(--text-muted)" />
            <StatCard label="Jake Messages"   value={data.jakeMessages}        icon={MessageSquare}  accent="var(--text-muted)" />
            <StatCard label="Priority Alerts" value={data.priorityCount}       sub={`${data.priorityRate}% of leads`} icon={AlertCircle} accent="#EF4444" />
            <StatCard label="Avg Score"       value={data.avgScore}            icon={BarChart2}      accent="var(--text-muted)" />
            <StatCard label="Manual Takeover" value={data.manualTakeoverCount} sub="leads paused"    icon={PauseCircle}    accent="#D97706" />
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Leads over time */}
            <ChartCard title="Leads Added — Last 14 Days" style={{ gridColumn: '1 / -1' }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.leadsOverTime} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Leads"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#F97316', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Score distribution */}
            <ChartCard title="Score Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.distribution} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Leads" radius={[3, 3, 0, 0]}>
                    {data.distribution.map((entry, i) => {
                      const midScore = i * 10 + 5
                      const color = midScore >= 90 ? '#22C55E'
                        : midScore >= 75 ? '#EF4444'
                        : midScore >= 60 ? '#F97316'
                        : midScore >= 40 ? '#EAB308'
                        : midScore >= 20 ? '#3B82F6'
                        : '#94A3B8'
                      return <Cell key={i} fill={color} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Tier breakdown pie */}
            <ChartCard title="Pipeline by Tier">
              {tierData.length === 0 ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No lead data yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={tierData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {tierData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tierData.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}>{t.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Top buying signals */}
          {data.topSignals.length > 0 && (
            <ChartCard title="Top Detected Buying Signals">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {data.topSignals.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', background: 'var(--bg-tag)',
                    border: '1px solid var(--border)', borderRadius: 6
                  }}>
                    <TrendingUp size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{s.signal}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>×{s.count}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      </main>
    </div>
  )
}