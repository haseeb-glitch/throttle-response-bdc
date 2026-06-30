const express = require('express');
module.exports = function (appointments, leads) {
  const router = express.Router();
  // GET all appointments
  router.get('/', (req, res) => {
    const enriched = appointments.map(a => {
      const lead = leads.data.find(l => l.id === a.leadId);
      return { ...a, leadName: lead?.name || a.leadName || 'Unknown' };
    });
    enriched.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    res.json({ success: true, appointments: enriched });
  });
  // POST create appointment
  router.post('/', (req, res) => {
    const { leadId, leadName, date, time, notes, status } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'date and time are required' });
    }
    const appointment = {
      id: Date.now().toString(),
      leadId: leadId || null,
      leadName: leadName || 'Walk-in',
      date,
      time,
      notes: notes || '',
      status: status || 'scheduled',
      createdAt: new Date().toISOString()
    };
    appointments.push(appointment);
    res.json({ success: true, appointment });
  });
  // PATCH update appointment
  router.patch('/:id', (req, res) => {
    const appt = appointments.find(a => a.id === req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    const { status, notes, date, time, leadName } = req.body;
    if (status   !== undefined) appt.status   = status;
    if (notes    !== undefined) appt.notes    = notes;
    if (date     !== undefined) appt.date     = date;
    if (time     !== undefined) appt.time     = time;
    if (leadName !== undefined) appt.leadName = leadName;
    res.json({ success: true, appointment: appt });
  });
  // DELETE appointment
  router.delete('/:id', (req, res) => {
    const idx = appointments.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });
    appointments.splice(idx, 1);
    res.json({ success: true });
  });
  return router;
};