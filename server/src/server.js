require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const cron = require('node-cron');

const connectDB = require('./config/db');
const Ticket = require('./models/Ticket');
const { errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const kbRoutes = require('./routes/kb');
const aiRoutes = require('./routes/ai');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});
app.set('io', io);
initSocket(io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 20, message: { message: 'AI rate limit - try again in a minute' } }));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'smartdesk-ai', time: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/ai', aiRoutes);
app.use(errorHandler);

// SLA escalation: every 1 hour, mark tickets as Urgent if past deadline and still open
cron.schedule('*/1 * * * *', async () => {
  try {
    const result = await Ticket.updateMany(
      { status: { $in: ['open', 'assigned'] }, slaDeadline: { $lte: new Date() } },
      { $set: { priority: 'Urgent' } }
    );
    if (result.modifiedCount > 0) console.log(`SLA cron: ${result.modifiedCount} tickets escalated to Urgent`);
  } catch (e) { console.error('SLA cron error:', e.message); }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  connectDB(process.env.MONGO_URI).then(() => {
    server.listen(PORT, () => console.log(`Server running on :${PORT}`));
  }).catch((e) => {
    console.error('DB failed', e.message);
    process.exit(1);
  });
}

module.exports = app;
