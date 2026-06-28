require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const leadsRouter       = require('./routes/leads');
const { router: smsRouter, setLeadsStore } = require('./routes/sms');
const appointmentsRouter = require('./routes/appointments');
const analyticsRouter    = require('./routes/analytics');
const settingsRouter     = require('./routes/settings');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shared in-memory stores
const leads        = [];
const appointments = [];

// Pass leads store to sms route
setLeadsStore(leads);

// Routes
app.use('/api/leads',        leadsRouter(leads));
app.use('/api/appointments', appointmentsRouter(appointments, leads));
app.use('/api/analytics',    analyticsRouter(leads));
app.use('/api/settings',     settingsRouter());
app.use('/sms',              smsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ThrottleResponseBDC running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});