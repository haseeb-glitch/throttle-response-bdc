import { useState } from 'react'
import { leadsApi } from '../api/leads'
import { X, AlertCircle } from 'lucide-react'

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
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
    }}>
      <div className="card anim-fade-up" style={{ width: '100%', maxWidth: 440, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Add New Lead</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'name', label: 'Customer Name *', placeholder: 'Mike Johnson', type: 'text' },
            { name: 'phone', label: 'Phone Number *', placeholder: '4045551234', type: 'tel' },
            { name: 'email', label: 'Email', placeholder: 'mike@example.com', type: 'email' },
            { name: 'bikeInterest', label: 'Bike of Interest', placeholder: '2024 Street Glide', type: 'text' },
          ].map(f => (
            <div key={f.name}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {f.label}
              </label>
              <input
                type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder} className="input-base"
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Initial Message (optional)
            </label>
            <textarea
              name="initialMessage" value={form.initialMessage} onChange={handleChange}
              placeholder="Customer's first message or lead note..." rows={3}
              className="input-base" style={{ resize: 'none' }}
            />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', color: '#111827', borderLeft: '3px solid #EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="#EF4444" />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', borderRadius: 6 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', borderRadius: 6 }}>
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
