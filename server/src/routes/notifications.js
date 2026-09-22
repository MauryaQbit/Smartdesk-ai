const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Notification = require('../models/Notification');
const router = express.Router();
router.use(protect);
router.get('/', asyncHandler(async (req, res) => {
  const docs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
  const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
  res.json({ data: docs, unread });
}));
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
  res.json(n);
}));
router.post('/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
}));
module.exports = router;
