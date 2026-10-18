const { Router } = require('express');
const multer = require('multer');
const { asyncHandler } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const { processAndStoreKB } = require('../services/aiService');
const KnowledgeDoc = require('../models/KnowledgeDoc');
const { recordAudit } = require('../utils/audit');

const router = Router();
router.use(protect, authorize('admin', 'agent'));

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const content = req.file.buffer.toString('utf8');
  if (!content || content.length < 10) return res.status(400).json({ message: 'File content too small' });

  const result = await processAndStoreKB(req.body.title || req.file.originalname, content, req.file.originalname, req.user._id);
  await recordAudit({ actor: req.user, action: 'knowledge.uploaded', resourceType: 'KnowledgeDoc', metadata: { title: result.title, source: req.file.originalname, chunkCount: result.chunkCount } });
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

router.delete('/:id', asyncHandler(async (req, res) => {
  const doc = await KnowledgeDoc.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  await KnowledgeDoc.deleteMany({ title: doc.title, source: doc.source });
  await recordAudit({ actor: req.user, action: 'knowledge.deleted', resourceType: 'KnowledgeDoc', resourceId: doc._id, metadata: { title: doc.title, source: doc.source } });
  res.json({ ok: true });
}));

module.exports = router;
