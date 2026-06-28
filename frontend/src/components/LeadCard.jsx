import { getScoreStyle, timeAgo, catStyle } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { Bike, Calendar } from 'lucide-react'

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
      <div style={{ padding: '20px' }}>

        {/* ── Row 1: Name + Score badge ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#111827', lineHeight: 1.2 }}>
                {lead.name}
              </span>
              {lead.priority && (
                <span className="badge" style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FCA5A5', fontSize: 11, borderRadius: 99, padding: '2px 8px' }}>
                  Priority
                </span>
              )}
            </div>
            {lead.bikeInterest && (
              <p style={{ fontSize: 13, color: '#4F46E5', fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                <Bike size={14} /> {lead.bikeInterest}
              </p>
            )}
          </div>

          {/* Score Badge Pill */}
          <div style={{
            flexShrink: 0, padding: '4px 8px', borderRadius: 6,
            border: `1px solid ${style.border}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 2
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: style.color, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#9CA3AF' }}>/99</span>
          </div>
        </div>

        {/* ── Score label chip & Buying signals ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          <span className="badge" style={{
            background: 'transparent', color: style.color,
            border: `1px solid ${style.border}`, fontSize: 11, borderRadius: 99, padding: '2px 8px'
          }}>
            {style.label}
          </span>

          {lead.buyingSignals?.length > 0 && 
            lead.buyingSignals.slice(0, 2).map((sig, i) => {
              const c = catStyle[sig.category] || catStyle.Engagement
              return (
                <span key={i} className="badge" style={{
                  background: 'transparent', color: c.color,
                  border: `1px solid ${c.border}`, fontSize: 11, borderRadius: 99, padding: '2px 8px'
                }}>
                  {sig.signal}
                </span>
              )
            })
          }
        </div>

        {/* ── Last AI message preview ── */}
        {lead.lastAiAction && (
          <div style={{
            padding: '10px 12px', borderRadius: 6, marginBottom: 14,
            background: '#F9FAFB', border: '1px solid #E5E7EB',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Last AI Message
            </p>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {lead.lastAiAction}
            </p>
          </div>
        )}

        {/* ── Footer: time + follow-up ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280' }}>{timeAgo(lead.lastContactTime)}</span>
          </div>
          {lead.nextFollowUp && (
            <span className="badge" style={{ background: 'transparent', color: '#D97706', border: '1px solid #FCD34D', fontSize: 11, borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px' }}>
              <Calendar size={12} /> {lead.nextFollowUp}
            </span>
          )}
          <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>View →</span>
        </div>

      </div>
    </div>
  )
}
