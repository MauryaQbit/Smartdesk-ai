const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

jest.mock('../src/services/aiService', () => ({
  generateText: jest.fn().mockResolvedValue('{"priority":"High","sentiment":"negative","category":"bug","summary":"User cannot login."}'),
  vectorSearch: jest.fn().mockResolvedValue(['Reset your password in settings.']),
  getEmbedding: jest.fn().mockResolvedValue(new Array(768).fill(0.1)),
  processAndStoreKB: jest.fn().mockResolvedValue({ title: 'test', chunkCount: 1 }),
  chunkText: jest.fn().mockImplementation((text) => [text]),
}));

let token;
let ticketId;
let adminToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartdesk-test');
  await User.deleteMany({});
  await Ticket.deleteMany({});
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: await User.hashPassword('admin123'), role: 'admin' });
  adminToken = require('jsonwebtoken').sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
  const user = await User.create({ name: 'User', email: 'user@test.com', passwordHash: await User.hashPassword('user123'), role: 'customer' });
  token = require('jsonwebtoken').sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
  const t = await Ticket.create({ title: 'Test ticket', description: 'Test desc', customerId: user._id });
  ticketId = t._id;
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth', () => {
  test('POST /api/auth/register creates user', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'New', email: 'new@test.com', password: 'pass123', role: 'customer' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
  test('POST /api/auth/login returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'user123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});

describe('Tickets', () => {
  test('POST /api/tickets creates ticket', async () => {
    const res = await request(app).post('/api/tickets').set('Cookie', `token=${token}`).send({ title: 'New ticket', description: 'Desc', category: 'bug' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
  test('GET /api/tickets requires auth', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
  test('GET /api/tickets/stats requires admin', async () => {
    const res = await request(app).get('/api/tickets/stats').set('Cookie', `token=${token}`);
    expect(res.status).toBe(403);
  });
});

describe('AI', () => {
  test('POST /api/ai/triage returns priority', async () => {
    const res = await request(app).post('/api/ai/triage').set('Cookie', `token=${token}`).send({ ticketId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('priority');
  });
});
