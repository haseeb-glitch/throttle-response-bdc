const express = require('express');
const router = express.Router();
const { generateResponse, shouldRespond, getFirstResponseDelay } = require('../services/ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');

// In-memory store (Supabase se replace hoga baad mein)
let leads = [];

// Get all leads
router.get('/', (req, res) => {
  const leadsWithColor = leads.map(lead => ({
    ...lead,
    scoreColor: getScoreColor(lead.score)
  }));
  res.json({ success: true, leads: leadsWithColor });
});

// Add new lead manually
router.post('/', async (req, res) => {
  const { name, phone, email, bikeInterest, initialMessage } = req.body;

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
    scoreColor: getScoreColor(0),
    priority: false,
    priorityReasons: [],
    buyingSignals: [],
    scoreBreakdown: {},
    lastAiAction: null,
    nextFollowUp: null,
    conversation: [],
    createdAt: new Date().toISOString(),
    lastContactTime: new Date().toISOString()
  };

  // If initial message exists, add to conversation and process
  if (initialMessage) {
    lead.conversation.push({
      role: 'user',
      content: initialMessage,
      timestamp: new Date().toISOString()
    });

    // Check if AI should respond based on operating hours
    const canRespond = await shouldRespond();

    if (canRespond) {
      try {
        // Delay first response ~3 minutes (in production)
        // For testing we respond immediately, delay logic handled by Twilio queue
        const aiResponse = await generateResponse(lead.conversation, lead);

        lead.conversation.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        });

        lead.lastAiAction = aiResponse;
        lead.lastContactTime = new Date().toISOString();

        // Calculate buying probability score
        const scoreResult = calculateScore(lead.conversation, lead);
        lead.score = scoreResult.score;
        lead.scoreColor = getScoreColor(scoreResult.score);
        lead.buyingSignals = scoreResult.signals;
        lead.scoreBreakdown = scoreResult.breakdown;

        // Check priority flag
        const priorityResult = checkPriorityFlag(lead.conversation);
        lead.priority = priorityResult.isPriority;
        lead.priorityReasons = priorityResult.reasons;

      } catch (err) {
        console.error('AI response error:', err.message);
      }
    } else {
      lead.lastAiAction = 'Outside operating hours — response scheduled for 10:00 AM';
      lead.nextFollowUp = '10:00 AM next morning';
    }
  }

  leads.push(lead);
  res.json({ success: true, lead });
});

// Get single lead
router.get('/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, lead });
});

// Send message to existing lead (customer replied)
router.post('/:id/message', async (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });

  // Add customer message
  lead.conversation.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  const canRespond = await shouldRespond();

  if (canRespond) {
    try {
      const aiResponse = await generateResponse(lead.conversation, lead);

      lead.conversation.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      lead.lastAiAction = aiResponse;
      lead.lastContactTime = new Date().toISOString();

      // Recalculate score
      const scoreResult = calculateScore(lead.conversation, lead);
      lead.score = scoreResult.score;
      lead.scoreColor = getScoreColor(scoreResult.score);
      lead.buyingSignals = scoreResult.signals;
      lead.scoreBreakdown = scoreResult.breakdown;

      // Recheck priority
      const priorityResult = checkPriorityFlag(lead.conversation);
      lead.priority = priorityResult.isPriority;
      lead.priorityReasons = priorityResult.reasons;

      res.json({ success: true, aiResponse, lead });

    } catch (err) {
      console.error('AI response error:', err.message);
      res.status(500).json({ success: false, message: 'AI response failed' });
    }
  } else {
    res.json({
      success: true,
      aiResponse: null,
      message: 'Outside operating hours',
      lead
    });
  }
});

module.exports = router;