const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

jest.mock('../src/services/aiService', () => ({
  generateText: jest.fn().mockImplementation((prompt) => {
    if (prompt.includes('draftReply')) return Promise.resolve('{"summary":"User cannot login","draftReply":"Hello, please try reset link."}');
    return Promise.resolve('{"priority":"High","sentiment":"negative","category":"bug","summary":"User cannot login."}');
  }),
  vectorSearch: jest.fn().mockResolvedValue(['Reset your password in settings.']),
  getEmbedding: jest.fn().mockResolvedValue(new Array(768).fill(0.1)),
  processAndStoreKB: jest.fn().mockResolvedValue({ title: 'test', chunkCount: 1 }),
  chunkText: jest.fn().mockImplementation((text) => [text]),
}));

let token; let adminToken; let ticketId; let customerId;
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartdesk-test');
  await User.deleteMany({}); await Ticket.deleteMany({});
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: await User.hashPassword('admin123'), role: 'admin' });
  adminToken = require('jsonwebtoken').sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
  const user = await User.create({ name: 'User', email: 'user@test.com', passwordHash: await User.hashPassword('user123'), role: 'customer' });
  customerId = user._id;
  token = require('jsonwebtoken').sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET);
  const agent = await User.create({ name: 'Agent', email: 'agent@test.com', passwordHash: await User.hashPassword('agent123'), role: 'agent' });
  global.agentToken = require('jsonwebtoken').sign({ id: agent._id, role: 'agent' }, process.env.JWT_SECRET);
  const t = await Ticket.create({ title: 'Test ticket', description: 'Test desc', customerId: user._id });
  ticketId = t._id;
}, 30000);
afterAll(async () => { await mongoose.connection.close(); });

describe('Auth', () => {
  test('POST /api/auth/register creates user', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'New', email: 'new@test.com', password: 'pass123', role: 'customer' });
    expect(res.status).toBe(201); expect(res.body).toHaveProperty('id');
  });
  test('POST /api/auth/register validation 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'bad', password: '123' });
    expect(res.status).toBe(400);
  });
  test('POST /api/auth/login returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'user123' });
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('id');
  });
  test('GET /api/auth/me requires auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Tickets', () => {
  test('POST /api/tickets creates ticket', async () => {
    const res = await request(app).post('/api/tickets').set('Cookie', `token=${token}`).send({ title: 'New ticket', description: 'Desc', category: 'bug' });
    expect(res.status).toBe(201); expect(res.body).toHaveProperty('_id');
  });
  test('POST /api/tickets validation 400', async () => {
    const res = await request(app).post('/api/tickets').set('Cookie', `token=${token}`).send({ title: '', description: '' });
    expect(res.status).toBe(400);
  });
  test('GET /api/tickets requires auth', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
  test('GET /api/tickets paginated', async () => {
    const res = await request(app).get('/api/tickets?page=1&limit=2').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('data'); expect(res.body).toHaveProperty('totalPages');
  });
  test('GET /api/tickets/:id own ticket', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`).set('Cookie', `token=${token}`);
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('ticket');
  });
  test('GET /api/tickets/stats requires admin', async () => {
    const res = await request(app).get('/api/tickets/stats').set('Cookie', `token=${token}`);
    expect(res.status).toBe(403);
  });
  test('GET /api/tickets/stats admin ok', async () => {
    const res = await request(app).get('/api/tickets/stats').set('Cookie', `token=${adminToken}`);
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('totalTickets');
  });
  test('PATCH /api/tickets/:id/assign agent', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}/assign`).set('Cookie', `token=${global.agentToken}`);
    expect(res.status).toBe(200); expect(res.body.assignedAgentId).toBeDefined();
  });
});

describe('Messages', () => {
  test('POST /api/tickets/:id/messages', async () => {
    const res = await request(app).post(`/api/tickets/${ticketId}/messages`).set('Cookie', `token=${token}`).send({ text: 'Hello' });
    expect(res.status).toBe(201); expect(res.body).toHaveProperty('text');
  });
});

describe('AI', () => {
  test('POST /api/ai/triage returns priority', async () => {
    const res = await request(app).post('/api/ai/triage').set('Cookie', `token=${token}`).send({ ticketId });
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('priority');
  });
  test('POST /api/ai/chat returns answer', async () => {
    const res = await request(app).post('/api/ai/chat').set('Cookie', `token=${token}`).send({ ticketId, query: 'hello' });
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('answer');
  });
  test('POST /api/ai/draft-reply', async () => {
    await request(app).post(`/api/tickets/${ticketId}/messages`).set('Cookie', `token=${token}`).send({ text: 'Need help' });
    const res = await request(app).post('/api/ai/draft-reply').set('Cookie', `token=${global.agentToken}`).send({ ticketId });
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('draftReply');
  });
});

describe('Health', () => {
  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('ok');
  });
  test('GET /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200); expect(res.body).toHaveProperty('openapi');
  });
});
