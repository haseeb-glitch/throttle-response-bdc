import { CreditCard, Bike, Calendar, MessageSquare } from 'lucide-react'

const CATS = [
  { key: 'transactionReadiness', label: 'Transaction Readiness', max: 40, color: '#EF4444', icon: CreditCard },
  { key: 'productInterest',      label: 'Product Interest',      max: 25, color: '#4F46E5', icon: Bike },
  { key: 'purchaseTimeline',     label: 'Purchase Timeline',     max: 20, color: '#F59E0B', icon: Calendar },
  { key: 'engagementQuality',    label: 'Engagement Quality',    max: 14, color: '#8B5CF6', icon: MessageSquare },
]

export default function ScoreBreakdown({ breakdown = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {CATS.map(({ key, label, max, color, icon: Icon }) => {
        const val = breakdown[key] ?? 0
        const pct = Math.min(100, (val / max) * 100)
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} color="#6B7280" />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>
                {val}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/{max}</span>
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-tag)', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: color,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
