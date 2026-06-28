const express = require('express');
const { generateResponse, shouldRespond, getFirstResponseDelay } = require('../services/ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');
const { sendSMS, sendDelayedSMS } = require('../services/sms');

module.exports = function(leads) {
  const router = express.Router();

  // Get all leads
  router.get('/', (req, res) => {
    const leadsWithColor = leads.map(lead => ({
      ...lead,
      scoreColor: getScoreColor(lead.score)
    }));
    res.json({ success: true, leads: leadsWithColor });
  });

  // Add new lead
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

          // Score calculate karo
          const scoreResult = calculateScore(lead.conversation, lead);
          lead.score = scoreResult.score;
          lead.scoreColor = getScoreColor(scoreResult.score);
          lead.buyingSignals = scoreResult.signals;
          lead.scoreBreakdown = scoreResult.breakdown;

          // Priority check karo
          const priorityResult = checkPriorityFlag(lead.conversation);
          lead.priority = priorityResult.isPriority;
          lead.priorityReasons = priorityResult.reasons;

          // SMS bhejo — mock ya real
          await sendDelayedSMS(lead.phone, aiResponse, delay);

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

  // Customer ne reply kiya
  router.post('/:id/message', async (req, res) => {
    const lead = leads.find(l => l.id === req.params.id);
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
      try {
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

        // SMS bhejo
        await sendSMS(lead.phone, aiResponse);

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

  return router;
};