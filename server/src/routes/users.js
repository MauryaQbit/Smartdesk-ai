const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const User = require('../models/User');
const { recordAudit } = require('../utils/audit');
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
  if (!u) return res.status(404).json({ message: 'User not found' });
  await recordAudit({ actor: req.user, action: 'user.role_changed', resourceType: 'User', resourceId: u._id, metadata: { role } });
  res.json(u);
}));
module.exports = router;
