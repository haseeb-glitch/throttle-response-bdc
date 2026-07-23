const { createClient } = require('@supabase/supabase-js');
const { normalizePhone } = require('./phone');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Lead ko Supabase format mein convert karo
function toDbFormat(lead) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    bike_interest: lead.bikeInterest,
    score: lead.score,
    score_color: lead.scoreColor,
    priority: lead.priority,
    priority_reasons: lead.priorityReasons,
    buying_signals: lead.buyingSignals,
    score_breakdown: lead.scoreBreakdown,
    last_ai_action: lead.lastAiAction,
    next_follow_up: lead.nextFollowUp,
    manual_takeover: lead.manualTakeover,
    followup_3hr_sent: lead.followup3hrSent,
    followup_5hr_sent: lead.followup5hrSent,
    conversation: lead.conversation,
    created_at: lead.createdAt,
    last_contact_time: lead.lastContactTime,
    followup_day2_count: lead.followupDay2Count || 0,
    followup_day3_sent: lead.followupDay3Sent || false,
    followup_day5_sent: lead.followupDay5Sent || false,
    followup_day7_sent: lead.followupDay7Sent || false,
    nurture_mode: lead.nurtureMode || false,
    last_followup_date: lead.lastFollowupDate || null,
    stock_number: lead.stockNumber || null,
    vin: lead.vin || null,
    model_code: lead.modelCode || null,
  };
}

// Supabase row ko app format mein convert karo
function fromDbFormat(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    bikeInterest: row.bike_interest,
    score: row.score,
    scoreColor: row.score_color,
    priority: row.priority,
    priorityReasons: row.priority_reasons,
    buyingSignals: row.buying_signals,
    scoreBreakdown: row.score_breakdown,
    lastAiAction: row.last_ai_action,
    nextFollowUp: row.next_follow_up,
    manualTakeover: row.manual_takeover,
    followup3hrSent: row.followup_3hr_sent,
    followup5hrSent: row.followup_5hr_sent,
    conversation: row.conversation,
    createdAt: row.created_at,
    lastContactTime: row.last_contact_time,
    followupDay2Count: row.followup_day2_count,
    followupDay3Sent: row.followup_day3_sent,
    followupDay5Sent: row.followup_day5_sent,
    followupDay7Sent: row.followup_day7_sent,
    nurtureMode: row.nurture_mode,
    lastFollowupDate: row.last_followup_date,
    stockNumber: row.stock_number,
    vin: row.vin,
    modelCode: row.model_code,
  };
}

async function createLead(lead) {
  const normalizedLead = { ...lead, phone: normalizePhone(lead.phone) };
  const { data, error } = await supabase
    .from('leads')
    .insert([toDbFormat(normalizedLead)])
    .select()
    .single();

  if (error) throw error;
  return fromDbFormat(data);
}

async function getAllLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false });

  if (error) throw error;
  return data.map(fromDbFormat);
}

async function getLeadById(id) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return fromDbFormat(data);
}

async function getLeadByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const candidates = [normalizedPhone];
  if (normalizedPhone.length === 10) {
    candidates.push(`1${normalizedPhone}`);
    candidates.push(`+1${normalizedPhone}`);
  } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
    candidates.push(normalizedPhone.slice(1));
    candidates.push(`+${normalizedPhone}`);
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .in('phone', candidates)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return fromDbFormat(data[0]);
}

async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from('leads')
    .update(toDbFormat({ id, ...updates }))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromDbFormat(data);
}

async function deleteLead(id) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

async function createAppointment(appointment) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      id: appointment.id,
      lead_id: appointment.leadId,
      lead_name: appointment.leadName,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAllAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function updateAppointment(id, updates) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteAppointment(id) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadByPhone,
  updateLead,
  deleteLead,
  createAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment
};
