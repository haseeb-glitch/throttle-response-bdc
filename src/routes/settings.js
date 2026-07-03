const express = require('express');

// Default settings — seeded on first boot, persists in memory for the session
const DEFAULT_SETTINGS = {
  dealership: {
    name:     'Falcons Fury Harley-Davidson',
    phone:    '770-588-0416',
    website:  'FalconsFuryHD.com',
    location: 'Georgia'
  },
  persona: {
    agentName: 'Pablo',
    tone: 'casual'   // 'professional' | 'casual' | 'high-energy'
  },
  operatingHours: {
    startHour: 8,    // 8 AM Eastern
    endHour:   22,   // 10 PM Eastern
    timezone:  'America/New_York'
  },
  twilio: {
    enabled: false   // read-only — reflects TWILIO_ENABLED env var
  }
};

let settingsStore = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

module.exports = function () {
  const router = express.Router();

  // GET current settings
  router.get('/', (req, res) => {
    // Reflect live env var for twilio status
    settingsStore.twilio.enabled = process.env.TWILIO_ENABLED === 'true';
    res.json({ success: true, settings: settingsStore });
  });

  // POST update settings (partial merge)
  router.post('/', (req, res) => {
    const { dealership, persona, operatingHours } = req.body;

    if (dealership)      Object.assign(settingsStore.dealership,      dealership);
    if (persona)         Object.assign(settingsStore.persona,         persona);
    if (operatingHours)  Object.assign(settingsStore.operatingHours,  operatingHours);

    res.json({ success: true, settings: settingsStore });
  });

  // GET settings store for use by other services (internal use)
  router.getStore = () => settingsStore;

  return router;
};

// Export store accessor separately so ai.js can read it
module.exports.getSettings = () => settingsStore;
