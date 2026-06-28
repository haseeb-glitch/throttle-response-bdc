export default function ScoreGauge({ score }) {
  const r   = 52
  const circ = 2 * Math.PI * r
  const pct  = Math.min(score / 99, 1)
  const dash = pct * circ

  let color = '#6B7280', label = 'Very Low', border = '#E5E7EB'
  if (score >= 75) { color = '#10B981'; label = 'High Probability'; border = '#10B981' }
  else if (score >= 60) { color = '#10B981'; label = 'Strong Buyer'; border = '#10B981' }
  else if (score >= 40) { color = '#F59E0B'; label = 'Qualified Prospect'; border = '#F59E0B' }
  else if (score >= 20) { color = '#6B7280'; label = 'Casual Shopper'; border = '#E5E7EB' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 144, height: 144 }}>
        <svg width="144" height="144" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Center */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontWeight: 700, fontSize: 36, lineHeight: 1, color }}>
            {score}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>/99</span>
        </div>
      </div>
      <span className="badge" style={{
        background: 'transparent', color, border: `1px solid ${border}`,
        fontSize: 12, padding: '4px 12px', borderRadius: 99
      }}>
        {label}
      </span>
    </div>
  )
}
