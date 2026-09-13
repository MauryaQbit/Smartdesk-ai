const express = require('express');
const User = require('../models/User');
const { sendTokenCookie, protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { registerRules, loginRules, validate } = require('../middleware/validate');

const router = express.Router();

router.post('/register', registerRules, validate, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  // Solo Month-1 safety: only allow admin creation if no admin exists yet.
  // Prevents open privilege escalation in placement demo.
  let finalRole = 'customer';
  if (role === 'agent') finalRole = 'agent';
  if (role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) return res.status(403).json({ message: 'Admin creation disabled' });
    finalRole = 'admin';
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: finalRole });
  sendTokenCookie(res, user);
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
}));

router.post('/login', loginRules, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  sendTokenCookie(res, user);
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
}));

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', protect, (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
});

module.exports = router;
