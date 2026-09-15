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

  let content = '';
  const buffer = req.file.buffer;

  // Simple text extraction for .txt, .md, .csv, .json
  // For .pdf, client should extract text first or use a text-extraction service
  const mimeType = req.file.mimetype || '';
  if (mimeType === 'application/pdf') {
    return res.status(400).json({ message: 'PDF text must be extracted client-side. Upload .txt or copy-paste content.' });
  }
  if (mimeType === 'application/json') {
    content = buffer.toString('utf8');
  } else {
    content = buffer.toString('utf8');
  }

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
