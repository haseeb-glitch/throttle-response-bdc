const express = require('express');
const { generateResponse, shouldRespond, getFirstResponseDelay } = require('../services/ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');
const { sendSMS, sendDelayedSMS } = require('../services/sms');
const db = require('../services/database');

const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await db.getAllLeads();
    res.json({ success: true, leads });
  } catch (err) {
    console.error('Get leads error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
});

// Add new lead
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, bikeInterest, initialMessage } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone required' });
    }

    let lead = {
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

    if (initialMessage) {
      lead.conversation.push({
        role: 'user',
        content: initialMessage,
        timestamp: new Date().toISOString()
      });

      const canRespond = await shouldRespond();

      if (canRespond) {
        try {
          const delay = await getFirstResponseDelay();
          const aiResponse = await generateResponse(lead.conversation, lead);

          lead.conversation.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          });

          lead.lastAiAction = aiResponse;
          lead.lastContactTime = new Date().toISOString();

          const scoreResult = calculateScore(lead.conversation, lead);
          lead.score = scoreResult.score;
          lead.scoreColor = getScoreColor(scoreResult.score);
          lead.buyingSignals = scoreResult.signals;
          lead.scoreBreakdown = scoreResult.breakdown;

          const priorityResult = checkPriorityFlag(lead.conversation);
          lead.priority = priorityResult.isPriority;
          lead.priorityReasons = priorityResult.reasons;

          sendDelayedSMS(lead.phone, aiResponse, delay);

        } catch (err) {
          console.error('AI response error:', err.message);
        }
      } else {
        lead.lastAiAction = 'Outside operating hours — response scheduled for 10:00 AM';
        lead.nextFollowUp = '10:00 AM next morning';
      }
    }

    const savedLead = await db.createLead(lead);
    res.json({ success: true, lead: savedLead });

  } catch (err) {
    console.error('Create lead error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch lead' });
  }
});

// Customer ne reply kiya
router.post('/:id/message', async (req, res) => {
  try {
    const lead = await db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    lead.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    const canRespond = await shouldRespond();

    if (canRespond) {
      const aiResponse = await generateResponse(lead.conversation, lead);

      lead.conversation.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      lead.lastAiAction = aiResponse;
      lead.lastContactTime = new Date().toISOString();

      const scoreResult = calculateScore(lead.conversation, lead);
      lead.score = scoreResult.score;
      lead.scoreColor = getScoreColor(scoreResult.score);
      lead.buyingSignals = scoreResult.signals;
      lead.scoreBreakdown = scoreResult.breakdown;

      const priorityResult = checkPriorityFlag(lead.conversation);
      lead.priority = priorityResult.isPriority;
      lead.priorityReasons = priorityResult.reasons;

      await sendSMS(lead.phone, aiResponse);

      const updatedLead = await db.updateLead(lead.id, lead);
      res.json({ success: true, aiResponse, lead: updatedLead });

    } else {
      res.json({
        success: true,
        aiResponse: null,
        message: 'Outside operating hours',
        lead
      });
    }

  } catch (err) {
    console.error('Message error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
});

module.exports = router;