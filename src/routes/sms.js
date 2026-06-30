const express = require('express');
const router = express.Router();
const { parseTwilioWebhook, sendSMS } = require('../services/sms');
const { generateResponse, shouldRespond } = require('../services/ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');
const db = require('../services/database');

// Twilio webhook — jab customer SMS kare
router.post('/incoming', async (req, res) => {
  try {
    const { from, message } = parseTwilioWebhook(req.body);

    console.log(`📩 Incoming SMS from ${from}: ${message}`);

    const cleanPhone = from.replace('+1', '');
    const lead = await db.getLeadByPhone(cleanPhone);

    if (!lead) {
      console.log(`⚠️ No lead found for ${from}`);
      res.set('Content-Type', 'text/xml');
      return res.send('<Response></Response>');
    }

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

      await db.updateLead(lead.id, lead);
      await sendSMS(from, aiResponse);
    }

    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  }
});

module.exports = { router };