import { useState, useEffect } from 'react'
import { settingsApi } from '../api/settings'
import { Settings as SettingsIcon, Building2, User, Clock, Radio, CheckCircle, AlertCircle, Save } from 'lucide-react'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #F3F4F6' }}>
        <Icon size={16} color="#6B7280" strokeWidth={1.75} />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  )
}

const TONE_OPTIONS = [
  { value: 'casual',       label: 'Casual',       desc: 'Relaxed, rider-to-rider. Like Jake texting a buddy about bikes.' },
  { value: 'professional', label: 'Professional',  desc: 'Polished and confident. Still warm, but more formal.' },
  { value: 'high-energy',  label: 'High-Energy',   desc: 'Enthusiastic, urgent, always closing. Great for hot leads.' },
]

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    settingsApi.get()
      .then(res => setSettings(res.data.settings))
      .catch(() => setError('Could not load settings. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const update = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await settingsApi.update({
        dealership:     settings.dealership,
        persona:        settings.persona,
        operatingHours: settings.operatingHours,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#111827', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (!settings) return (
    <div style={{ padding: 40, color: '#EF4444', fontSize: 14 }}>{error}</div>
  )

  const { dealership, persona, operatingHours, twilio } = settings

  return (
    <div style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Configure Jake's persona and dealership details</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={14} /> Saved
            </span>
          )}
          {error && (
            <span style={{ fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {error}
            </span>
          )}
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Dealership Info */}
      <Section title="Dealership Information" icon={Building2}>
        <Field label="Dealership Name">
          <input
            className="input-base" style={{ width: '100%' }}
            value={dealership.name}
            onChange={e => update('dealership', 'name', e.target.value)}
          />
        </Field>
        <Field label="Phone Number">
          <input
            className="input-base" style={{ width: '100%' }}
            value={dealership.phone}
            onChange={e => update('dealership', 'phone', e.target.value)}
          />
        </Field>
        <Field label="Website">
          <input
            className="input-base" style={{ width: '100%' }}
            value={dealership.website}
            onChange={e => update('dealership', 'website', e.target.value)}
          />
        </Field>
        <Field label="Location">
          <input
            className="input-base" style={{ width: '100%' }}
            value={dealership.location}
            onChange={e => update('dealership', 'location', e.target.value)}
          />
        </Field>
      </Section>

      {/* Jake Persona */}
      <Section title="Jake's Persona" icon={User}>
        <Field label="Agent Name" hint="The name Jake uses when texting leads.">
          <input
            className="input-base" style={{ width: '100%' }}
            value={persona.agentName}
            onChange={e => update('persona', 'agentName', e.target.value)}
          />
        </Field>
        <Field label="Tone" hint="Adjusts how Jake communicates. Casual is the default.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TONE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: 14, borderRadius: 8, cursor: 'pointer',
                  border: persona.tone === opt.value ? '1.5px solid #111827' : '1px solid #E5E7EB',
                  background: persona.tone === opt.value ? '#F9FAFB' : '#fff',
                  transition: 'all 0.1s'
                }}
              >
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={persona.tone === opt.value}
                  onChange={() => update('persona', 'tone', opt.value)}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{opt.label}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.desc}</p>
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
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Start</p>
              <input
                type="number" min={0} max={23}
                className="input-base" style={{ width: '100%' }}
                value={operatingHours.startHour}
                onChange={e => update('operatingHours', 'startHour', Number(e.target.value))}
              />
            </div>
            <span style={{ color: '#9CA3AF', marginTop: 16, fontSize: 18 }}>–</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>End</p>
              <input
                type="number" min={0} max={23}
                className="input-base" style={{ width: '100%' }}
                value={operatingHours.endHour}
                onChange={e => update('operatingHours', 'endHour', Number(e.target.value))}
              />
            </div>
            <div style={{ flex: 2 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Timezone</p>
              <input
                className="input-base" style={{ width: '100%' }}
                value={operatingHours.timezone}
                readOnly
                style={{ background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed', width: '100%' }}
              />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
            Currently set to {operatingHours.startHour}:00 – {operatingHours.endHour}:00 {operatingHours.timezone}
          </p>
        </Field>
      </Section>

      {/* Twilio / SMS Status */}
      <Section title="SMS / Twilio" icon={Radio}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: twilio.enabled ? '#ECFDF5' : '#F9FAFB', border: `1px solid ${twilio.enabled ? '#6EE7B7' : '#E5E7EB'}`, borderRadius: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: twilio.enabled ? '#10B981' : '#D1D5DB',
            boxShadow: twilio.enabled ? '0 0 0 3px #D1FAE5' : 'none'
          }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
              {twilio.enabled ? 'Twilio Connected — Live SMS Active' : 'Mock Mode — SMS printed to console only'}
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {twilio.enabled
                ? 'Real text messages are being sent to leads.'
                : 'Set TWILIO_ENABLED=true in your .env to activate live SMS.'}
            </p>
          </div>
        </div>
        {!twilio.enabled && (
          <div style={{ marginTop: 16, padding: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Required .env variables:</p>
            <pre style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.8, margin: 0 }}>
{`TWILIO_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx`}
            </pre>
          </div>
        )}
      </Section>
    </div>
  )
}
