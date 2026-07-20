const Imap = require('imap');
const { simpleParser } = require('mailparser');
const db = require('./database');
const { generateResponse, shouldRespond, getFirstResponseDelay } = require('./ai');
const { calculateScore, checkPriorityFlag, getScoreColor } = require('../services/scoring');
const { sendDelayedSMS } = require('./sms');

const IMAP_CONFIG = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_APP_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// eLEads email se lead info extract karo
function parseLeadFromEmail(subject, text, html) {
  const content = text || html || '';
  const lead = {
    name: null,
    phone: null,
    email: null,
    bikeInterest: null,
    initialMessage: null
  };

  // Name extract karo
  const namePatterns = [
    /(?:Customer Name|Name|Contact|From)[\s:]+([A-Za-z\s]+?)(?:\n|<br|Email|Phone)/i,
    /^([A-Za-z]+ [A-Za-z]+)/m
  ];
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match) { lead.name = match[1].trim(); break; }
  }

  // Phone extract karo
  const phonePatterns = [
    /(?:Phone|Cell|Mobile|Tel)[\s:]+([0-9\-\(\)\s\.]{10,})/i,
    /(\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4})/
  ];
  for (const pattern of phonePatterns) {
    const match = content.match(pattern);
    if (match) {
      lead.phone = match[1].replace(/[\s\-\(\)\.]/g, '').trim();
      break;
    }
  }

  // Email extract karo
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = content.match(emailPattern);
  if (emailMatch) lead.email = emailMatch[1];

  // Bike interest extract karo
  const bikePatterns = [
    /(?:Vehicle|Bike|Motorcycle|Model|Interest|Stock|Unit)[\s:]+([^\n<]{5,60})/i,
    /(?:2024|2025|2026)\s+(?:Harley|HD)[^\n<]{3,50}/i,
    /(?:Street Glide|Road Glide|Fat Boy|Softail|Sportster|Road King|Ultra|Low Rider|Breakout|Fat Bob|Nightster|Pan America)[^\n<]{0,30}/i
  ];
  for (const pattern of bikePatterns) {
    const match = content.match(pattern);
    if (match) { lead.bikeInterest = match[0].trim(); break; }
  }

  // Stock number extract karo
  const stockPatterns = [
    /(?:Stock|Stock #|Stock Number|STK)[\s:#]+([A-Z0-9\-]{4,20})/i,
    /(?:Stock)[\s:]+#?([A-Z0-9\-]{4,20})/i
  ];
  let stockNumber = null;
  for (const pattern of stockPatterns) {
    const match = content.match(pattern);
    if (match) { stockNumber = match[1].trim(); break; }
  }

  // VIN extract karo
  const vinPatterns = [
    /(?:VIN|V\.I\.N)[\s:#]+([A-HJ-NPR-Z0-9]{17})/i,
    /([A-HJ-NPR-Z0-9]{17})/
  ];
  let vin = null;
  for (const pattern of vinPatterns) {
    const match = content.match(pattern);
    if (match) { vin = match[1].trim(); break; }
  }

  // Model code extract karo
  const modelCodePatterns = [
    /(?:Model Code|Code|Model)[\s:#]+([A-Z0-9]{4,10})/i,
    /\b(FLHX|FLTRX|FLHCS|FLHR|FLHTK|FXLRS|FXBBS|FXFBS|FXST|RA1250S|RH1250S)\b/i
  ];
  let modelCode = null;
  for (const pattern of modelCodePatterns) {
    const match = content.match(pattern);
    if (match) { modelCode = match[1].trim(); break; }
  }

  // Initial message / comments extract karo
  const messagePatterns = [
    /(?:Comments|Message|Notes|Inquiry)[\s:]+([^\n<]{10,300})/i,
    /(?:Customer Comments|Additional Info)[\s:]+([^\n<]{10,300})/i
  ];
  for (const pattern of messagePatterns) {
    const match = content.match(pattern);
    if (match) { lead.initialMessage = match[1].trim(); break; }
  }

  // Fallback initial message
  if (!lead.initialMessage && lead.bikeInterest) {
    lead.initialMessage = `I'm interested in the ${lead.bikeInterest}. Please contact me with more information.`;
  }

  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    bikeInterest: lead.bikeInterest,
    initialMessage: lead.initialMessage,
    stockNumber,
    vin,
    modelCode
  };
}

async function processEmail(parsed) {
  try {
    const { subject, text, html, from } = parsed;

    console.log(`📧 Processing email: ${subject}`);

    // eLEads email identify karo
    const isLeadEmail = subject && (
      subject.toLowerCase().includes('lead') ||
      subject.toLowerCase().includes('inquiry') ||
      subject.toLowerCase().includes('internet lead') ||
      subject.toLowerCase().includes('new lead') ||
      subject.toLowerCase().includes('customer inquiry') ||
      subject.toLowerCase().includes('falcons fury') ||
      subject.toLowerCase().includes('harley')
    );

    if (!isLeadEmail) {
      console.log(`⏭️ Skipping non-lead email: ${subject}`);
      return;
    }

    const leadInfo = parseLeadFromEmail(subject, text, html);

    if (!leadInfo.name || !leadInfo.phone) {
      console.log(`⚠️ Could not extract name/phone from email: ${subject}`);
      return;
    }

    // Duplicate check karo
    const existing = await db.getLeadByPhone(leadInfo.phone);
    if (existing) {
      console.log(`⏭️ Lead already exists for ${leadInfo.phone}`);
      return;
    }

    // Lead create karo
    const lead = {
      id: Date.now().toString(),
      name: leadInfo.name,
      phone: leadInfo.phone,
      email: leadInfo.email || null,
      bikeInterest: leadInfo.bikeInterest || null,
      stockNumber: leadInfo.stockNumber || null,
      vin: leadInfo.vin || null,
      modelCode: leadInfo.modelCode || null,
      score: 0,
      scoreColor: getScoreColor(0),
      priority: false,
      priorityReasons: [],
      buyingSignals: [],
      scoreBreakdown: {},
      lastAiAction: null,
      nextFollowUp: null,
      manualTakeover: false,
      followup3hrSent: false,
      followup5hrSent: false,
      conversation: [],
      createdAt: new Date().toISOString(),
      lastContactTime: new Date().toISOString()
    };

    if (leadInfo.initialMessage) {
      lead.conversation.push({
        role: 'user',
        content: leadInfo.initialMessage,
        timestamp: new Date().toISOString()
      });
    }

    const canRespond = await shouldRespond();
    if (canRespond && leadInfo.initialMessage) {
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
    } else if (!canRespond) {
      lead.lastAiAction = 'Outside operating hours — response scheduled for 10:00 AM';
      lead.nextFollowUp = '10:00 AM next morning';
    }

    await db.createLead(lead);
    console.log(`✅ Lead created from email: ${lead.name} (${lead.phone})`);

  } catch (err) {
    console.error('Email processing error:', err.message);
  }
}

function startEmailParser() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('⚠️ Email parser disabled — EMAIL_USER or EMAIL_APP_PASSWORD not set');
    return;
  }

  console.log(`📬 Email parser started — monitoring ${process.env.EMAIL_USER}`);

  function checkEmails() {
    const imap = new Imap(IMAP_CONFIG);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) { imap.end(); return; }

        // Sirf unread emails fetch karo
        imap.search(['UNSEEN'], (err, results) => {
          if (err || !results || results.length === 0) {
            imap.end();
            return;
          }

          console.log(`📧 Found ${results.length} unread email(s)`);

          const fetch = imap.fetch(results, { bodies: '' });

          fetch.on('message', (msg) => {
            let buffer = '';
            msg.on('body', (stream) => {
              stream.on('data', (chunk) => { buffer += chunk.toString('utf8'); });
              stream.once('end', async () => {
                const parsed = await simpleParser(buffer);
                await processEmail(parsed);
              });
            });
            msg.once('attributes', (attrs) => {
              // Email ko read mark karo
              imap.addFlags(attrs.uid, ['\\Seen'], () => {});
            });
          });

          fetch.once('end', () => { imap.end(); });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err.message);
    });

    imap.connect();
  }

  checkEmails(); // Startup pe run karo
  setInterval(checkEmails, 5 * 60 * 1000); // Har 5 minute check karo
}

module.exports = { startEmailParser, parseLeadFromEmail };
