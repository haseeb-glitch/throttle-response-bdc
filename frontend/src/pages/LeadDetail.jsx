import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leads'
import ScoreGauge from '../components/ScoreGauge'
import ScoreBreakdown from '../components/ScoreBreakdown'
import { timeAgo } from '../utils/helpers'
import { Phone, Mail, ArrowLeft, AlertCircle, PauseCircle, PlayCircle, Bot, User, Clock, TrendingUp, Shield } from 'lucide-react'
import Header from '../components/Header'

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 20 }}>
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
      <Icon size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function TimelineEvent({ msg, index, prevScore }) {
  const isAI = msg.role === 'assistant'
  const isSystem = msg.role === 'system'
  const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  }) : ''

  // System event styling
  if (isSystem) {
    const isScore = msg.type === 'score_change'
    const isTakeover = msg.type === 'takeover'
    const isResume = msg.type === 'resume'

    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 99,
          background: isScore ? 'rgba(249,115,22,0.1)'
            : isTakeover ? 'rgba(239,68,68,0.1)'
            : 'rgba(16,185,129,0.1)',
          border: `1px solid ${isScore ? 'rgba(249,115,22,0.3)'
            : isTakeover ? 'rgba(239,68,68,0.3)'
            : 'rgba(16,185,129,0.3)'}`,
          fontSize: 11, color: isScore ? '#F97316'
            : isTakeover ? '#EF4444'
            : '#10B981'
        }}>
          {isScore && <TrendingUp size={11} />}
          {(isTakeover || isResume) && <Shield size={11} />}
          {msg.content}
          {time && <span style={{ opacity: 0.7, marginLeft: 4 }}>· {time}</span>}
        </div>
      </div>
    )
  }

  // Manager message
  if (msg.role === 'manager') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: '#7C3AED',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={14} color="#fff" />
        </div>
        <div style={{ maxWidth: '72%' }}>
          <div style={{
            padding: '10px 14px',
            borderRadius: '12px 12px 3px 12px',
            background: '#7C3AED',
            fontSize: 14, lineHeight: 1.5, color: '#fff'
          }}>
            {msg.content}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
            <Clock size={10} color="var(--text-muted)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Manager · {new Date(msg.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isAI ? 'row' : 'row-reverse',
      gap: 10, marginBottom: 16, alignItems: 'flex-end'
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isAI ? '#F97316' : 'var(--bg-tag)',
        border: `1px solid ${isAI ? '#EA580C' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isAI
          ? <Bot size={14} color="#fff" />
          : <User size={14} color="var(--text-secondary)" />
        }
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%' }}>
        <div style={{
          padding: '10px 14px', borderRadius: isAI ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
          background: isAI ? '#F97316' : 'var(--bg-tag)',
          border: isAI ? 'none' : '1px solid var(--border)',
          fontSize: 14, lineHeight: 1.5,
          color: isAI ? '#fff' : 'var(--text-primary)',
        }}>
          {msg.content}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
          justifyContent: isAI ? 'flex-start' : 'flex-end'
        }}>
          <Clock size={10} color="var(--text-muted)" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {isAI ? 'Pablo' : 'Customer'} · {time}
          </span>
        </div>
      </div>
    </div>
  )
}

function buildTimeline(conversation, lead) {
  const timeline = []
  let lastScore = 0

  conversation.forEach((msg, i) => {
    // Score change event inject karo (har 3rd AI message ke baad)
    if (msg.role === 'assistant' && i > 0 && i % 3 === 0 && lead.score > lastScore) {
      timeline.push({
        role: 'system',
        type: 'score_change',
        content: `Score updated to ${lead.score}/99`,
        timestamp: msg.timestamp
      })
      lastScore = lead.score
    }

    // Takeover/resume events
    if (msg.role === 'assistant' && msg.content?.includes('Manual takeover active')) {
      timeline.push({
        role: 'system',
        type: 'takeover',
        content: 'Manual takeover — Pablo paused',
        timestamp: msg.timestamp
      })
      return
    }

    if (msg.role === 'assistant' && msg.content?.includes('Jake resumed') || msg.content?.includes('Pablo resumed')) {
      timeline.push({
        role: 'system',
        type: 'resume',
        content: 'Pablo resumed — AI responding again',
        timestamp: msg.timestamp
      })
      return
    }

    timeline.push(msg)
  })

  return timeline
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
  const [toggling, setToggling] = useState(false)
  const leftRef = useRef(null)
  const centerHeaderRef = useRef(null)
  const centerFooterRef = useRef(null)
  const centerCardRef = useRef(null)
  const timelineRef = useRef(null)
  const [timelineMaxHeight, setTimelineMaxHeight] = useState(null)

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
    const fetchLead = async () => {
      try {
        const res = await leadsApi.getOne(id)
        setLead(res.data.lead)
      } catch {
        setError('Lead not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  const timeline = buildTimeline(lead?.conversation || [], lead || { score: 0 })

  useLayoutEffect(() => {
    function updateHeights() {
      const leftH = leftRef.current?.offsetHeight || 0
      const headerH = centerHeaderRef.current?.offsetHeight || 0
      const footerH = centerFooterRef.current?.offsetHeight || 0
      // set center card height to match left column, minus small gap
      const gap = 0
      if (centerCardRef.current) {
        centerCardRef.current.style.height = leftH ? `${leftH - gap}px` : ''
      }
      // also keep previous fallback for timeline
      const padding = 48
      const available = Math.max(120, leftH - headerH - footerH - padding)
      setTimelineMaxHeight(available)
    }

    updateHeights()
    window.addEventListener('resize', updateHeights)
    return () => window.removeEventListener('resize', updateHeights)
  }, [lead, timeline.length])

  useEffect(() => {
    if (!timelineRef.current) return
    timelineRef.current.scrollTop = timelineRef.current.scrollHeight
  }, [timeline.length])

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#F97316', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (error || !lead) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, background: 'var(--bg-app)' }}>
      <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
      <button onClick={() => navigate(-1)} className="btn-ghost">← Back</button>
    </div>
  )

  const scoreColor = lead.score >= 90 ? '#22C55E'
    : lead.score >= 75 ? '#EF4444'
    : lead.score >= 60 ? '#F97316'
    : lead.score >= 40 ? '#EAB308'
    : lead.score >= 20 ? '#3B82F6'
    : '#94A3B8'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Header />

      {/* Lead Header Bar */}
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#F97316',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
          }}>
            {lead.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.1 }}>{lead.name}</h1>
            {lead.bikeInterest && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>🏍️ {lead.bikeInterest}</p>
            )}
          </div>
        </div>

        {/* Score badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          background: `${scoreColor}18`, border: `1px solid ${scoreColor}40`
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{lead.score}</span>
          <span style={{ fontSize: 12, color: scoreColor, opacity: 0.8 }}>/99</span>
        </div>

        {lead.priority && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '4px 12px', borderRadius: 99 }}>
            <AlertCircle size={12} /> Priority
          </span>
        )}

        {/* Takeover toggle */}
        <button onClick={handleToggleTakeover} disabled={toggling} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
          fontSize: 13, fontWeight: 500,
          border: lead.manualTakeover ? '1px solid #FDE68A' : '1px solid var(--border)',
          background: lead.manualTakeover ? 'rgba(251,191,36,0.1)' : 'var(--bg-tag)',
          color: lead.manualTakeover ? '#D97706' : 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}>
          {lead.manualTakeover
            ? <><PlayCircle size={15} /> Resume Pablo</>
            : <><PauseCircle size={15} /> Take Over</>}
        </button>
      </div>

      {/* Takeover banner */}
      {lead.manualTakeover && (
        <div style={{ background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid #FDE68A', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <PauseCircle size={15} color="#D97706" />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#D97706' }}>
            You are in control — Pablo will not respond until you resume.
          </span>
        </div>
      )}

      {/* Main content */}
      <main style={{ width: '100%', padding: '24px', display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left column: Buying probability + breakdown */}
        <div ref={leftRef}>
          <Section title="Buying Probability">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
              <ScoreGauge score={lead.score ?? 0} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
                Last contact {timeAgo(lead.lastContactTime)}
              </p>
            </div>
          </Section>

          <Section title="Score Breakdown">
            <ScoreBreakdown breakdown={lead.scoreBreakdown} />
          </Section>
        </div>

        {/* Center column — Full conversation timeline */}
        <div ref={centerCardRef} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 ref={centerHeaderRef} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Conversation Timeline ({timeline.length} events)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} /> Pablo
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-tag)', border: '1px solid var(--border)' }} /> Customer
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 8, marginBottom: 20 }}>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                No conversation yet.
              </div>
            ) : (
              timeline.map((msg, i) => (
                <TimelineEvent key={i} msg={msg} index={i} />
              ))
            )}
          </div>

          {/* Input section — takeover mode pe depend karta hai */}
          <div style={{ 
            borderTop: '1px solid var(--border)', 
            paddingTop: 20,
            margin: '0 -24px -24px',
            padding: '20px 24px 24px',
            background: lead.manualTakeover ? 'rgba(124,58,237,0.08)' : 'transparent',
            borderTop: lead.manualTakeover ? '2px solid #7C3AED' : '1px solid var(--border)',
            borderRadius: '0 0 8px 8px',
            transition: 'all 0.3s ease'
          }}>
            {lead.manualTakeover ? (
              <>
                <p style={{ fontSize: 11, color: '#D97706', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={11} /> Send Manual Message to Customer
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!message.trim()) return
                  setSending(true)
                  setSendError(null)
                  try {
                    const res = await leadsApi.sendManualMessage(lead.id, message.trim())
                    setLead(res.data.lead)
                    setMessage('')
                  } catch (err) {
                    setSendError(err.response?.data?.message || 'Failed to send message')
                  } finally {
                    setSending(false)
                  }
                }} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message to customer..."
                    className="input-base"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" disabled={sending || !message.trim()}>
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Message will be sent via Twilio to customer's phone
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Simulate Customer Reply (Testing Only)
                </p>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type customer message to test Pablo..."
                    className="input-base"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" disabled={sending || !message.trim()}>
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Pablo will respond automatically
                </p>
              </>
            )}
            {sendError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{sendError}</p>}
          </div>
        </div>

        {/* Right column: Human intervention (if any) then customer info + buying signals */}
        <div>
          {lead.priority && lead.priorityReasons?.length > 0 ? (
            <div style={{ padding: 16, marginBottom: 20, background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #EF4444', borderRadius: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertCircle size={14} /> Human Intervention Needed
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {lead.priorityReasons.map((r, i) => (
                  <span key={i} style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: 4 }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <Section title="Customer Info">
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <InfoRow label="Phone" value={lead.phone} icon={Phone} />
              <InfoRow label="Email" value={lead.email} icon={Mail} />
              <InfoRow label="Bike Interest" value={lead.bikeInterest} icon={() => <span>🏍️</span>} />
            </div>
          </Section>

          {lead.buyingSignals?.length > 0 && (
            <Section title="Buying Signals">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lead.buyingSignals.map((sig, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 99,
                    background: 'var(--bg-tag)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}>
                    <span style={{ opacity: 0.6, marginRight: 4 }}>{sig.category}:</span>{sig.signal}
                  </span>
                ))}
              </div>
            </Section>
          )}

        </div>
      </main>
    </div>
  )
}