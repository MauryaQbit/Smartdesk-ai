require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const connectDB = require('./config/db');

async function seed() {
  await connectDB(process.env.MONGO_URI);
  const count = await User.countDocuments();
  if (count > 0) { console.log('Seed skipped: users exist'); process.exit(0); }
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: await User.hashPassword('admin123'), role: 'admin' });
  const agent = await User.create({ name: 'Agent One', email: 'agent@test.com', passwordHash: await User.hashPassword('agent123'), role: 'agent' });
  const cust = await User.create({ name: 'John Doe', email: 'john@test.com', passwordHash: await User.hashPassword('customer123'), role: 'customer' });
  await Ticket.create([
    { title: 'Cannot login to dashboard', description: 'Login fails with 500 after password reset', category: 'bug', customerId: cust._id },
    { title: 'Billing double charge', description: 'Charged twice for March', category: 'billing', customerId: cust._id, priority: 'High' },
    { title: 'Feature: dark mode', description: 'Please add dark mode toggle', category: 'feature', customerId: cust._id },
  ]);
  console.log(`Seeded: admin ${admin.email}, agent ${agent.email}, customer ${cust.email} + 3 tickets`);
  process.exit(0);
}
seed().catch(e=>{ console.error(e); process.exit(1); });
