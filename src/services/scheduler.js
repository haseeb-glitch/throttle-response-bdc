const db = require('./database');
const { generateResponse, shouldRespond } = require('./ai');
const { sendSMS } = require('./sms');

// ─── Day 1 Follow-ups ────────────────────────────────────────
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

// ─── Day 2 Follow-ups (3 times throughout day) ───────────────
const FOLLOWUP_DAY2_PROMPTS = [
  "Hey, it's Pablo again from Falcons Fury HD. Just wanted to circle back and see if you're still thinking about making a move. Happy to answer any questions.",
  "Hey, checking back in. A lot of our customers tell me the hardest part is just getting in to take a look — once they do, it pretty much sells itself. Any chance you'd want to swing by this week?",
  "Hey, still here if you need anything. Whether it's questions about the bike, trade-in value, or financing — I've got you covered. Just say the word."
];

// ─── Day 3 Follow-up (value-driven) ─────────────────────────
const FOLLOWUP_DAY3_PROMPTS = [
  "Hey, wanted to reach out with something that might help. We've got solid financing options available right now and our trade-in values have been really strong lately. If you've been on the fence, this might be a good time to come take a look.",
  "Hey, just a heads up — inventory on some of our most popular models moves pretty fast. If there's a specific bike you had your eye on, I'd hate for you to miss it. Want me to check availability for you?",
  "Hey, thought I'd reach out with a friendly reminder that we're always happy to answer questions, discuss trade-ins, or just let you sit on a bike and see how it feels. No pressure, just an open invitation."
];

// ─── Day 5 Follow-up (soft, low pressure) ───────────────────
const FOLLOWUP_DAY5_PROMPTS = [
  "Hey, just wanted to check in one more time. I know life gets busy — no pressure at all. We're here whenever the timing is right for you.",
  "Hey, still thinking about you and that bike. Whenever you're ready, I'm here. No rush, no pressure — just want to make sure you get exactly what you're looking for.",
  "Hey, hope everything's going well. Just a quick note to say we haven't forgotten about you and we're still here whenever you need us."
];

// ─── Day 7 Follow-up (final before nurture) ─────────────────
const FOLLOWUP_DAY7_PROMPTS = [
  "Hey, I wanted to reach out one more time before I switch you over to our occasional updates list. From time to time I'll send you info on new inventory, promotions, and dealership events. If you ever want to pick up where we left off, just reply anytime — I'll be right here.",
  "Hey, just a final check-in from my end. I'm going to move you to our occasional updates so you stay in the loop on new bikes, deals, and events at Falcons Fury. Whenever you're ready to talk, just shoot me a message.",
];

// ─── Long-term Nurture (every 2 weeks) ──────────────────────
const NURTURE_PROMPTS = [
  "Hey, it's Pablo from Falcons Fury HD. Just checking in — we've got some great new inventory that just came in. Thought of you. Let me know if you'd like to take a look!",
  "Hey, hope you're doing well! We're running some solid promotions right now and I wanted to make sure you heard about them. Reply anytime if you want details.",
  "Hey, just a friendly check-in from Falcons Fury. We've had some great trade-in deals lately and wanted to keep you in the loop. Still interested in getting on a Harley?",
  "Hey, it's Pablo. We just got some new models in that I think you'd really like. No pressure — just wanted to stay in touch and make sure you know we're here when the time is right.",
  "Hey, hope everything's going great! Just wanted to pop in and say hi. We've got some exciting things happening at the dealership — events, new bikes, and some special offers. Let me know if you want the details!",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLastMessage(conversation) {
  if (!conversation || conversation.length === 0) return null;
  return conversation[conversation.length - 1];
}

function daysSince(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

function hoursSince(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  return diffMs / (1000 * 60 * 60);
}

function getCurrentHour() {
  const now = new Date();
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return eastern.getHours();
}

async function sendFollowup(lead, message, updates = {}) {
  lead.conversation.push({
    role: 'assistant',
    content: message,
    timestamp: new Date().toISOString()
  });
  lead.lastAiAction = message;
  lead.lastContactTime = new Date().toISOString();
  lead.lastFollowupDate = new Date().toISOString();

  Object.assign(lead, updates);

  await db.updateLead(lead.id, lead);
  await sendSMS(lead.phone, message);
}

async function processFollowUps() {
  try {
    const canRespond = await shouldRespond();
    if (!canRespond) return;

    const leads = await db.getAllLeads();
    const currentHour = getCurrentHour();

    for (const lead of leads) {
      if (lead.manualTakeover) continue;
      if (!lead.conversation || lead.conversation.length === 0) continue;

      const lastMsg = getLastMessage(lead.conversation);
      if (!lastMsg) continue;

      // Customer ne reply kiya hai — skip karo
      if (lastMsg.role === 'user') continue;

      const hoursGone = hoursSince(lastMsg.timestamp);
      const daysGone = daysSince(lead.createdAt);

      // ── Day 1: 3hr follow-up ──────────────────────────────
      if (!lead.followup3hrSent && hoursGone >= 3 && daysGone < 1) {
        const message = pickRandom(FOLLOWUP_3HR_PROMPTS);
        await sendFollowup(lead, message, { followup3hrSent: true });
        console.log(`🔄 3hr follow-up sent to ${lead.name}`);
        continue;
      }

      // ── Day 1: 5hr follow-up ──────────────────────────────
      if (lead.followup3hrSent && !lead.followup5hrSent && hoursGone >= 5 && daysGone < 1) {
        const message = pickRandom(FOLLOWUP_5HR_PROMPTS);
        await sendFollowup(lead, message, { followup5hrSent: true });
        console.log(`🔄 5hr follow-up sent to ${lead.name}`);
        continue;
      }

      // ── Day 2: 3 follow-ups throughout the day ────────────
      if (daysGone >= 1 && daysGone < 2 && (lead.followupDay2Count || 0) < 3) {
        const count = lead.followupDay2Count || 0;
        // Morning (9am), Afternoon (1pm), Evening (6pm)
        const sendTimes = [9, 13, 18];
        if (currentHour >= sendTimes[count]) {
          const message = FOLLOWUP_DAY2_PROMPTS[count];
          await sendFollowup(lead, message, { followupDay2Count: count + 1 });
          console.log(`🔄 Day 2 follow-up #${count + 1} sent to ${lead.name}`);
          continue;
        }
      }

      // ── Day 3: Value-driven ───────────────────────────────
      if (daysGone >= 2 && daysGone < 3 && !lead.followupDay3Sent) {
        const message = pickRandom(FOLLOWUP_DAY3_PROMPTS);
        await sendFollowup(lead, message, { followupDay3Sent: true });
        console.log(`🔄 Day 3 follow-up sent to ${lead.name}`);
        continue;
      }

      // ── Day 5: Soft low-pressure ──────────────────────────
      if (daysGone >= 4 && daysGone < 5 && !lead.followupDay5Sent) {
        const message = pickRandom(FOLLOWUP_DAY5_PROMPTS);
        await sendFollowup(lead, message, { followupDay5Sent: true });
        console.log(`🔄 Day 5 follow-up sent to ${lead.name}`);
        continue;
      }

      // ── Day 7: Final before nurture ───────────────────────
      if (daysGone >= 6 && daysGone < 7 && !lead.followupDay7Sent) {
        const message = pickRandom(FOLLOWUP_DAY7_PROMPTS);
        await sendFollowup(lead, message, { followupDay7Sent: true, nurtureMode: true });
        console.log(`🔄 Day 7 final follow-up sent to ${lead.name} — moved to nurture`);
        continue;
      }

      // ── Long-term Nurture: every 14 days ─────────────────
      if (lead.nurtureMode) {
        const lastFollowup = lead.lastFollowupDate || lead.createdAt;
        const daysSinceLastFollowup = daysSince(lastFollowup);
        if (daysSinceLastFollowup >= 14) {
          const message = pickRandom(NURTURE_PROMPTS);
          await sendFollowup(lead, message, {});
          console.log(`🌱 Nurture message sent to ${lead.name}`);
        }
      }
    }

  } catch (err) {
    console.error('Follow-up scheduler error:', err.message);
  }
}

function startScheduler() {
  console.log('📅 Re-engagement scheduler started — checking every 5 minutes');
  processFollowUps();
  setInterval(processFollowUps, 5 * 60 * 1000);
}

module.exports = { startScheduler, processFollowUps };