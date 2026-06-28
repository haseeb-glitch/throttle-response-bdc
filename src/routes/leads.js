const express = require('express');
const router = express.Router();

// In-memory leads store (Supabase se replace hoga baad mein)
let leads = [];

// Get all leads
router.get('/', (req, res) => {
  res.json({ success: true, leads });
});

// Add new lead manually
router.post('/', (req, res) => {
  const { name, phone, email, bikeInterest } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone required' });
  }

  const lead = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || null,
    bikeInterest: bikeInterest || null,
    score: 0,
    priority: false,
    buyingSignals: [],
    lastAiAction: null,
    nextFollowUp: null,
    conversation: [],
    createdAt: new Date().toISOString()
  };

  leads.push(lead);
  res.json({ success: true, lead });
});

// Get single lead
router.get('/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, lead });
});

module.exports = router;