require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');
const { router: smsRouter } = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/leads', leadsRouter);
app.use('/sms', smsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ThrottleResponseBDC running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});