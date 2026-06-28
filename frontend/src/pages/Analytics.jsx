import { useState, useEffect } from 'react'
import { analyticsApi } from '../api/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { Users, MessageSquare, AlertCircle, BarChart2, PauseCircle, TrendingUp } from 'lucide-react'

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
        <p style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {label}
        </p>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{ padding: 10, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Icon size={18} color={accent || '#6B7280'} strokeWidth={1.75} />
      </div>
    </div>
  )
}

function ChartCard({ title, children, style }) {
  return (
    <div className="card" style={{ padding: 24, ...style }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
        {title}
      </p>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#6B7280' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.get()
      .then(res => setData(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#111827', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (!data) return (
    <div style={{ padding: 40, color: '#EF4444', fontSize: 14 }}>Unable to load analytics. Is the backend running?</div>
  )

  const tierData = Object.entries(data.tiers).map(([key, count]) => ({
    name: TIER_LABELS[key],
    value: count,
    color: TIER_COLORS[key]
  })).filter(t => t.value > 0)

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Jake's performance and lead pipeline health — live session data</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Leads"     value={data.totalLeads}          icon={Users}          accent="#6B7280" />
        <StatCard label="Jake Messages"   value={data.jakeMessages}        icon={MessageSquare}  accent="#6B7280" />
        <StatCard label="Priority Alerts" value={data.priorityCount}       sub={`${data.priorityRate}% of leads`} icon={AlertCircle}    accent="#EF4444" />
        <StatCard label="Avg Score"       value={data.avgScore}            icon={BarChart2}      accent="#6B7280" />
        <StatCard label="Manual Takeover" value={data.manualTakeoverCount} sub="leads paused"   icon={PauseCircle}    accent="#D97706" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Leads over time */}
        <ChartCard title="Leads Added — Last 14 Days" style={{ gridColumn: '1 / -1' }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.leadsOverTime} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Leads"
                stroke="#111827"
                strokeWidth={2}
                dot={{ r: 3, fill: '#111827', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Score distribution */}
        <ChartCard title="Score Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.distribution} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Leads" fill="#D1D5DB" radius={[3, 3, 0, 0]}>
                {data.distribution.map((entry, i) => {
                  const midScore = i * 10 + 5
                  const color = midScore >= 90 ? '#A78BFA'
                    : midScore >= 75 ? '#6EE7B7'
                    : midScore >= 40 ? '#FCD34D'
                    : '#93C5FD'
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
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>No lead data yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
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
                    <span style={{ fontSize: 13, color: '#374151' }}>{t.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginLeft: 4 }}>{t.value}</span>
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
                padding: '8px 16px', background: '#F9FAFB',
                border: '1px solid #E5E7EB', borderRadius: 6
              }}>
                <TrendingUp size={14} color="#6B7280" />
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.signal}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>×{s.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}
