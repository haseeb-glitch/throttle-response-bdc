import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leads'
import ScoreGauge from '../components/ScoreGauge'
import ScoreBreakdown from '../components/ScoreBreakdown'
import ConversationHistory from '../components/ConversationHistory'
import { catStyle, timeAgo } from '../utils/helpers'

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 20 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value, icon }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 18, marginTop: 2 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)

  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  
  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await leadsApi.getOne(id)
        setLead(res.data.lead)
      } catch {
        setError('Lead not found.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setSendError(null)
    try {
      const res = await leadsApi.sendMessage(id, message.trim())
      setLead(res.data.lead)
      setMessage('')
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#6366F1', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (error || !lead) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
      <button onClick={() => navigate('/')} className="btn-ghost">← Back to Dashboard</button>
    </div>
  )

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-header)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-header)'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '6px 12px', border: 'none' }}>
            ← Back
          </button>
          
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
            }}>
              {lead.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
                {lead.name}
              </h1>
              {lead.bikeInterest && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🏍️ {lead.bikeInterest}
                </p>
              )}
            </div>
          </div>

          <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px 10px', border: 'none' }} title="Toggle Dark Mode">
            {isDark ? '☀️' : '🌙'}
          </button>

          {lead.priority && (
             <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 12px' }}>
             <span style={{ position:'relative', display:'inline-flex', width:8, height:8, marginRight: 4 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#EF4444', opacity:0.6, animation:'ping-dot 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
                <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:'#EF4444', display:'block' }} />
              </span>
              Needs Attention
            </span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Left Col */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Section title="Buying Probability">
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreGauge score={lead.score ?? 0} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
                Last contact {timeAgo(lead.lastContactTime)}
              </p>
            </div>
          </Section>

          <Section title="Score Breakdown">
            <ScoreBreakdown breakdown={lead.scoreBreakdown} />
          </Section>

          <Section title="Customer Info">
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <InfoRow label="Phone" value={lead.phone} icon="📱" />
              <InfoRow label="Email" value={lead.email} icon="✉️" />
              <InfoRow label="Bike Interest" value={lead.bikeInterest} icon="🏍️" />
              {lead.nextFollowUp && <InfoRow label="Next Follow-up" value={lead.nextFollowUp} icon="📅" />}
            </div>
          </Section>
        </div>

        {/* Right Col */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {lead.buyingSignals?.length > 0 && (
            <Section title="Buying Signals">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lead.buyingSignals.map((sig, i) => {
                  const c = catStyle[sig.category] || catStyle.Engagement
                  return (
                    <span key={i} className="badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '4px 12px' }}>
                      <span style={{ opacity: 0.7, marginRight: 4 }}>{sig.category}:</span> {sig.signal}
                    </span>
                  )
                })}
              </div>
            </Section>
          )}

          {lead.priority && lead.priorityReasons?.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 20, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#EF4444', marginBottom: 12 }}>
                ⚠️ Priority — Human Intervention Needed
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lead.priorityReasons.map((r, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Section title={`Conversation (${lead.conversation?.length ?? 0} messages)`}>
            <ConversationHistory conversation={lead.conversation} />
            
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <input
                type="text" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Simulate customer reply..."
                className="input-base"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={sending || !message.trim()}>
                {sending ? '...' : 'Send'}
              </button>
            </form>
            {sendError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{sendError}</p>}
          </Section>

        </div>
      </main>
    </>
  )
}
