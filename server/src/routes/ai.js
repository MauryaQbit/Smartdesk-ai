const { Router } = require('express');
const { asyncHandler } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const { generateText, vectorSearch } = require('../services/aiService');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

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
  await ticket.save();

  res.json({ ticketId: ticket._id, priority: ticket.priority, sentiment: ticket.sentimentAI, category: ticket.category, summary: ticket.summaryAI });
}));

// POST /api/ai/chat - RAG chatbot
router.post('/chat', asyncHandler(async (req, res) => {
  const { query, ticketId } = req.body;
  if (!query || !ticketId) return res.status(400).json({ message: 'query and ticketId required' });

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  // 1) Retrieve relevant chunks from knowledge base
  const chunks = await vectorSearch(query, 3);

  if (!chunks.length) {
    const msg = await Message.create({ ticketId, senderId: null, senderType: 'ai', text: 'Escalating to human agent — no relevant knowledge found.' });
    io = req.app.get('io');
    if (io) io.to(ticketId.toString()).emit('new-message', msg);
    return res.json({ answer: 'Escalating to human agent — no relevant knowledge found.', chunkCount: 0 });
  }

  // 2) Build RAG prompt with strict context instruction
  const context = chunks.join('\n---CHUNK---\n');
  const prompt = `Answer ONLY from the following context. Do NOT hallucinate or add outside information.
If the answer is not in the context, say exactly: "Escalating to human agent."

Context:
${context}

Question: ${query}`;

  const answer = await generateText(prompt);

  // 3) Store AI response as message
  const msg = await Message.create({ ticketId, senderId: null, senderType: 'ai', text: answer });

  const io = req.app.get('io');
  if (io) io.to(ticketId.toString()).emit('new-message', msg);

  res.json({ answer, chunkCount: chunks.length });
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
