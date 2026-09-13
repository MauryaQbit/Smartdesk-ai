const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['user', 'agent', 'ai'], default: 'user' },
    text: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
