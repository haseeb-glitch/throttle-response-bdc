import { useState, useEffect, useCallback } from 'react'
import { appointmentsApi } from '../api/appointments'
import { leadsApi } from '../api/leads'
import { Calendar, Plus, X, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const STATUS_STYLES = {
  scheduled: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Scheduled' },
  confirmed: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Confirmed' },
  completed: { color: 'var(--text-muted)', bg: 'var(--bg-tag)', label: 'Completed' },
  cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Cancelled' },
}

function Modal({ onClose, leads, onSaved }) {
  const [form, setForm] = useState({ leadId: '', leadName: '', date: '', time: '', notes: '', status: 'scheduled' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLeadChange = (e) => {
    const leadId = e.target.value
    const lead = leads.find(l => l.id === leadId)
    set('leadId', leadId)
    if (lead) set('leadName', lead.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time) return
    setSaving(true)
    try {
      const res = await appointmentsApi.create({ ...form, leadName: form.leadName || 'Walk-in' })
      onSaved(res.data.appointment)
      onClose()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>Schedule Appointment</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Lead</label>
            <select value={form.leadId} onChange={handleLeadChange} className="input-base" style={{ width: '100%' }}>
              <option value="">Walk-in / No lead</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.bikeInterest || 'No bike specified'}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date *</label>
              <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className="input-base" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time *</label>
              <input type="time" required value={form.time} onChange={e => set('time', e.target.value)} className="input-base" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Test ride, trade-in, financing discussion..." className="input-base" rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CalendarGrid({ year, month, appointments, onDayClick }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const apptsByDate = {}
  appointments.forEach(a => {
    if (!apptsByDate[a.date]) apptsByDate[a.date] = []
    apptsByDate[a.date].push(a)
  })
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const toISO = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const iso = toISO(day)
          const dayAppts = apptsByDate[iso] || []
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          return (
            <button key={i} onClick={() => onDayClick(iso, day)} style={{
              minHeight: 72, padding: 6, borderRadius: 6,
              border: isToday ? '1.5px solid #F97316' : '1px solid var(--border)',
              background: isToday ? 'rgba(249,115,22,0.08)' : 'var(--bg-card)',
              textAlign: 'left', cursor: 'pointer', transition: 'background 0.1s',
            }}>
              <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#F97316' : 'var(--text-primary)' }}>{day}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                {dayAppts.slice(0, 3).map((a, j) => {
                  const s = STATUS_STYLES[a.status] || STATUS_STYLES.scheduled
                  return (
                    <div key={j} style={{ fontSize: 10, fontWeight: 500, color: s.color, background: s.bg, borderRadius: 3, padding: '1px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.time} {a.leadName}
                    </div>
                  )
                })}
                {dayAppts.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{dayAppts.length - 3} more</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Appointments() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [appointments, setAppointments] = useState([])
  const [leads, setLeads] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [apptRes, leadRes] = await Promise.all([appointmentsApi.getAll(), leadsApi.getAll()])
      setAppointments(apptRes.data.appointments || [])
      setLeads(leadRes.data.leads || [])
    } catch { }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await appointmentsApi.update(id, { status })
      setAppointments(prev => prev.map(a => a.id === id ? res.data.appointment : a))
    } catch { }
  }

  const handleDelete = async (id) => {
    try {
      await appointmentsApi.remove(id)
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch { }
  }

  const upcoming = appointments
    .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 10)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', minWidth: 0, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Appointments</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Schedule and manage in-store visits</p>
              </div>
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus size={16} /> Schedule Appointment
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{MONTH_NAMES[month]} {year}</h2>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={prevMonth} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}><ChevronLeft size={16} /></button>
                    <button onClick={nextMonth} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}><ChevronRight size={16} /></button>
                  </div>
                </div>
                {loading ? (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#F97316', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <CalendarGrid year={year} month={month} appointments={appointments} onDayClick={() => setShowModal(true)} />
                )}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  Upcoming ({upcoming.length})
                </p>
                {upcoming.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>No upcoming appointments.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {upcoming.map(a => {
                      const s = STATUS_STYLES[a.status] || STATUS_STYLES.scheduled
                      return (
                        <div key={a.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.leadName}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={11} /> {a.date} at {a.time}
                              </p>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 99 }}>{s.label}</span>
                          </div>
                          {a.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{a.notes}</p>}
                          <div style={{ display: 'flex', gap: 6 }}>
                            {a.status === 'scheduled' && (
                              <button onClick={() => handleStatusChange(a.id, 'confirmed')} className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={11} /> Confirm
                              </button>
                            )}
                            {a.status !== 'completed' && (
                              <button onClick={() => handleStatusChange(a.id, 'completed')} className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>Done</button>
                            )}
                            <button onClick={() => handleDelete(a.id)} className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px', marginLeft: 'auto', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        {showModal && <Modal onClose={() => setShowModal(false)} leads={leads} onSaved={appt => setAppointments(prev => [...prev, appt])} />}
      </div>
    </div>
  )
}