/**
 * Returns score style info for a 0–99 buying probability score.
 */
export function getScoreStyle(score) {
  if (score >= 75) return { color: '#10B981', border: '#10B981', label: 'High Probability',   cls: 'score-high'     }
  if (score >= 60) return { color: '#10B981', border: '#10B981', label: 'Strong Buyer',       cls: 'score-strong'   }
  if (score >= 40) return { color: '#F59E0B', border: '#F59E0B', label: 'Qualified Prospect', cls: 'score-prospect' }
  if (score >= 20) return { color: '#6B7280', border: '#6B7280', label: 'Casual Shopper',     cls: 'score-casual'   }
  return            { color: '#6B7280', border: '#6B7280', label: 'Very Low',           cls: 'score-low'      }
}

/** Relative time string */
export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (s < 60)  return 'Just now'
  if (m < 60)  return `${m}m ago`
  if (h < 24)  return `${h}h ago`
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}

/** Clock time */
export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Buying-signal category pill styles */
export const catStyle = {
  Transaction: { color: '#6B7280', border: '#D1D5DB' },
  Timeline:    { color: '#6B7280', border: '#D1D5DB' },
  Product:     { color: '#6B7280', border: '#D1D5DB' },
  Engagement:  { color: '#6B7280', border: '#D1D5DB' },
}
