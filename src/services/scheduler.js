const db = require('./database');
const { generateResponse, shouldRespond } = require('./ai');
const { sendSMS } = require('./sms');

// Casual follow-up prompts — Jake re-engages naturally, no pressure
const FOLLOWUP_3HR_PROMPTS = [
  "Hey, just wanted to make sure my last message came through okay — happy to help with whatever you need.",
  "Hey, still around? No rush at all, just wanted to check in.",
  "Hey, let me know if you had any other questions — I'm here."
];

const FOLLOWUP_5HR_PROMPTS = [
  "No pressure at all — just wanted to leave the door open if you're still thinking it over. I'm here whenever.",
  "Hey, totally understand if you're still deciding. Just shoot me a message whenever you're ready to chat more.",
  "Hey, didn't want to be a stranger — let me know if you'd like to pick this back up whenever works for you."
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLastMessage(conversation) {
  if (!conversation || conversation.length === 0) return null;
  return conversation[conversation.length - 1];
}

function hoursSince(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  return diffMs / (1000 * 60 * 60);
}

async function processFollowUps() {
  try {
    const canRespond = await shouldRespond();
    if (!canRespond) return; // Outside operating hours

    const leads = await db.getAllLeads();

    for (const lead of leads) {
      if (lead.manualTakeover) continue; // Human in control, skip
      if (!lead.conversation || lead.conversation.length === 0) continue;

      const lastMsg = getLastMessage(lead.conversation);
      if (!lastMsg) continue;

      // Sirf tab follow-up karo jab last message AI (assistant) ka tha — matlab customer ne reply nahi kiya
      if (lastMsg.role !== 'assistant') continue;

      const hoursSinceLastMsg = hoursSince(lastMsg.timestamp);

      // 3 hour follow-up
      if (!lead.followup3hrSent && hoursSinceLastMsg >= 3) {
        const message = pickRandom(FOLLOWUP_3HR_PROMPTS);

        lead.conversation.push({
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString()
        });

        lead.lastAiAction = message;
        lead.lastContactTime = new Date().toISOString();
        lead.followup3hrSent = true;

        await db.updateLead(lead.id, lead);
        await sendSMS(lead.phone, message);

        console.log(`3hr follow-up sent to ${lead.name} (${lead.phone})`);
        continue;
      }

      // 5 hour follow-up
      if (lead.followup3hrSent && !lead.followup5hrSent && hoursSinceLastMsg >= 5) {
        const message = pickRandom(FOLLOWUP_5HR_PROMPTS);

        lead.conversation.push({
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString()
        });

        lead.lastAiAction = message;
        lead.lastContactTime = new Date().toISOString();
        lead.followup5hrSent = true;

        await db.updateLead(lead.id, lead);
        await sendSMS(lead.phone, message);

        console.log(`5hr follow-up sent to ${lead.name} (${lead.phone})`);
      }
    }

  } catch (err) {
    console.error('Follow-up scheduler error:', err.message);
  }
}

function startScheduler() {
  console.log('Re-engagement scheduler started — checking every 5 minutes');
  processFollowUps(); // Run once on startup
  setInterval(processFollowUps, 5 * 60 * 1000); // Har 5 minute check karo
}

module.exports = { startScheduler, processFollowUps };