const CATS = [
  { key: 'transactionReadiness', label: 'Transaction Readiness', max: 40, color: '#EF4444', icon: '💳' },
  { key: 'productInterest',      label: 'Product Interest',      max: 25, color: '#6366F1', icon: '🏍️' },
  { key: 'purchaseTimeline',     label: 'Purchase Timeline',     max: 20, color: '#F97316', icon: '📅' },
  { key: 'engagementQuality',    label: 'Engagement Quality',    max: 14, color: '#A855F7', icon: '💬' },
]

export default function ScoreBreakdown({ breakdown = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {CATS.map(({ key, label, max, color, icon }) => {
        const val = breakdown[key] ?? 0
        const pct = Math.min(100, (val / max) * 100)
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>
                {val}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/{max}</span>
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-tag)', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: color,
                boxShadow: `0 0 8px ${color}55`,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
