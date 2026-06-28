export default function ScoreGauge({ score }) {
  const r   = 52
  const circ = 2 * Math.PI * r
  const pct  = Math.min(score / 99, 1)
  const dash = pct * circ

  let color = '#94A3B8', label = 'Very Low'
  if (score >= 90) { color = '#22C55E'; label = 'Elite Buyer' }
  else if (score >= 75) { color = '#EF4444'; label = 'High Probability' }
  else if (score >= 60) { color = '#F97316'; label = 'Strong Buyer' }
  else if (score >= 40) { color = '#EAB308'; label = 'Qualified Prospect' }
  else if (score >= 20) { color = '#3B82F6'; label = 'Casual Shopper' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 144, height: 144 }}>
        <svg width="144" height="144" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 5px ${color}88)` }}
          />
        </svg>
        {/* Center */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 38, lineHeight: 1, color }}>
            {score}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>/99</span>
        </div>
      </div>
      <span className="badge" style={{
        background: `${color}18`, color, border: `1px solid ${color}40`,
        fontSize: 13, padding: '5px 14px'
      }}>
        {label}
      </span>
    </div>
  )
}
