require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');
const { router: smsRouter, setLeadsStore } = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shared in-memory leads store
const leads = [];

// Pass leads store to sms route
setLeadsStore(leads);

// Routes
app.use('/api/leads', leadsRouter(leads));
app.use('/sms', smsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ThrottleResponseBDC running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});