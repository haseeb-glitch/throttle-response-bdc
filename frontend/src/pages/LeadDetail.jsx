import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leads'
import ScoreGauge from '../components/ScoreGauge'
import ScoreBreakdown from '../components/ScoreBreakdown'
import ConversationHistory from '../components/ConversationHistory'
import { catStyle, timeAgo } from '../utils/helpers'
import { Phone, Mail, Bike, Calendar, ArrowLeft, AlertCircle, PauseCircle, PlayCircle } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', marginBottom: 20 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <Icon size={16} color="#6B7280" style={{ marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', wordBreak: 'break-all' }}>
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
  const [sending, setSending]   = useState(false)
  const [sendError, setSendError] = useState(null)
  const [toggling, setToggling]   = useState(false)

  const handleToggleTakeover = async () => {
    setToggling(true)
    try {
      const res = await leadsApi.toggleTakeover(lead.id)
      setLead(res.data.lead)
    } catch (err) {
      console.error('Takeover toggle failed:', err)
    } finally {
      setToggling(false)
    }
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
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#4F46E5', animation: 'spin 1s linear infinite' }} />
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
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '6px 12px', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={16} /> Back
          </button>
          
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#F3F4F6',
              border: '1px solid #D1D5DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#111827', fontWeight: 600, fontSize: 15, flexShrink: 0
            }}>
              {lead.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontWeight: 600, fontSize: 18, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
                {lead.name}
              </h1>
              {lead.bikeInterest && (
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Bike size={14} /> {lead.bikeInterest}
                </p>
              )}
            </div>
          </div>



          {lead.priority && (
             <span className="badge" style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FCA5A5', padding: '4px 12px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Priority
            </span>
          )}

          {/* Manual Takeover Toggle */}
          <button
            onClick={handleToggleTakeover}
            disabled={toggling}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              border: lead.manualTakeover ? '1px solid #FDE68A' : '1px solid #E5E7EB',
              background: lead.manualTakeover ? '#FFFBEB' : '#F9FAFB',
              color: lead.manualTakeover ? '#D97706' : '#374151',
              transition: 'all 0.15s',
            }}
          >
            {lead.manualTakeover
              ? <><PlayCircle size={15} /> Resume Pablo</>           
              : <><PauseCircle size={15} /> Take Over</>}
          </button>
        </div>
      </header>

      {/* Takeover active banner */}
      {lead.manualTakeover && (
        <div style={{
          background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <PauseCircle size={15} color="#D97706" />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
            You are in control — Pablo will not respond to this lead until you resume.
          </span>
        </div>
      )}

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Left Col */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Section title="Buying Probability">
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreGauge score={lead.score ?? 0} />
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 24 }}>
                Last contact {timeAgo(lead.lastContactTime)}
              </p>
            </div>
          </Section>

          <Section title="Score Breakdown">
            <ScoreBreakdown breakdown={lead.scoreBreakdown} />
          </Section>

          <Section title="Customer Info">
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <InfoRow label="Phone" value={lead.phone} icon={Phone} />
              <InfoRow label="Email" value={lead.email} icon={Mail} />
              <InfoRow label="Bike Interest" value={lead.bikeInterest} icon={Bike} />
              {lead.nextFollowUp && <InfoRow label="Next Follow-up" value={lead.nextFollowUp} icon={Calendar} />}
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
                    <span key={i} className="badge" style={{ background: 'transparent', color: c.color, border: `1px solid ${c.border}`, padding: '4px 12px', borderRadius: 99 }}>
                      <span style={{ opacity: 0.7, marginRight: 4 }}>{sig.category}:</span> {sig.signal}
                    </span>
                  )
                })}
              </div>
            </Section>
          )}

          {lead.priority && lead.priorityReasons?.length > 0 && (
            <div style={{ padding: 16, marginBottom: 20, background: '#FEF2F2', borderLeft: '3px solid #EF4444', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} /> Human Intervention Needed
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {lead.priorityReasons.map((r, i) => (
                  <span key={i} style={{ fontSize: 12, color: '#EF4444', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: 4 }}>
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
