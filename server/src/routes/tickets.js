const express = require('express');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const cache = require('../config/cache');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { ticketRules, messageRules, validate } = require('../middleware/validate');

const router = express.Router();
router.use(protect);

function canAccessTicket(user, ticket) {
  if (user.role === 'admin') return true;
  if (user.role === 'agent') return true;
  const ownerId = ticket.customerId && ticket.customerId._id ? ticket.customerId._id.toString() : ticket.customerId.toString();
  return ownerId === user._id.toString();
}

// GET /api/tickets?status=open&page=1&limit=10&q=login
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === 'customer') filter.customerId = req.user._id;
  if (req.query.q) {
    filter.$or = [
      { title: { $regex: req.query.q, $options: 'i' } },
      { description: { $regex: req.query.q, $options: 'i' } }
    ];
  }
  const key = `tickets:${req.user._id}:${req.user.role}:${page}:${limit}:${req.query.status||''}:${req.query.q||''}`;
  const cached = cache.get(key);
  if (cached) return res.json({ ...cached, cached: true });
  const total = await Ticket.countDocuments(filter);
  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('customerId', 'name email')
    .populate('assignedAgentId', 'name email')
    .lean();
  const payload = { data: tickets, page, limit, total, totalPages: Math.ceil(total / limit) };
  cache.set(key, payload);
  res.json(payload);
}));

// GET /api/tickets/stats (admin only)
router.get('/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Ticket.aggregate([
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        urgentTickets: { $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] } },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $in: ['$status', ['resolved', 'closed']] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null
            ]
          }
        },
        aiResolved: { $sum: { $cond: [{ $eq: ['$aiResolved', true] }, 1, 0] } }
      }
    }
  ]);
  const s = stats[0] || {};
  const avgMinutes = s.avgResolutionTime ? Math.round(s.avgResolutionTime / (1000 * 60) * 10) / 10 : 0;
  const aiResolvedPercent = s.totalTickets > 0 ? Math.round((s.aiResolved / s.totalTickets) * 100) : 0;

  // time series last 7 days
  const since = new Date(Date.now() - 7*24*60*60*1000);
  const series = await Ticket.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const byCategory = await Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const leaderboard = await Ticket.aggregate([
    { $match: { assignedAgentId: { $ne: null } } },
    { $group: { _id: '$assignedAgentId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { name: '$user.name', email: '$user.email', count: 1 } }
  ]);
  res.json({
    totalTickets: s.totalTickets || 0,
    openTickets: s.openTickets || 0,
    resolvedTickets: s.resolvedTickets || 0,
    urgentTickets: s.urgentTickets || 0,
    aiResolved: s.aiResolved || 0,
    aiResolvedPercent,
    avgResolutionTimeMin: avgMinutes,
    series: series.map(r=>({ date: r._id, count: r.count })),
    byCategory: byCategory.map(r=>({ category: r._id, count: r.count })),
    leaderboard
  });
}));

// POST /api/tickets ... remaining routes same

// POST /api/tickets
router.post('/', ticketRules, validate, asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const ticket = await Ticket.create({
    title, description, category: category || 'general', customerId: req.user._id
  });
  cache.clear();
  // audit + notification handled via socket for new ticket (customer created)
  res.status(201).json(ticket);
}));

// POST /api/tickets/bulk-triage (admin/agent) - advanced bulk + efficient
router.post('/bulk-triage', authorize('agent','admin'), asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length===0) return res.status(400).json({ message: 'ids required' });
  const { generateText } = require('../services/aiService');
  const results = [];
  for (const id of ids.slice(0,20)) {
    const t = await Ticket.findById(id);
    if (!t) continue;
    const prompt = `Classify and return JSON {"priority":"Low|Medium|High|Urgent","category":"bug|billing|feature|general","summary":"..."}\nTitle:${t.title}\nDesc:${t.description}`;
    try {
      const raw = await generateText(prompt);
      const m = raw.match(/\{[\s\S]*\}/); const p = m?JSON.parse(m[0]):{};
      t.priority = p.priority||'Medium'; t.category=p.category||'general'; t.summaryAI=p.summary||''; await t.save(); results.push({ id, priority: t.priority });
    } catch { results.push({ id, error: 'triage failed' }); }
  }
  cache.clear();
  res.json({ processed: results });
}));

// GET /api/tickets/:id + messages
router.get('/:id', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('customerId', 'name email')
    .populate('assignedAgentId', 'name email');
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (!canAccessTicket(req.user, ticket)) return res.status(403).json({ message: 'Forbidden' });
  const messages = await Message.find({ ticketId: ticket._id }).sort({ createdAt: 1 }).lean();
  res.json({ ticket, messages });
}));

// PATCH /api/tickets/:id/assign  (agent/admin)
router.patch('/:id/assign', authorize('agent', 'admin'), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.assignedAgentId = req.user._id;
  if (ticket.status === 'open') ticket.status = 'assigned';
  await ticket.save();
  const TicketHistory = require('../models/TicketHistory');
  const Notification = require('../models/Notification');
  await TicketHistory.create({ ticketId: ticket._id, actorId: req.user._id, actorName: req.user.name, action: 'assigned', meta: { to: req.user.name } });
  await Notification.create({ userId: ticket.customerId, ticketId: ticket._id, type: 'assigned', title: `Ticket assigned to ${req.user.name}` });
  cache.clear();
  const io = req.app.get('io'); if (io) io.to(ticket.customerId.toString()).emit('notification', { title: 'Ticket assigned' });
  res.json(ticket);
}));

// PATCH /api/tickets/:id/status  (agent/admin or owner-close)
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'assigned', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  const isOwner = ticket.customerId.toString() === req.user._id.toString();
  const isStaff = ['agent', 'admin'].includes(req.user.role);
  if (!isStaff && !(isOwner && ['closed'].includes(status))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const prev = ticket.status;
  ticket.status = status;
  await ticket.save();
  cache.clear();
  const TicketHistory = require('../models/TicketHistory');
  await TicketHistory.create({ ticketId: ticket._id, actorId: req.user._id, actorName: req.user.name, action: `status:${prev}->${status}` });
  res.json(ticket);
}));

// POST /api/tickets/:id/messages  (REST fallback; realtime via Socket.io)
router.post('/:id/messages', messageRules, validate, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (!canAccessTicket(req.user, ticket)) return res.status(403).json({ message: 'Forbidden' });
  const senderType = req.user.role === 'agent' || req.user.role === 'admin' ? 'agent' : 'user';
  const msg = await Message.create({
    ticketId: ticket._id, senderId: req.user._id, senderType, text: req.body.text
  });
  const TicketHistory = require('../models/TicketHistory');
  await TicketHistory.create({ ticketId: ticket._id, actorId: req.user._id, actorName: req.user.name, action: 'message', meta: { text: msg.text.slice(0,60) } });
  // Emit live if socket server attached
  const io = req.app.get('io');
  if (io) io.to(ticket._id.toString()).emit('new-message', msg);
  res.status(201).json(msg);
}));

// POST /api/tickets/:id/attachments (agent/customer - file upload, stored as metadata; wire to Cloudinary later via CLOUDINARY_URL)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });
router.post('/:id/attachments', protect, upload.single('file'), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (!canAccessTicket(req.user, ticket)) return res.status(403).json({ message: 'Forbidden' });
  if (!req.file) return res.status(400).json({ message: 'No file' });
  // For placement demo, store as data URL (replace with Cloudinary upload when CLOUDINARY_URL set)
  const b64 = req.file.buffer.toString('base64');
  const url = `data:${req.file.mimetype};base64,${b64.slice(0,200)}...`;
  ticket.attachments.push({ url, name: req.file.originalname, size: req.file.size, mime: req.file.mimetype });
  await ticket.save();
  res.json({ attachment: ticket.attachments[ticket.attachments.length-1] });
}));

// GET /api/tickets/:id/history
router.get('/:id/history', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (!canAccessTicket(req.user, ticket)) return res.status(403).json({ message: 'Forbidden' });
  const TicketHistory = require('../models/TicketHistory');
  const hist = await TicketHistory.find({ ticketId: ticket._id }).sort({ createdAt: 1 }).lean();
  res.json({ data: hist });
}));

module.exports = router;
