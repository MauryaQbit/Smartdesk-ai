const { Router } = require('express');
const multer = require('multer');
const { asyncHandler } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const { processAndStoreKB } = require('../services/aiService');
const KnowledgeDoc = require('../models/KnowledgeDoc');

const router = Router();
router.use(protect, authorize('admin', 'agent'));

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const content = req.file.buffer.toString('utf8');
  if (!content || content.length < 10) return res.status(400).json({ message: 'File content too small' });

  const result = await processAndStoreKB(req.body.title || req.file.originalname, content, req.file.originalname, req.user._id);
  res.status(201).json({ ...result, source: req.file.originalname });
}));

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const docs = await KnowledgeDoc.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('title source chunkCount uploadedBy createdAt')
    .populate('uploadedBy', 'name')
    .lean();
  const total = await KnowledgeDoc.countDocuments();
  res.json({ data: docs, page, limit, total, totalPages: Math.ceil(total / limit) });
}));

module.exports = router;
