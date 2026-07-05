const db = require('./database');

// Appointment confirm hone ke keywords
const APPOINTMENT_SIGNALS = [
  'see you', 'see ya', 'come in', 'stop by', 'come by',
  'scheduled for', 'appointment is set', 'appointment is confirmed',
  'all set', 'you\'re all set', 'we\'re set',
  'looking forward to seeing you', 'can\'t wait to see you',
  'we\'ll see you', 'i\'ll see you'
];

// Time patterns
const TIME_PATTERNS = [
  /(\d{1,2})\s*(?::|\.)\s*(\d{2})\s*(am|pm)/i,
  /(\d{1,2})\s*(am|pm)/i,
  /(\d{1,2})\s*o'?clock/i,
];

const DAY_MAP = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0
};

function extractTime(text) {
  for (const pattern of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = match[2] && match[2].length === 2 ? match[2] : '00';
      const ampm = match[match.length - 1]?.toLowerCase();

      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;

      return `${String(hour).padStart(2, '0')}:${minute}`;
    }
  }
  return null;
}

function extractDate(text) {
  const today = new Date();
  const lowerText = text.toLowerCase();

  if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (lowerText.includes('today')) {
    return today.toISOString().split('T')[0];
  }

  // Direct weekday mention — "Thursday", "Friday" etc (with or without "this/next")
  const weekdayMatch = lowerText.match(
    /(?:this\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  );
  if (weekdayMatch) {
    const dayName = weekdayMatch[1].toLowerCase();
    const targetDay = DAY_MAP[dayName];
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    if (lowerText.includes('next')) daysUntil += 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0];
  }

  // MM/DD or MM-DD
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch) {
    const month = String(parseInt(dateMatch[1])).padStart(2, '0');
    const day = String(parseInt(dateMatch[2])).padStart(2, '0');
    const year = dateMatch[3]
      ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3])
      : today.getFullYear();
    return `${year}-${month}-${day}`;
  }

  return null;
}

function hasAppointmentSignal(text) {
  const lower = text.toLowerCase();
  return APPOINTMENT_SIGNALS.some(signal => lower.includes(signal));
}

async function detectAndCreateAppointment(lead, aiResponse) {
  try {
    if (!hasAppointmentSignal(aiResponse)) return null;

    const date = extractDate(aiResponse);
    const time = extractTime(aiResponse);

    if (!date && !time) return null;

    // Check karo ke same lead ki same date pe appointment already exist to nahi
    const existing = await db.getAllAppointments();
    const duplicate = existing.find(a =>
      a.lead_id === lead.id &&
      a.date === date &&
      a.status !== 'cancelled'
    );

    if (duplicate) {
      console.log(`📅 Appointment already exists for ${lead.name} on ${date}`);
      return null;
    }

    const appointment = {
      id: Date.now().toString(),
      leadId: lead.id,
      leadName: lead.name,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00',
      notes: `Auto-detected from Pablo conversation. Bike: ${lead.bikeInterest || 'Not specified'}`,
      status: 'scheduled'
    };

    const saved = await db.createAppointment(appointment);
    console.log(`📅 Appointment auto-created for ${lead.name} on ${appointment.date} at ${appointment.time}`);
    return saved;

  } catch (err) {
    console.error('Appointment detection error:', err.message);
    return null;
  }
}

module.exports = { detectAndCreateAppointment };