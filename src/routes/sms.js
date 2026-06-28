const express = require('express');
const router = express.Router();
const { parseTwilioWebhook } = require('../services/sms');
const { generateResponse, shouldRespond } = require('../services/ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');
const { sendSMS } = require('../services/sms');

// Shared leads array — baad mein Supabase se replace hoga
let leadsStore = null;

function setLeadsStore(store) {
  leadsStore = store;
}

// Twilio webhook — jab customer SMS kare
router.post('/incoming', async (req, res) => {
  try {
    const { from, message } = parseTwilioWebhook(req.body);

    console.log(`📩 Incoming SMS from ${from}: ${message}`);

    // Lead dhundo phone number se
    const lead = leadsStore.find(l => l.phone === from.replace('+1', ''));

    if (!lead) {
      console.log(`⚠️ No lead found for ${from}`);
      // TwiML empty response
      res.set('Content-Type', 'text/xml');
      return res.send('<Response></Response>');
    }

    // Customer message conversation mein add karo
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

      // Score update karo
      const scoreResult = calculateScore(lead.conversation, lead);
      lead.score = scoreResult.score;
      lead.scoreColor = getScoreColor(scoreResult.score);
      lead.buyingSignals = scoreResult.signals;
      lead.scoreBreakdown = scoreResult.breakdown;

      // Priority check karo
      const priorityResult = checkPriorityFlag(lead.conversation);
      lead.priority = priorityResult.isPriority;
      lead.priorityReasons = priorityResult.reasons;

      // SMS bhejo
      await sendSMS(from, aiResponse);
    }

    // TwiML response — Twilio ko batao handled ho gaya
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  }
});

module.exports = { router, setLeadsStore };