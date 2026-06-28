import { getScoreStyle, timeAgo, catStyle } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'

export default function LeadCard({ lead, index }) {
  const navigate = useNavigate()
  const score  = lead.score ?? 0
  const style  = getScoreStyle(score)

  return (
    <div
      className="card card-interactive anim-fade-up"
      style={{ animationDelay: `${index * 45}ms` }}
      onClick={() => navigate(`/lead/${lead.id}`)}
    >
      {/* Score color accent strip */}
      <div style={{ height: 3, background: style.bg, borderRadius: '16px 16px 0 0' }} />

      <div style={{ padding: '18px 20px 20px' }}>

        {/* ── Row 1: Name + Score badge ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {lead.name}
              </span>
              {lead.priority && (
                <span className="badge" style={{ background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', fontSize: 11 }}>
                  <span style={{ position:'relative', display:'inline-flex', width:7, height:7 }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#EF4444', opacity:0.6,
                      animation:'ping-dot 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
                    <span style={{ position:'relative', width:7, height:7, borderRadius:'50%', background:'#EF4444', display:'block' }} />
                  </span>
                  Needs Attention
                </span>
              )}
            </div>
            {lead.bikeInterest && (
              <p style={{ fontSize: 13, color: '#6366F1', fontWeight: 500, marginTop: 3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                🏍️ {lead.bikeInterest}
              </p>
            )}
          </div>

          {/* Score circle */}
          <div style={{
            flexShrink: 0, width: 60, height: 60, borderRadius: 12,
            background: style.bg, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${style.bg}44`,
          }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1, color: style.text }}>
              {score}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: style.text, opacity: 0.8 }}>/99</span>
          </div>
        </div>

        {/* ── Score label chip ── */}
        <div style={{ marginBottom: 12 }}>
          <span className="badge" style={{
            background: `${style.bg}18`, color: style.bg,
            border: `1px solid ${style.bg}40`, fontSize: 11
          }}>
            {style.label}
          </span>
        </div>

        {/* ── Buying signals ── */}
        {lead.buyingSignals?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {lead.buyingSignals.slice(0, 3).map((sig, i) => {
              const c = catStyle[sig.category] || catStyle.Engagement
              return (
                <span key={i} className="badge" style={{
                  background: c.bg, color: c.color,
                  border: `1px solid ${c.border}`, fontSize: 11
                }}>
                  {sig.signal}
                </span>
              )
            })}
          </div>
        )}

        {/* ── Last AI message preview ── */}
        {lead.lastAiAction && (
          <div style={{
            padding: '10px 12px', borderRadius: 10, marginBottom: 14,
            background: 'var(--bg-tag)', border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Last AI Message
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {lead.lastAiAction}
            </p>
          </div>
        )}

        {/* ── Footer: time + follow-up ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(lead.lastContactTime)}</span>
          </div>
          {lead.nextFollowUp && (
            <span className="badge" style={{ background: 'rgba(234,179,8,0.10)', color: '#CA8A04', border: '1px solid rgba(234,179,8,0.25)', fontSize: 11 }}>
              📅 {lead.nextFollowUp}
            </span>
          )}
          <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600 }}>View →</span>
        </div>

      </div>
    </div>
  )
}
