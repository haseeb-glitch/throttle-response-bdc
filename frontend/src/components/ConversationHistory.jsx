import { formatTime } from '../utils/helpers'

export default function ConversationHistory({ conversation = [] }) {
  if (!conversation.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No messages yet</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
      {conversation.map((msg, i) => {
        const isUser = msg.role === 'user'
        return (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row' : 'row-reverse', alignItems: 'flex-end' }}>
            {/* Avatar */}
            <div style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
              background: isUser ? 'rgba(99,102,241,0.12)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: isUser ? '#6366F1' : '#fff',
            }}>
              {isUser ? 'C' : 'J'}
            </div>

            <div style={{ maxWidth: '75%' }}>
              <div className={isUser ? 'bubble-customer' : 'bubble-jake'} style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.55 }}>
                {msg.content}
              </div>
              <p style={{
                fontSize: 11, color: 'var(--text-muted)', marginTop: 4,
                textAlign: isUser ? 'left' : 'right'
              }}>
                {isUser ? 'Customer' : '⚡ Jake'} · {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
