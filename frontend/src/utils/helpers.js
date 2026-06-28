/**
 * Returns score style info for a 0–99 buying probability score.
 */
export function getScoreStyle(score) {
  if (score >= 90) return { bg: '#22C55E', text: '#fff', label: 'Elite Buyer',        cls: 'score-elite'    }
  if (score >= 75) return { bg: '#EF4444', text: '#fff', label: 'High Probability',   cls: 'score-high'     }
  if (score >= 60) return { bg: '#F97316', text: '#fff', label: 'Strong Buyer',       cls: 'score-strong'   }
  if (score >= 40) return { bg: '#EAB308', text: '#000', label: 'Qualified Prospect', cls: 'score-prospect' }
  if (score >= 20) return { bg: '#3B82F6', text: '#fff', label: 'Casual Shopper',     cls: 'score-casual'   }
  return            { bg: '#94A3B8', text: '#fff', label: 'Very Low',           cls: 'score-low'      }
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
  Transaction: { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
  Timeline:    { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', color: '#F97316' },
  Product:     { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.25)', color: '#6366F1' },
  Engagement:  { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.25)', color: '#A855F7' },
}
