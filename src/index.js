require('dotenv').config();
const express = require('express');
const cors = require('cors');

const leadsRouter = require('./routes/leads');
const { router: smsRouter } = require('./routes/sms');
const appointmentsRouter = require('./routes/appointments');
const analyticsRouter = require('./routes/analytics');
const settingsRouter = require('./routes/settings');
const db = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wrapper object — leadsCache.data hamesha latest leads rakhega
const leadsCache = { data: [] };
const appointments = [];

async function refreshLeadsCache() {
  try {
    leadsCache.data = await db.getAllLeads();
  } catch (err) {
    console.error('Leads cache refresh failed:', err.message);
  }
}
refreshLeadsCache();
setInterval(refreshLeadsCache, 10000);

app.use('/api/leads', leadsRouter);
app.use('/api/appointments', appointmentsRouter(appointments, leadsCache));
app.use('/api/analytics', analyticsRouter(leadsCache));
app.use('/api/settings', settingsRouter());
app.use('/sms', smsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ThrottleResponseBDC running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});