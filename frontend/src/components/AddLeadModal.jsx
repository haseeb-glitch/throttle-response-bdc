import { useState } from 'react'
import { leadsApi } from '../api/leads'

export default function AddLeadModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', bikeInterest: '', initialMessage: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      setError('Name and phone are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await leadsApi.create(form)
      onAdded(res.data.lead)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
    }}>
      <div className="card anim-fade-up" style={{ width: '100%', maxWidth: 440, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Add New Lead</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--text-muted)'
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'name', label: 'Customer Name *', placeholder: 'Mike Johnson', type: 'text' },
            { name: 'phone', label: 'Phone Number *', placeholder: '4045551234', type: 'tel' },
            { name: 'email', label: 'Email', placeholder: 'mike@example.com', type: 'email' },
            { name: 'bikeInterest', label: 'Bike of Interest', placeholder: '2024 Street Glide', type: 'text' },
          ].map(f => (
            <div key={f.name}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {f.label}
              </label>
              <input
                type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder} className="input-base"
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Initial Message (optional)
            </label>
            <textarea
              name="initialMessage" value={form.initialMessage} onChange={handleChange}
              placeholder="Customer's first message or lead note..." rows={3}
              className="input-base" style={{ resize: 'none' }}
            />
          </div>

          {error && (
            <p style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', fontSize: 13 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
