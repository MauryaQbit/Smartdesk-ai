const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    source: { type: String, trim: true, maxlength: 500 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chunkCount: { type: Number, default: 0 },
    embeddingVector: { type: [Number], index: 'vector' }
  },
  { timestamps: true }
);

knowledgeDocSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
