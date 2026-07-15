import { useState } from 'react'

export default function OptIn() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    bikeInterest: '',
    smsConsent: false
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.phone || form.phone.length < 10) {
      setError('Please enter a valid phone number.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', background: '#fff', borderRadius: 12, padding: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Thank you, {form.firstName}!</h2>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
            Your inquiry has been received. A member of our team from Falcons Fury Harley-Davidson will be in touch shortly via SMS.
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 16 }}>
            Reply <strong>STOP</strong> at any time to opt out of SMS messages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>T</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>ThrottleResponseBDC</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Contact Falcons Fury Harley-Davidson</h1>
          <p style={{ fontSize: 15, color: '#6B7280' }}>Fill out the form below and a specialist will reach out via SMS.</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>First Name *</label>
                <input
                  type="text" required
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="John"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Last Name *</label>
                <input
                  type="text" required
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Smith"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Phone Number *</label>
              <input
                type="tel" required
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(404) 555-1234"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="john@example.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Bike Interest */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Motorcycle of Interest</label>
              <input
                type="text"
                value={form.bikeInterest}
                onChange={e => set('bikeInterest', e.target.value)}
                placeholder="e.g. 2026 Street Glide, Fat Boy..."
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Links */}
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: -8 }}>
              By submitting this form you agree to our{' '}
              <a href="/privacy-policy" target="_blank" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms-and-conditions" target="_blank" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>Terms & Conditions</a>.
            </p>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: 13, borderRadius: 6 }}>
                {error}
              </div>
            )}

            {/* Submit button - works WITHOUT SMS consent */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '13px 18px',
                background: '#F97316', color: '#fff',
                fontWeight: 600, fontSize: 15,
                border: 'none', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Submit Inquiry
            </button>

            {/* SMS Consent - CLEARLY OPTIONAL, AFTER submit button explanation */}
            <div style={{ marginTop: 8, padding: 16, background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                📱 Optional: Receive SMS Updates
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.smsConsent}
                  onChange={e => set('smsConsent', e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#F97316' }}
                />
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  <strong>(Optional)</strong> I agree to receive SMS text messages from Falcons Fury Harley-Davidson regarding my inquiry. Message frequency varies. Msg & data rates may apply. Reply <strong>STOP</strong> to opt out. Reply <strong>HELP</strong> for help. <strong>This is completely optional and not required to submit your inquiry.</strong> Mobile phone numbers and SMS consent are not shared with third parties or affiliates for marketing purposes.
                </span>
              </label>
            </div>

          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <a href="/privacy-policy" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms-and-conditions" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Terms & Conditions</a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          © 2026 ThrottleResponseBDC — Falcons Fury Harley-Davidson
        </p>
      </div>
    </div>
  )
}