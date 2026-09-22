const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const User = require('../models/User');
const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).lean();
  res.json({ data: users });
}));
router.patch('/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer','agent','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
  res.json(u);
}));
module.exports = router;
