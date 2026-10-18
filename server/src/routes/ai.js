const { Router } = require('express');
const { asyncHandler } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const { generateText, vectorSearch } = require('../services/aiService');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { recordAudit } = require('../utils/audit');

const router = Router();
router.use(protect);

// POST /api/ai/triage - classify ticket
router.post('/triage', asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ message: 'ticketId required' });

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const prompt = `Classify this support ticket and return ONLY valid JSON:
Title: ${ticket.title}
Description: ${ticket.description}
Return JSON with fields:
{"priority":"Low|Medium|High|Urgent","sentiment":"positive|neutral|negative","category":"bug|billing|feature|general","summary":"one-line summary"}`;

  const raw = await generateText(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed = {};
  if (jsonMatch) {
    try { parsed = JSON.parse(jsonMatch[0]); } catch {}
  }

  ticket.priority = parsed.priority || 'Medium';
  ticket.sentimentAI = parsed.sentiment || 'neutral';
  ticket.category = parsed.category || 'general';
  ticket.summaryAI = parsed.summary || '';
  // mark as AI-processed for stats (triage counts as AI assist)
  ticket.aiResolved = false;
  await ticket.save();
  await recordAudit({ actor: req.user, action: 'ai.triage_completed', resourceType: 'Ticket', resourceId: ticket._id, metadata: { priority: ticket.priority, category: ticket.category } });

  res.json({ ticketId: ticket._id, priority: ticket.priority, sentiment: ticket.sentimentAI, category: ticket.category, summary: ticket.summaryAI });
}));

// POST /api/ai/chat - RAG chatbot
router.post('/chat', asyncHandler(async (req, res) => {
  const { query, ticketId } = req.body;
  if (!query || !ticketId) return res.status(400).json({ message: 'query and ticketId required' });

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const io = req.app.get('io');

  // 1) Retrieve relevant chunks from knowledge base
  let chunks = [];
  try { chunks = await vectorSearch(query, 3); } catch (e) { console.error('vectorSearch failed', e.message); }
  chunks = chunks.map((chunk) => typeof chunk === 'string'
    ? { content: chunk, title: 'Knowledge base', source: null, score: 1 }
    : chunk);

  if (!chunks.length) {
    const msg = await Message.create({ ticketId, senderId: null, senderType: 'ai', text: 'Escalating to human agent — no relevant knowledge found.' });
    if (io) io.to(ticketId.toString()).emit('new-message', msg);
    return res.json({ answer: 'Escalating to human agent — no relevant knowledge found.', messageId: msg._id, chunkCount: 0, confidence: 0, sources: [], escalated: true });
  }

  // 2) Build RAG prompt with strict context instruction
  const context = chunks.map((chunk) => chunk.content).join('\n---CHUNK---\n');
  const sources = chunks.map(({ title, source, score }) => ({ title, source, score }));
  const confidence = Math.round(Math.max(...chunks.map((chunk) => chunk.score)) * 100) / 100;
  const prompt = `Answer ONLY from the following context. Do NOT hallucinate or add outside information.
If the answer is not in the context, say exactly: "Escalating to human agent."

Context:
${context}

Question: ${query}`;

  let answer;
  try { answer = await generateText(prompt); } catch (e) { return res.status(503).json({ message: 'AI temporarily unavailable, try again' }); }

  // 3) Store AI response as message and mark AI-resolved if not escalating
  const isEscalated = answer.includes('Escalating to human');
  if (!isEscalated) { ticket.aiResolved = true; await ticket.save(); }
  const msg = await Message.create({ ticketId, senderId: null, senderType: 'ai', text: answer, confidence, sources });
  if (io) io.to(ticketId.toString()).emit('new-message', msg);

  res.json({ answer, messageId: msg._id, chunkCount: chunks.length, confidence, sources, escalated: isEscalated });
}));

// POST /api/ai/escalate - notify support staff about an AI handoff
router.post('/escalate', asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ message: 'ticketId required' });
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  const isStaff = ['agent', 'admin'].includes(req.user.role);
  if (!isStaff && ticket.customerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  if (ticket.status === 'closed' || ticket.status === 'resolved') ticket.status = 'open';
  await ticket.save();
  const staff = await User.find({ role: { $in: ['agent', 'admin'] } }).select('_id');
  if (staff.length) {
    await Notification.insertMany(staff.map(({ _id }) => ({
      userId: _id,
      ticketId: ticket._id,
      type: 'ai_escalation',
      title: `Human help requested for "${ticket.title}"`
    })));
  }
  res.json({ ticketId: ticket._id, status: ticket.status, notified: staff.length });
}));

// POST /api/ai/feedback - record whether an AI answer helped
router.post('/feedback', asyncHandler(async (req, res) => {
  const { messageId, helpful } = req.body;
  if (!messageId || typeof helpful !== 'boolean') return res.status(400).json({ message: 'messageId and helpful are required' });
  const message = await Message.findById(messageId);
  if (!message || message.senderType !== 'ai') return res.status(404).json({ message: 'AI message not found' });
  const ticket = await Ticket.findById(message.ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  const ownerId = ticket.customerId.toString();
  const isStaff = ['agent', 'admin'].includes(req.user.role);
  if (!isStaff && ownerId !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  message.aiFeedback = helpful ? 'helpful' : 'not_helpful';
  await message.save();
  res.json({ messageId: message._id, feedback: message.aiFeedback });
}));

// POST /api/ai/draft-reply - Agent assist: summarize thread + draft reply
router.post('/draft-reply', asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ message: 'ticketId required' });

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const messages = await Message.find({ ticketId }).sort({ createdAt: 1 });
  if (!messages.length) return res.status(400).json({ message: 'No messages to summarize' });

  const thread = messages.map((m) => `[${m.senderType}]: ${m.text}`).join('\n');
  const summaryPrompt = `Summarize this support conversation in 3-4 sentences. Then draft a professional reply for the agent.
Return JSON: {"summary":"...","draftReply":"..."}

Conversation:
${thread}`;

  const raw = await generateText(summaryPrompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed = {};
  if (jsonMatch) {
    try { parsed = JSON.parse(jsonMatch[0]); } catch {}
  }

  res.json(parsed);
}));

module.exports = router;
