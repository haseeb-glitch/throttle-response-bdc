import { useState, useEffect } from 'react'
import { settingsApi } from '../api/settings'
import { Building2, User, Clock, Radio, CheckCircle, AlertCircle, Save, Lock } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { authApi } from '../api/leads'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <Icon size={16} color="var(--text-muted)" strokeWidth={1.75} />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  )
}

const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual', desc: 'Relaxed, rider-to-rider. Like Jake texting a buddy about bikes.' },
  { value: 'professional', label: 'Professional', desc: 'Polished and confident. Still warm, but more formal.' },
  { value: 'high-energy', label: 'High-Energy', desc: 'Enthusiastic, urgent, always closing. Great for hot leads.' },
]

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    settingsApi.get()
      .then(res => setSettings(res.data.settings))
      .catch(() => setError('Could not load settings. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const update = (section, key, value) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await settingsApi.update({ dealership: settings.dealership, persona: settings.persona, operatingHours: settings.operatingHours })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError('Failed to save settings.') }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' }); return }
    setPwSaving(true)
    setPwMsg(null)
    try {
      await authApi.changePassword(oldPassword, newPassword)
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    } finally { setPwSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#F97316', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  )

  if (!settings) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 40, color: '#EF4444', fontSize: 14 }}>{error}</div>
    </div>
  )

  const { dealership, persona, operatingHours, twilio } = settings

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', minWidth: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Configure Jake's persona and dealership details</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {saved && <span style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Saved</span>}
              {error && <span style={{ fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> {error}</span>}
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Dealership Info */}
          <Section title="Dealership Information" icon={Building2}>
            <Field label="Dealership Name">
              <input className="input-base" style={{ width: '100%' }} value={dealership.name} onChange={e => update('dealership', 'name', e.target.value)} />
            </Field>
            <Field label="Phone Number">
              <input className="input-base" style={{ width: '100%' }} value={dealership.phone} onChange={e => update('dealership', 'phone', e.target.value)} />
            </Field>
            <Field label="Website">
              <input className="input-base" style={{ width: '100%' }} value={dealership.website} onChange={e => update('dealership', 'website', e.target.value)} />
            </Field>
            <Field label="Location">
              <input className="input-base" style={{ width: '100%' }} value={dealership.location} onChange={e => update('dealership', 'location', e.target.value)} />
            </Field>
          </Section>

          {/* Jake Persona */}
          <Section title="Jake's Persona" icon={User}>
            <Field label="Agent Name" hint="The name Jake uses when texting leads.">
              <input className="input-base" style={{ width: '100%' }} value={persona.agentName} onChange={e => update('persona', 'agentName', e.target.value)} />
            </Field>
            <Field label="Tone" hint="Adjusts how Jake communicates. Casual is the default.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TONE_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 8, cursor: 'pointer',
                    border: persona.tone === opt.value ? '1.5px solid #F97316' : '1px solid var(--border)',
                    background: persona.tone === opt.value ? 'rgba(249,115,22,0.08)' : 'var(--bg-card)',
                    transition: 'all 0.1s'
                  }}>
                    <input type="radio" name="tone" value={opt.value} checked={persona.tone === opt.value} onChange={() => update('persona', 'tone', opt.value)} style={{ marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          {/* Operating Hours */}
          <Section title="Operating Hours" icon={Clock}>
            <Field label="Active Hours" hint="Jake only sends messages during these hours (Eastern Time).">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start</p>
                  <input type="number" min={0} max={23} className="input-base" style={{ width: '100%' }} value={operatingHours.startHour} onChange={e => update('operatingHours', 'startHour', Number(e.target.value))} />
                </div>
                <span style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 18 }}>–</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>End</p>
                  <input type="number" min={0} max={23} className="input-base" style={{ width: '100%' }} value={operatingHours.endHour} onChange={e => update('operatingHours', 'endHour', Number(e.target.value))} />
                </div>
                <div style={{ flex: 2 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Timezone</p>
                  <input className="input-base" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} value={operatingHours.timezone} readOnly />
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Currently set to {operatingHours.startHour}:00 – {operatingHours.endHour}:00 {operatingHours.timezone}
              </p>
            </Field>
          </Section>

          {/* Twilio Status */}
          <Section title="SMS / Twilio" icon={Radio}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: twilio.enabled ? 'rgba(16,185,129,0.1)' : 'var(--bg-tag)', border: `1px solid ${twilio.enabled ? '#6EE7B7' : 'var(--border)'}`, borderRadius: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: twilio.enabled ? '#10B981' : 'var(--text-muted)', boxShadow: twilio.enabled ? '0 0 0 3px rgba(16,185,129,0.25)' : 'none' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {twilio.enabled ? 'Twilio Connected — Live SMS Active' : 'Mock Mode — SMS printed to console only'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {twilio.enabled ? 'Real text messages are being sent to leads.' : 'Set TWILIO_ENABLED=true in your .env to activate live SMS.'}
                </p>
              </div>
            </div>
          </Section>

          {/* Change Password */}
          <Section title="Change Password" icon={Lock}>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Current Password">
                <input type="password" className="input-base" style={{ width: '100%' }} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Enter current password" required />
              </Field>
              <Field label="New Password" hint="Minimum 8 characters.">
                <input type="password" className="input-base" style={{ width: '100%' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required />
              </Field>
              {pwMsg && (
                <div style={{ padding: '10px 14px', background: pwMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : '#FEF2F2', border: `1px solid ${pwMsg.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`, color: pwMsg.type === 'success' ? '#10B981' : '#EF4444', fontSize: 13, borderRadius: 6 }}>
                  {pwMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={pwSaving}>
                  <Lock size={14} /> {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </Section>

        </div>
      </main>
    </div>
  )
}