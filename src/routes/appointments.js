const express = require('express');
const db = require('../services/database');

module.exports = function (appointments, leads) {
  const router = express.Router();

  // GET all appointments
  router.get('/', async (req, res) => {
    try {
      const data = await db.getAllAppointments();
      // Enrich with lead name
      const enriched = data.map(a => ({
        id: a.id,
        leadId: a.lead_id,
        leadName: a.lead_name,
        date: a.date,
        time: a.time,
        notes: a.notes,
        status: a.status,
        createdAt: a.created_at
      }));
      enriched.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      res.json({ success: true, appointments: enriched });
    } catch (err) {
      console.error('Get appointments error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
    }
  });

  // POST create appointment
  router.post('/', async (req, res) => {
    try {
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
        status: status || 'scheduled'
      };

      const saved = await db.createAppointment(appointment);
      res.json({ success: true, appointment: {
        id: saved.id,
        leadId: saved.lead_id,
        leadName: saved.lead_name,
        date: saved.date,
        time: saved.time,
        notes: saved.notes,
        status: saved.status,
        createdAt: saved.created_at
      }});
    } catch (err) {
      console.error('Create appointment error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to create appointment' });
    }
  });

  // PATCH update appointment
  router.patch('/:id', async (req, res) => {
    try {
      const { status, notes, date, time, leadName } = req.body;
      const updates = {};
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      if (date !== undefined) updates.date = date;
      if (time !== undefined) updates.time = time;
      if (leadName !== undefined) updates.lead_name = leadName;

      const updated = await db.updateAppointment(req.params.id, updates);
      res.json({ success: true, appointment: {
        id: updated.id,
        leadId: updated.lead_id,
        leadName: updated.lead_name,
        date: updated.date,
        time: updated.time,
        notes: updated.notes,
        status: updated.status
      }});
    } catch (err) {
      console.error('Update appointment error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update appointment' });
    }
  });

  // DELETE appointment
  router.delete('/:id', async (req, res) => {
    try {
      await db.deleteAppointment(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('Delete appointment error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to delete appointment' });
    }
  });

  return router;
};