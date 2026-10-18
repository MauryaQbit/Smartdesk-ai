const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    senderType: { type: String, enum: ['user', 'agent', 'ai'], default: 'user' },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    confidence: { type: Number, min: 0, max: 1, default: null },
    sources: [{
      title: { type: String, trim: true },
      source: { type: String, trim: true },
      score: { type: Number, min: 0, max: 1 }
    }],
    aiFeedback: { type: String, enum: ['helpful', 'not_helpful'], default: null },
    internal: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
