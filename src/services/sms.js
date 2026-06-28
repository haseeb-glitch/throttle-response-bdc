// SMS Service
// Mock mode jab tak Twilio credentials nahi aate
// Production mein TWILIO_ENABLED=true karo .env mein

const TWILIO_ENABLED = process.env.TWILIO_ENABLED === 'true';

let twilioClient = null;

if (TWILIO_ENABLED) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendSMS(to, message) {
  if (!TWILIO_ENABLED) {
    // Mock mode — console mein print karo
    console.log('\n📱 SMS MOCK MODE');
    console.log(`TO: ${to}`);
    console.log(`FROM: ${process.env.TWILIO_PHONE_NUMBER || '+14041234567'}`);
    console.log(`MESSAGE: ${message}`);
    console.log('─────────────────────────────\n');
    return { success: true, mock: true, to, message };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`✅ SMS sent to ${to} — SID: ${result.sid}`);
    return { success: true, mock: false, sid: result.sid };

  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function sendDelayedSMS(to, message, delayMs) {
  // First response ~3 minute delay as per spec
  console.log(`⏱️  SMS scheduled in ${Math.round(delayMs / 1000)} seconds to ${to}`);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await sendSMS(to, message);
      resolve(result);
    }, delayMs);
  });
}

// Twilio webhook — incoming SMS se lead update karna
function parseTwilioWebhook(body) {
  return {
    from: body.From,
    to: body.To,
    message: body.Body,
    messageSid: body.MessageSid
  };
}

module.exports = { sendSMS, sendDelayedSMS, parseTwilioWebhook };